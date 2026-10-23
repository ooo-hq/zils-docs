---
title: z3 model line
description: The z3 decision-model line, founding baselines, elected releases, and compatible model selection.
---

# z3 model line

**z3** is the Zils decision-model line. The first release, **z3-mini v1**,
is a founding baseline using unchanged upstream d3-mini weights. Zils selected
this starting checkpoint; it is not a miner-trained election winner.

Under the z3 release policy, miners train candidates for an enabled lineage.
Validators compare them with its incumbent, and approved winners become new
versioned releases after the required qualification and review. Each size has
its own competition, channels and evidence.

| Model line | Approximate parameters | Release status | Existing immutable profile |
| --- | ---: | --- | --- |
| z3-lite | 0.85B | Planned | `d3-lite-0.8b-v1` |
| z3-nano | 2.21B | Planned | `d3-nano-2.2b-v1` |
| z3-mini | 4.54B | v1 founding baseline | `d3-mini-4.5b-v1` |
| z3-flash | 8.39B | Planned | `d3-flash-8.4b-v1` |
| z3 | 26.09B | Planned | `d3-26b-v1` |

## Public names and artifact identities

The website uses z3 names. Existing API profile IDs, pool keys, downloaded
artifacts and signed release records retain their original `d3` identities.
Use the exact values returned by the service in requests; the display rename
does not introduce new `z3-*` API aliases. Training profile IDs are also distinct
from callable inference model IDs.

The founding weights are available in the pinned
[Hugging Face repository](https://huggingface.co/zils-ai/z3-mini-v1/tree/c9b7515250c0444192767fc00975402f12421413).
Its original filename and repository names preserve provenance. Future elected
releases must publish their exact checkpoint revision, parent, evaluation
evidence and version. Candidate submissions are not official z3 releases.

## Availability

**Additional pools are staged.** Source registration, published weights and a
catalog entry do not establish hosted availability. Every enabled profile needs
its own qualification at its advertised context limit and input type. Training
and serving availability are separate; mini qualification cannot cover another
pool. The initial reference builds use BF16 and a 4,096-token ceiling. These are
profile contracts, not a claim that any particular GPU is qualified.

| Job or request | Input limits |
| --- | --- |
| Text: yes/no, choice and score questions, up to four images or one video per decision | 4,096 input tokens; up to 255 outcomes |
| Image training job: one canonical PNG and one choice question per example | The processed prompt, photo tokens included, must fit 4,096 tokens; up to 255 outcomes |

Retired and retiring profiles:

- **H2O Lightning 4B** (`h2o-lightning-4b-v1.2.3`) is retiring. Its serving ended on 17 October 2026.
  Existing jobs and releases keep their frozen profile and the [H2O contract](/training/h2o)
  (2,048 prompt tokens). An H2O task moves to z3-mini only through a `base_change` upgrade job.
- **Imajev 4B** (`imajev-4b-v1`) was retired on 17 October 2026. Image jobs now run on z3-mini;
  no Imajev release is registered or served. See [image training](/training/imajev).
- **JevK5 4B** was [retired](/training/jevk5) on 17 October 2026. Its frozen records stay readable;
  nothing creates, trains or serves it.

API request limits also apply. The text API's Score request contract allows
2–10 levels. A profile's training limit does not enlarge every API limit.
Oversized inputs are rejected; the runtime does not silently truncate examples.

## Training defaults and inference names

`GET https://training.zils.ai/v1/config` identifies the default for **new training
jobs**. Its top-level `model` and `channels` retain mini defaults. Changing a default does not convert existing
adapters or replace their base weights. Use the authenticated [model listing](/getting-started/quickstart#_2-list-available-models)
to find inference models available to your account.

After training, use the model ID returned when activation reaches `ready`.
The training profile ID is not an accepted customer model ID. Only a verified,
accepted adapter can be registered for inference.

## Base channels

Each pool has independent `stable` and `latest` channels. A promotion advances
only its own lineage. `latest` is opt-in; `stable` remains the default. Both resolve
to an immutable profile when a job is created. Later channel updates do not change
that job or its accepted adapter. Existing mini IDs, releases and king history
remain unchanged. Withdrawn candidates stay historical and are not z3 releases.

When configured, `GET /v1/config` adds a `pools` object. Each entry contains channel
profiles, token limits and availability for training, serving, text and images.
The website shows unavailable choices but prevents new submissions to them. A
service without the pool catalog retains the existing single-model experience.

To select through `POST /v1/jobs`, add these fields to the normal job request:

```json
{"pool":"d3-lite","base_channel":"stable","model":"d3-lite-0.8b-v1"}
```

The optional exact `model` prevents a channel change between discovery and job
creation from silently selecting a different base. All supplied fields must
agree. Unknown, disabled and unqualified choices are rejected. An accepted
training profile ID is not an inference alias; use the model ID returned after
activation reaches `ready`.

The matching [CLI source](/training/cli) accepts `--pool`, `--base-channel` and
`--model`. A source change does not publish a package or activate a hosted pool.
Automatic upgrades following a channel are not implemented.

## Execution on miners

Miners execute model workloads; the hosted platform handles accounts, routing,
job coordination and accepted-release registration. Validators independently
evaluate candidates. Customers call the API without downloading weights.
Bootstrap and test GPUs provide qualification evidence, not the permanent
serving architecture or a guarantee of fleet availability.

A queue miner installs the exact profiles it is qualified to run (H2O only if the operator still routes frozen H2O jobs). It advertises only profiles that
are individually approved and have enough free memory. One worker processes
training jobs serially; separate qualified workers can run workloads in parallel.
Each model uses its own pinned runtime and release directory. The current queue
does not by itself implement open, permissionless miner discovery or inference
routing to arbitrary public miners.

## Runtime qualification

The z3-mini founding baseline retains the original d3 runtime and pins.

The d3-mini runtime uses Python 3.12, PyTorch 2.10 / CUDA 13.0 and FLA 0.5.2 plus
torchvision, pillow and opencv, selected by `ZILS_D3_RUNTIME_PYTHON`; its base is the
byte-identical mirror `zils-ai/d3-mini-4.5b-v1` at revision
`b54402a963373cc44713f18c9596c580e31cc68b`. The control process remains on Python 3.13.
Frozen H2O jobs use the separate H2O runtime (base revision
`acaf0d4ea251e54de928c75ef4352670d33192d3`). Image jobs use the same d3 runtime. Do not combine the environments or transfer one model's qualification to another. A
d3-mini worker is approved explicitly; an H2O qualification does not cover it.

Read the [base tier](/operations/base-tier), [image training](/training/imajev)
and [miner setup](/operations/miners). Earlier speed ratios from a different
runtime do not guarantee performance on the current stack.
