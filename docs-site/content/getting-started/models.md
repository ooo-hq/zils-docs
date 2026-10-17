---
title: d3-mini and Imajev
description: Choose the pinned text or image profile and distinguish training from inference.
---

# d3-mini and Imajev

Zils serves two current profiles. **d3-mini 4.5B is the base for new text adapter jobs: since
17 October 2026 both the `stable` and `latest` channels name it, by the owner's decision and
recorded as an override of the base tier's promotion rule (its confirmation draw tied).
Imajev 4B handles image-and-text decisions and image adapters until its own retirement.**
Each job, candidate and accepted release keeps its own immutable model identity.

| Profile | Use | Input limits |
| --- | --- | --- |
| `d3-mini-4.5b-v1` | Text, up to four images and one video; yes/no, choice and score questions | 4,096 input tokens; up to 255 outcomes |
| `imajev-4b-v1` | One image plus text; one choice question | Up to 4,096 actual tokens and 400,000 processor pixels; 2–16 outcomes |

Existing **H2O Lightning 4B** (`h2o-lightning-4b-v1.2.3`) jobs and releases keep their frozen
profile and the [H2O contract](/training/h2o) (2,048 prompt tokens, up to 255 outcomes); H2O
serving ended on 17 October 2026 and an H2O task moves to d3-mini only through a `base_change`
upgrade job. **JevK5 4B** is [retired](/training/jevk5): its frozen records stay readable and
nothing creates, trains or serves it.

API request limits also apply. The text API's Score request contract allows
2–10 levels. A profile's training limit does not enlarge every API limit.
Oversized inputs are rejected; the runtime does not silently truncate examples.

## Training defaults and inference names

`GET https://training.zils.ai/v1/config` identifies the default for **new training
jobs**. It now reports d3-mini. Changing that default does not convert existing
H2O adapters or replace their base weights. Use the authenticated [model listing](/getting-started/quickstart#_2-list-available-models)
to find inference models available to your account.

After training, use the model ID returned when activation reaches `ready`.
The training profile ID is not an accepted customer model ID. Only a verified,
accepted adapter can be registered for inference.

## Base channels

A text base can advance through two channels. `stable` is the default for new training jobs
and advances at most quarterly, to a base that held `latest` through a full sealed-set window with
no rollback. `latest` advances when a candidate is confirmed and passes the regression suite of the
[base tier](/operations/base-tier). `latest` is opt-in per job: send `base_channel` on job creation
(`"stable"` or `"latest"`). `GET https://training.zils.ai/v1/config` reports the default
`model` and a `channels` object. When no latest base is configured, `channels.latest` is the same
as `channels.stable`; when one is configured, for example d3-mini, it appears under
`channels.latest`. Since the afternoon of 17 October 2026 both channels name d3-mini
(`d3-mini-4.5b-v1`): the confirmation draw tied, so this is an owner override of the promotion
rule rather than a win under it. The channel is a platform configuration value, not yet a registry alias,
and automatic upgrades that follow `stable` are not implemented.

## Execution on miners

Miners execute model workloads; the hosted platform handles accounts, routing,
job coordination and accepted-release registration. Validators independently
evaluate candidates. Customers call the API without downloading weights.
Bootstrap and test GPUs provide qualification evidence, not the permanent
serving architecture or a guarantee of fleet availability.

A queue miner can install d3-mini, Imajev or both (H2O only for frozen H2O jobs). It advertises only profiles that
are individually approved and have enough free memory. One worker processes
training jobs serially; separate qualified workers can run workloads in parallel.
Each model uses its own pinned runtime and release directory. The current queue
does not by itself implement open, permissionless miner discovery or inference
routing to arbitrary public miners.

## Runtime qualification

The d3-mini runtime uses Python 3.12, PyTorch 2.10 / CUDA 13.0 and FLA 0.5.2 plus
torchvision, pillow and opencv, selected by `ZILS_D3_RUNTIME_PYTHON`; its base is the
byte-identical mirror `zils-ai/d3-mini-4.5b-v1` at revision
`b54402a963373cc44713f18c9596c580e31cc68b`. The control process remains on Python 3.13.
Frozen H2O jobs use the separate H2O runtime (base revision
`acaf0d4ea251e54de928c75ef4352670d33192d3`). Imajev uses a separate pinned image runtime. Do not combine the environments or transfer one model's qualification to another. A
d3-mini worker is approved explicitly; an H2O qualification does not cover it.

Read the [base tier](/operations/base-tier), [Imajev runtime guide](/training/imajev)
and [miner setup](/operations/miners). Earlier speed ratios from a different
runtime do not guarantee performance on the current stack.
