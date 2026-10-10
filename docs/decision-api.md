# Zils decision API

The Zils decision API answers choice, yes/no, and score questions using a shared
model or an accepted private model available to your account. It supports individual
prediction requests and asynchronous bulk jobs.

Send your input and questions with a Zils API key, and select a model by ID or
alias. Start with the [API quickstart](https://docs.zils.ai/getting-started/quickstart)
for a complete curl example.

## Hosted service

The current hosted API base is `https://training.zils.ai/decision`. Sign in at
[zils.ai/train](https://zils.ai/train) to manage account API keys. Use the
`zils-shared` alias or a model ID available to your account. The H2O training default does not repoint the shared alias; see [model profiles](/getting-started/models).
Training uses `https://training.zils.ai`; predictions use its `/decision` route.
Use the hosted endpoint with your API key. Operators running their own service
can follow [Deploy the decision API](decision-api-deployment.md).

## Request and credential contract

| Operation | Credential | Result |
| --- | --- | --- |
| `POST /v1/keys` with `{"name":"production"}` | Supabase user access token | Key metadata and a secret shown once |
| `GET /v1/keys` | Supabase user access token | Key metadata |
| `POST /v1/keys/{id}/revoke` with `{}` | Supabase user access token | Revoked key metadata |
| `GET /v1/models` | Zils API key | Accessible model names and aliases |
| `POST /v1/systemone` | Zils API key | Typed answers and input/output token counts |

Send credentials as `Authorization: Bearer ...`. Prediction and bulk endpoints
use your Zils API key. Key-management endpoints use the signed-in user's Supabase
Auth access token. You can also create and revoke keys in the
[Zils dashboard](https://zils.ai/train). A revoked key cannot authorize new requests.

An API key identifies your account. Select a model using its ID or an alias such
as `zils-shared`. Shared models and private models available to your account appear
in `GET /v1/models`; unknown and unauthorized model names both return 404.
Prediction requests do not train a model or change its weights.

An [example commerce request](../examples/zils-api/request.json) asks Choice,
Noul, and Score questions about one state. Responses retain question IDs:

```json
{"model":"zils-jevk5-v0.3-r1","answers":{"compatible":{"type":"noul","noul":0.9}},"usage":{"input_tokens":120,"output_tokens":0}}
```

This is an illustrative response, not a recorded quality result. `noul` is the
probability of true; Choice includes the selected name, probabilities, and
confidence; Score includes an expected zero-based score, probabilities,
confidence, and the original structured legend. Instructions can be absent/null.
Choice supports 2–255 options and Score supports 2–10 levels. There is no fixed
question-count cap, but body, context, and execution budgets apply.

The wire contract follows the [TypeSafe API](https://docs.typesafe.ai/api) and
[confidence formulas](https://docs.typesafe.ai/confidence). Upstream TypeSafe Python **0.7.2**
and JavaScript **0.6.0** passed local compatibility checks. Zils clients are documented in [SDKs, CLI and MCP](/sdks/overview). Zils' model names,
capacity, validation boundaries, storage, and bulk endpoints are its own. The
TypeSafe OpenAPI allows one Score level while its prose describes 2–10; Zils
uses 2–10. This is compatibility with the tested operations, not a claim of
identical service behavior or TypeSafe's advertised throughput.

## Create a key and call the model

Create an API key in the [Zils dashboard](https://zils.ai/train). Replace
`YOUR_ZILS_API_KEY` in the examples below with that key.

```shell
curl --fail-with-body 'https://training.zils.ai/decision/v1/systemone' \
  -H 'Authorization: Bearer YOUR_ZILS_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "zils-shared",
    "state": {"query": "USB-C cable", "product": "USB-C to USB-C cable"},
    "questions": {
      "match": {"type": "noul", "instructions": "Does this product match?"}
    }
  }'
```

For Node.js 20+, install the published Zils client:

```shell
npm install @zils/sdk
```

Set `ZILS_API_KEY` in your server's secret environment, then call the API:

```javascript
import { ZilsClient, noul } from '@zils/sdk';
const client = new ZilsClient();
const result = await client.systemOne({
  state: { query: 'USB-C cable', product: 'USB-C to USB-C cable' },
  questions: { match: noul('Does this product match?') }
});
console.log(result.answers.match.noul);
```

For Python, follow the [source installation](/sdks/overview#install-from-a-fresh-clone)
(the Python package is not yet on PyPI):

```python
from zils_sdk import Noul, ZilsClient

with ZilsClient() as client:
    result = client.system_one(
        state={"query": "USB-C cable", "product": "USB-C to USB-C cable"},
        questions={"match": Noul(instructions="Does this product match?")},
    )
    print(result.nouls["match"].noul)
```

Zils SDKs disable automatic retries by default. A timeout or lost response may
already have incurred work and billing. Handle `Retry-After` and decide whether
a repeat request is appropriate before opting into retries. SDKs do not put keys
in browser code, infer billing from resource tokens, or train during prediction.

`usage.input_tokens` counts model resource use; `usage.billable_input_tokens`
counts logical input for billing and can be absent on older runtimes. Treat an
absent billable count as unavailable, not as equal to the resource count.

## Bulk jobs

Each JSONL record has a unique `custom_id` and a `body` with the same fields as a
System One request. Save each record on its own line in `input.jsonl`, for example:

```jsonl
{"custom_id":"product-001","body":{"model":"zils-shared","state":{"query":"USB-C cable","product":"USB-C to USB-C cable"},"questions":{"match":{"type":"noul","instructions":"Does this product match?"}}}}
```

Create a batch with your API key:

```shell
curl --fail-with-body 'https://training.zils.ai/decision/v1/batches' \
  -H 'Authorization: Bearer YOUR_ZILS_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"idempotency_key":"my-import-v1"}'
```

Use the returned batch ID and signed upload URL for the remaining operations:

| Operation | Behavior |
| --- | --- |
| `POST /v1/batches` with `{"idempotency_key":"my-import-v1"}` | Returns a batch ID, limits, and an immutable signed PUT upload URL |
| PUT the JSONL bytes to the returned `upload.url` | Use returned headers; do not send the Zils API key to Storage |
| `POST /v1/batches/{id}/submit` with `{}` | Requires a completed upload, freezes available aliases/releases, queues the job |
| `GET /v1/batches/{id}` | Returns status, timestamps, and total/completed/failed counts |
| `POST /v1/batches/{id}/cancel` with `{}` | Stops new work and preserves committed results |
| `GET /v1/batches/{id}/results?after=0` | For terminal jobs, returns up to 20 committed records and `next_cursor` |

All API operations use the current account API key. The signed PUT uses the
returned Storage authorization URL. It cannot replace an uploaded object. Repeat
create with the same idempotency key to recover the batch ID. If the input has
already arrived, the response omits `upload`; submit that batch without uploading
again. Otherwise, `upload` contains a fresh signed destination. Use a new
idempotency key for changed inputs. Repeated submit does not change
versions or duplicate jobs. Signed uploads expire after two hours under
[Supabase Storage's documented behavior](https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl); create again with the same key for a fresh destination.
Upload completion is checked at submit; dataset/schema validation happens in the
worker. Empty, malformed JSONL, duplicate IDs, or invalid envelope IDs fail the
file before any inference. Invalid individual request bodies produce per-record
errors. Bulk rejects U+0000 because PostgreSQL cannot persist that character.

Jobs move through `uploading → queued → validating → running → completed`, or
`failed`, `cancelled`, or `expired`. `completed` can contain failed records.
A result is either `{"custom_id":"...","response":{...normal response...}}` or
`{"custom_id":"...","error":{"status":422,"code":"...","message":"..."}}`.
Results remain in input order among committed records. Cancelled jobs omit
unfinished records; counts and status distinguish this from successful completion.

Transient model failures permit up to three attempts; capacity errors wait until
the job deadline. A request may be recomputed after an interruption, so exactly-once
execution is not promised. Removing access to a model can cause unfinished
records to fail.

Revoking the submitting key does not cancel a job; another valid key on the same
account can poll/cancel/download it. Disabling an account prevents new worker
claims and fences writes. Already-running GPU work may finish. A key cannot read
another account's job, and miners receive none of these bulk records.

To read a page of results, replace `YOUR_BATCH_ID` with the returned batch UUID
and `YOUR_ZILS_API_KEY` with your key:

```shell
curl --fail-with-body 'https://training.zils.ai/decision/v1/batches/YOUR_BATCH_ID/results?after=0' \
  -H 'Authorization: Bearer YOUR_ZILS_API_KEY'
```

The response contains up to 20 records in `data`. If `next_cursor` is not null,
use it as the next request's `after` value. Continue until `next_cursor` is null
to read all committed results. Each page requires a valid API key.

## Capacity, usage, and retention

Default operational boundaries are **1 MiB per decision request**, JSON depth 32,
**4,096 tokens per rendered model pass**, **65,536 reserved input tokens across a
request**, **25 MiB / 10,000 records per bulk file**, and **24 hours per batch**.
Large Choice requests use multiple passes. The adaptive final pass uses a
conservative UTF-8 byte bound for admission, so long descriptions can be rejected
even when a particular outcome would fit. No truncation is performed.

Self-hosted deployments may configure different token boundaries. These are
execution bounds, not trained context quality claims. One GPU executes serially, with at most one pending real-time
request and one pending bulk request. When both lanes wait, at most four
real-time executions precede the waiting bulk execution. The 30-second execution
wait can return 504 while the GPU remains occupied; it never opens a second
execution slot prematurely. Full lanes return 529. HTTP connection concurrency
is bounded to 32 per service; the hosted edge can impose additional limits.

Rate limits apply across all API keys belonging to the same account. Requests
reserve their worst-case token work; unused reservations are not refunded. A
single request must fit within the account's entire per-second token allowance.
For temporary throttling, back off and honor `Retry-After`.

Real-time input/output bodies are not persisted by these services. Bulk inputs,
request records, and committed results are retained for seven days after a
terminal state, then deleted by the worker. Result access returns 410 after that
period even if cleanup is delayed. Batch metadata and usage records are retained
for 30 days. Cleanup runs at most once a minute during worker processing; outages
can delay physical deletion. Storage backups and copies already downloaded are
outside this deletion mechanism.

## Verification and measured scope

The implementation has local HTTP, real PostgreSQL, official SDK, and RTX 4090
runtime checks. A hosted smoke check also verified key creation/revocation,
real inference, private Supabase uploads, retry recovery, and account isolation.
Its four-record synthetic bulk job completed three valid records and returned
one expected validation error. This verifies the workflow, not customer model
quality or production capacity. There is no billing, measured service-level
guarantee, or open-miner inference network. Adapter activation is gated on
acceptance and verified serving; it never promotes a rejected candidate. Onboarding
is a separate service.

For reproduction commands and infrastructure checks, use
[Verify the deployment](decision-api-deployment.md#verify-the-deployment).

The 2026-10-04 hardware smoke used the pinned BF16 JevK5 release, eager execution,
and synthetic commerce inputs on a 24 GB RTX 4090. The private runtime's HTTP
preflight and inference endpoints were exercised; elapsed times below measure the
inference HTTP call, excluding startup, hashing, and the separate preflight.
Another model was resident but idle, so this was not an isolated performance run.

| Synthetic request | Actual input tokens | Reserved tokens | One observed call |
| --- | ---: | ---: | ---: |
| Choice + Noul + Score | 430 | 430 | 0.655 s |
| 13 Noul questions | 1,638 | 1,638 | 1.137 s |
| 17 Choice options | 820 | 1,634 | 0.328 s |
| 50 Choice options | 1,600 | 2,422 | 0.496 s |
| 255 Choice options | 6,680 | 7,510 | 1.929 s |

All returned distributions and accounting passed the gateway response validator.
These single requests establish runtime plumbing, not quality improvement,
concurrency capacity, p95 latency, or a service guarantee. Prior adapter comparisons
are separate experiments; these requests did not test an accepted customer adapter.
