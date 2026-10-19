# d3-mini rollout

Since 17 October 2026 d3-mini (`d3-mini-4.5b-v1`) is the only served base: the
hosted platform names it on both [base channels](version-selection.md#base-channels)
(`ZILS_TRAINING_MODEL` and `ZILS_TRAINING_MODEL_LATEST`), and image training and
decisions also run on d3 (`zils_platform/image_api.py`). H2O serving is off and
H2O is retiring; JevK5 and ImaJev are retired. Existing jobs and releases keep
their frozen profiles. This guide was first written for the `latest` channel; the
same install, qualification and serving steps apply to `stable`.

## Install and qualify

Upgrade order matters. From this release, every text registry entry (H2O and JevK5
as well as d3) records its pinned `profile`, and gateways on older code refuse
such entries. Upgrade and restart the API, batch and image gateways and any
`register_command` host first; only then upgrade the workflow and processor that
write registry entries. In the other order, a remote registration fails and an
older gateway silently keeps its previous catalog until restarted. The reverse
is also strict: once newer code has written an entry with a `profile`, an
older-code workflow retrying that release is refused, so do not roll the writer
back while keeping its entries.

1. Install the subnet source pinned by `subnet-ref.txt` and complete its
   [d3 miner setup](https://github.com/ooo-hq/zils/blob/main/docs/queue-miners.md#2-install-and-verify-the-reference).
   Keep the Python 3.13 platform environment and install d3's separate Python
   3.12 GPU environment (`.venv-d3`) and `models/d3-reference`. Set
   `ZILS_D3_RUNTIME_PYTHON` on miners and processors.
2. Rehearse `202610170001_d3_training_profile.sql` with `make check-queue-db`, then
   apply it through the existing migration ledger. It adds d3-mini and updates
   profile routing; it does not rewrite jobs, releases, leases, qualifications or
   historical evidence.
3. Qualify each d3 worker on its actual hardware, including training and adapter
   reload at the 4,096-token boundary. Register its exact profile/runtime hashes
   in `zils_worker_profiles` with the measured memory guard and evidence; the
   database refuses a d3 `min_free_mib` below 12,288. d3 approval is explicit: an
   H2O or JevK5 qualification does not qualify a worker for d3.
4. Start processors with the d3 reference plus the references needed by existing
   jobs and by base-change upgrades (the H2O reference while H2O tasks can move to
   d3). Start miners with the same references. Then set
   `ZILS_TRAINING_MODEL_LATEST=d3-mini-4.5b-v1` on the training API and processor.
   For `stable`, also set `ZILS_TRAINING_MODEL=d3-mini-4.5b-v1` (the subnet's
   default is still H2O when it is unset). Verify `/v1/config` lists d3-mini
   under `channels` and a newly created job exposes the d3 profile.

From the subnet checkout, the hashes for operator registration are:

```bash
.venv-kev/bin/python -c 'import json; from zils import models; from zils.miner_grading import trainer_identity; print(json.dumps({**models.profile_identity(models.D3), "trainer_sha256": trainer_identity(models.D3)}))'
```

The processor uses the existing platform command with the d3 reference added:

```bash
export ZILS_D3_RUNTIME_PYTHON=/absolute/path/to/zils/.venv-d3/bin/python
# Only while frozen H2O jobs remain:
export ZILS_H2O_RUNTIME_PYTHON=/absolute/path/to/zils/.venv-h2o/bin/python
.venv-platform/bin/python -m zils_platform.coordinator process \
  --state .private/processor --reference /absolute/path/to/zils/models/d3-reference \
  --additional-reference /absolute/path/to/zils/models/h2o-reference \
  --device cuda
```

Load the existing server environment before running this command. `--reference`
must match `ZILS_TRAINING_MODEL`. Only include additional references installed
and retained by the operator for pending jobs. Keep the same protected
`ZILS_COMPUTE_LOCK` across all processes sharing a GPU. A runtime upgrade changes
trainer fingerprints; graded routing needs fresh d3 benchmark contexts and
qualification reports. H2O and JevK5 scores cannot qualify d3 jobs.

Add a separate `d3` section to the existing workflow configuration. It uses the
same fields as the `h2o` section: `hotkey`, `min_free_mib`, `releases`,
`runtime_url`, `token_env`, and either `registry` or `register_command`. Retain the
`h2o` section only while H2O jobs remain (it is optional). The original
top-level fields are still required and serve legacy-profile jobs. The d3 release directory must differ
from every other section's directory, and its measured `min_free_mib` must be at
least 12,288. Optional `training_services`, `nvidia_smi`, `gateway_runtime_url`, and
`release_group` retain their existing meanings. In fixed routing, missing d3
configuration leaves its jobs waiting rather than assigning them to another runtime.
In graded routing, d3 jobs are still reserved and trained, then sit in
`activation_failed` (retrying) until the d3 section exists.

## Serving accepted adapters

Each adapter runtime loads one pinned base, so run one adapter-server process per
base. Keep d3 releases in their own private release directory and route their
registry entries to the d3 runtime. A runtime rejects mixed-base catalogs and never
loads an H2O or JevK5 adapter into d3. The d3 runtime accepts 4,096 tokens per
question and advertises that limit as `max_pass_tokens`; the existing
`--shared-model-dir` mode remains JevK5-only.

Run d3 adapter serving with the subnet's `.venv-d3` Python 3.12 interpreter, the
subnet and platform source checkouts on `PYTHONPATH`, and the platform's
`requirements/api.txt` plus the subnet's `requirements/rehearsal.txt` installed in
that isolated environment. Do not install the platform package itself into the
Python 3.12 environment; its control-plane package requires Python 3.13. Keep
runtime credentials server-side and preserve the existing loopback HTTP contract.
Publish and activate only adapters that passed the independent evaluator.

For example, with a privately provisioned `ZILS_D3_ADAPTER_RUNTIME_TOKEN`:

```bash
export ZILS_SUBNET_DIR=/absolute/path/to/zils
export ZILS_PLATFORM_DIR=/absolute/path/to/zils-platform
uv pip install --python "$ZILS_SUBNET_DIR/.venv-d3/bin/python" \
  -r "$ZILS_PLATFORM_DIR/requirements/api.txt" -r "$ZILS_SUBNET_DIR/requirements/rehearsal.txt"
mkdir -p .private/d3-releases
PYTHONPATH="$ZILS_SUBNET_DIR:$ZILS_PLATFORM_DIR" "$ZILS_SUBNET_DIR/.venv-d3/bin/python" \
  -m zils_platform.adapter_server --releases .private/d3-releases \
  --reference "$ZILS_SUBNET_DIR/models/d3-reference" --port 8934 \
  --token-env ZILS_D3_ADAPTER_RUNTIME_TOKEN
```

`--reference` starts an empty d3 adapter slot before the first release exists.
Add `--image-store-origin` (the signed canonical image origin) to accept up to four
images per request; without it image requests return 503.
Only verified accepted releases are exposed through the runtime health catalog.

A minimal `zils-d3-adapter.service` unit; replace the absolute paths, and keep
`ZILS_D3_ADAPTER_RUNTIME_TOKEN` in the private environment file (mode 0600):

```ini
[Unit]
Description=Zils d3-mini customer adapter runtime
After=network.target

[Service]
WorkingDirectory=/absolute/path/to/zils-platform
EnvironmentFile=/absolute/path/to/zils-platform/.private/d3-adapter.env
Environment=PYTHONPATH=/absolute/path/to/zils:/absolute/path/to/zils-platform
ExecStart=/absolute/path/to/zils/.venv-d3/bin/python -m zils_platform.adapter_server \
  --releases /absolute/path/to/zils-platform/.private/d3-releases \
  --reference /absolute/path/to/zils/models/d3-reference --port 8934 \
  --token-env ZILS_D3_ADAPTER_RUNTIME_TOKEN
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

The server binds 127.0.0.1 only. Point the `d3` workflow section's `runtime_url`
and `token_env` at this runtime.

## Rollback

Point `ZILS_TRAINING_MODEL` or `ZILS_TRAINING_MODEL_LATEST` at another profile on
the training API and processor to change subsequent jobs on that channel. H2O
serving has been off since 17 October 2026, so restore H2O workers, references
and serving before moving a channel back to it; JevK5 is retired and is not a
rollback target. Keep d3
references, workers and serving processes available for d3 jobs and releases
already created. Do not delete the additive migration or mutate frozen profiles.
Retain the previous code/runtime installations until the replacement passes its
hardware checks. Source changes alone do not update a running service.
