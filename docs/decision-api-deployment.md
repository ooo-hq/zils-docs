# Deploy the decision API

Hosted code lives in `zils-platform`; see [platform installation](/operations/platform-setup#source-installation). This guide records the original shared JevK5 serving path, which remains in source for existing registry entries; JevK5 was retired on 17 October 2026. d3-mini, the only served base, uses the [d3 adapter runtime](/operations/d3#serving-accepted-adapters).

This guide is for operators running their own Zils decision API. It covers the
database, model runtime, gateway, bulk processor, and operational checks.
Customers calling the hosted service can use the [API reference](decision-api.md)
without provisioning these resources.

## Start from a fresh clone

Use Python 3.13 and Git on macOS, Linux, or WSL 2. The gateway/worker need no GPU.
The private model runtime requires Linux or WSL 2, CUDA, and enough GPU memory
for BF16 JevK5. The hardware check used a 24 GB RTX 4090. Run from the repository
root; keep credentials and customer data in ignored `.private/` storage.

```bash
git clone https://github.com/ooo-hq/zils.git
git clone https://github.com/ooo-hq/zils-platform.git
cd zils-platform
git -C ../zils checkout "$(cat subnet-ref.txt)"
python3.13 -m venv .venv-api
.venv-api/bin/python -m pip install -e ../zils -e .
mkdir -p .private/api
cp examples/zils-api/service.env.example .private/api/service.env
chmod 600 .private/api/service.env
```

Replace the environment placeholders with your Supabase project URL, server
service-role key, and a newly generated runtime secret. Enable Supabase Auth and
Storage. Use the same strong runtime secret on the gateway, bulk worker, and GPU
runtime; never give it or the service-role key to customers or miners.

Review and apply these additive migrations once to the intended project. Use a
privileged connection supplied by the operator as `SUPABASE_DB_URL`:

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/202610040001_decision_api.sql
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/202610040002_decision_batches.sql
```

These create only the `zils_api_*` resources and private `zils-api-batches`
bucket. They do not alter the existing training queue. Supabase Auth/Storage
schemas must already exist. The bucket accepts at most 25 MiB per upload;
project-wide Storage limits must permit that size. A restrictive policy blocks
client access even when other Storage policies are broadly permissive.

On the GPU host, use a separate environment and explicitly download the pinned
model revision (roughly 8.4 GB of weights):

```bash
python3.13 -m venv .venv-jev
.venv-jev/bin/python -m pip install -r requirements/jevk5.txt
.venv-jev/bin/python -m pip install --no-deps -r ../zils/requirements/jevk5-source.txt -e ../zils -e .
.venv-jev/bin/python ../zils/scripts/download_jevk5.py --out models/jevk5
set -a
. .private/api/service.env
set +a
.venv-jev/bin/python -m zils_platform.jev_server --model-dir models/jevk5
```

The downloader creates `models/jevk5/release.json`. Startup verifies all recorded
file hashes and the installed JevK5 runtime commit, then loads local weights with
network model downloads disabled. CUDA graphs are disabled for this release.
Keep the runtime on its loopback port **8921**. If the gateway runs elsewhere,
use an authenticated private tunnel or an HTTPS proxy with restricted access;
remote plaintext HTTP URLs are rejected.

Create the gateway registry from that release manifest. For separate hosts,
copy just the manifest to `models/jevk5/release.json` on the gateway first; model
weights are needed only by the runtime. Replace the runtime URL below when using
a private tunnel/proxy:

```bash
.venv-api/bin/python - <<'PY'
import json
from pathlib import Path
release = json.loads(Path("models/jevk5/release.json").read_text())
entry = {
    "id": release["release_id"], "fingerprint": release["fingerprint"],
    "aliases": ["zils-shared"], "owners": None,
    "url": "http://127.0.0.1:8921", "token_env": "ZILS_RUNTIME_TOKEN",
    "release_date": "2026-10-04", "description": "Shared BF16 JevK5 decision model"
}
Path(".private/api/models.json").write_text(json.dumps({"models": [entry]}, indent=2))
PY
set -a
. .private/api/service.env
set +a
.venv-api/bin/python -m zils_platform.api --registry .private/api/models.json
```

In a second terminal with the same environment loaded:

```bash
.venv-api/bin/python -m zils_platform.batches --registry .private/api/models.json
```

The gateway listens on loopback **8920**. These bounded threaded HTTP servers
are service processes, not internet edge servers. Put the gateway behind an HTTPS
reverse proxy with connection/body/time limits. Supply `--origin https://YOUR_APP`
for an exact browser origin when connecting the separate onboarding app. Run the
worker under a supervisor; it owns deadline expiry, retries, and retention cleanup.
Do not log Authorization headers, real-time bodies, or signed upload URLs at the
proxy. The Python handlers do not log bodies or private exception details.

## Authentication and model access

Send credentials as `Authorization: Bearer ...`. Multiple keys belong to one
account; there is no fixed key-count cap. Keys contain a random identifier and
256 bits of random secret material. Only SHA-256 digests and display metadata
are stored. Authentication uses constant-time digest comparison and checks
revocation/account status for every request. Key-management sessions are verified
with Supabase Auth. Database tables and privileged RPCs are service-role-only.

A key authenticates the account; it does not select or train a model. An
operator-managed registry maps an alias such as `zils-shared` to an immutable
release and fingerprint. `owners: null` makes that release shared; a UUID list
restricts it to those accounts. Unknown and unauthorized names return the same
404. Both preflight and execution verify the runtime's actual release identity.

For private customer models and verified adapter activation, follow
[Deploy customer models](customer-adapter-serving.md) and the
[automatic training workflow](automatic-training.md).

## Configure account limits

Account settings live in `zils_api_accounts`: `requests_per_second`,
`tokens_per_second`, `max_active_batches`, and `max_batch_storage_bytes`.
They default to SQL NULL (no configured account quota) for local evaluation.
**Set them before exposing the service to customers**, using measured capacity
and your storage budget. For example, with operator-chosen psql variables:

```sql
update public.zils_api_accounts
set requests_per_second = :'rps'::integer,
    tokens_per_second = :'tps'::bigint,
    max_active_batches = :'active_batches'::integer,
    max_batch_storage_bytes = :'retained_bytes'::bigint
where owner_id = :'account_id'::uuid;
```

The account row is created when its first API key is issued. Positive configured
values apply to all its keys. RPS/TPS use atomic fixed UTC-second windows; each
admission reserves its worst-case token work. Unused reservations are not refunded.
Configure TPS to accommodate the largest single-request reservation: a smaller
ceiling continually throttles that request until it is split or the budget is raised.
Actual successful input usage is recorded separately; unknown/failed work is not
invented as zero usage or treated as a bill. This prototype implements no charges.
Each non-purged batch reserves 25 MiB of input Storage capacity, including failed
and cancelled jobs, until retention cleanup. Database body/result storage is
additional; this byte budget is an input-object reservation, not a whole-database
size guarantee. Create admission is atomic across keys. There is no hardcoded
60/minute policy or claim that one GPU provides TypeSafe's service capacity.

## Operate bulk processing

Worker claims expire after 120 seconds and renew every 30 seconds. Each worker
processes one record before releasing a batch, so a large job does not monopolize
the queue. Transient model failures permit three attempts; 429/529 wait for capacity
until the job deadline. Interrupted database/storage work recovers after lease
expiry. Result publication and successful usage commit atomically. A crash after
inference but before commit can recompute; exactly-once GPU execution is not
promised. Retain old approved releases in the registry while submitted batches
need them. Removing access or a release can cause those records to fail.

Keep the bulk processor running even when no jobs are queued: it also performs
retention cleanup. Monitor failures and storage growth. The public
[capacity and retention contract](decision-api.md#capacity-usage-and-retention)
describes what callers can expect; publish any changes to configured limits.

## Verify the local API

`SUPABASE_ACCESS_TOKEN` below is the signed-in user's session access token,
obtained by your Auth client. It is different from the project's service-role key.
The response contains a secret: store it privately before closing the session.

```bash
export ZILS_URL=http://127.0.0.1:8920
curl --fail-with-body "$ZILS_URL/v1/keys" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H 'Content-Type: application/json' -d '{"name":"development"}'
```

Set `ZILS_API_KEY` to the returned `key`, then:

```bash
curl --fail-with-body "$ZILS_URL/v1/systemone" \
  -H "Authorization: Bearer $ZILS_API_KEY" -H 'Content-Type: application/json' \
  --data-binary @examples/zils-api/request.json
```

To use the SDKs against this deployment, set their base URL to the gateway URL
and authenticate with a key issued by this installation. The
[client examples](decision-api.md#create-a-key-and-call-the-model) show the request
contract against hosted Zils.

## Export local batch results

To export results, set `BATCH_ID` to the returned UUID. The downloader reads
`ZILS_API_KEY` from its environment, so export the key in this terminal first:

```bash
.venv-api/bin/python -m scripts.download_batch --url "$ZILS_URL" \
  --batch "$BATCH_ID" --out .private/api/results.jsonl
```

Use a new output filename. Interrupted exports remove their incomplete file;
custom integrations can page using the returned cursor. The API rechecks the
current key on every page.

## Verify the deployment

```bash
.venv-api/bin/python -m pip install -r requirements/api-test.txt
.venv-api/bin/python -m pip install --no-deps -r requirements/jevk5-source.txt
make check-api PYTHON=.venv-api/bin/python
ZILS_PG_BIN=/PATH/TO/POSTGRESQL16/bin make check-queue-db PYTHON=.venv-api/bin/python
npm install --prefix .private/api-sdk --no-audit --no-fund @typesafe-ai/sdk@0.6.0
.venv-api/bin/python -m scripts.check_api_sdks \
  --js-module .private/api-sdk/node_modules/@typesafe-ai/sdk/dist/index.mjs
```

Replace `ZILS_PG_BIN` with the directory containing `initdb`, `pg_ctl`, and `psql`,
or omit it when they are on PATH. The database checker creates a disposable
cluster; it never connects to the configured Supabase project. The SDK check
uses fixture model probabilities on loopback and does not call TypeSafe's API.
For the repository-wide suite, follow [development setup](development.md) and
install `requirements/jevk5-source.txt` with `--no-deps` into that environment too.

The [API verification record](decision-api.md#verification-and-measured-scope)
reports the measured hardware checks and their limits. Passing fixture or smoke
checks does not establish customer quality or production capacity.
