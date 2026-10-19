---
title: d3-mini
description: The one served base for text and image decisions, and how training profiles differ from inference names.
---

# d3-mini

**d3-mini 4.5B (`d3-mini-4.5b-v1`) is the only served base since 17 October 2026.** It handles
text and image adapter jobs and decisions. Both the `stable` and `latest` channels name it, by the
owner's decision, recorded as an override of the base tier's promotion rule (its confirmation
draw tied). Each job, candidate and accepted release keeps its own immutable model identity.

| Job or request | Input limits |
| --- | --- |
| Text: yes/no, choice and score questions, up to four images or one video per decision | 4,096 input tokens; up to 255 outcomes |
| Image training job: one canonical PNG and one choice question per example | The processed prompt, photo tokens included, must fit 4,096 tokens; up to 255 outcomes |

Retired and retiring profiles:

- **H2O Lightning 4B** (`h2o-lightning-4b-v1.2.3`) is retiring. Its serving ended on 17 October 2026.
  Existing jobs and releases keep their frozen profile and the [H2O contract](/training/h2o)
  (2,048 prompt tokens). An H2O task moves to d3-mini only through a `base_change` upgrade job.
- **Imajev 4B** (`imajev-4b-v1`) was retired on 17 October 2026. Image jobs now run on d3-mini;
  no Imajev release is registered or served. See [image training](/training/imajev).
- **JevK5 4B** was [retired](/training/jevk5) on 17 October 2026. Its frozen records stay readable;
  nothing creates, trains or serves it.

API request limits also apply. The text API's Score request contract allows
2–10 levels. A profile's training limit does not enlarge every API limit.
Oversized inputs are rejected; the runtime does not silently truncate examples.

## Training defaults and inference names

`GET https://training.zils.ai/v1/config` identifies the default for **new training
jobs**. It reports d3-mini. Changing that default does not convert existing
adapters or replace their base weights. Use the authenticated [model listing](/getting-started/quickstart#_2-list-available-models)
to find inference models available to your account.

After training, use the model ID returned when activation reaches `ready`.
The training profile ID is not an accepted customer model ID. Only a verified,
accepted adapter can be registered for inference.

## Base channels

A text base can advance through two channels. `stable` is the default for new training jobs
and advances only after a promoted base survives a full window on `latest`. `latest` advances when a
candidate is confirmed, passes the regression suite and is promoted in the
[base tier](/operations/base-tier). `latest` is opt-in per job: send `base_channel` on job creation
(`"stable"` or `"latest"`). `GET https://training.zils.ai/v1/config` reports the default
`model` and a `channels` object. When no latest base is configured, `channels.latest` is the same
as `channels.stable`. Since the afternoon of 17 October 2026 both channels name d3-mini
(`d3-mini-4.5b-v1`): the confirmation draw tied, so this is an owner override of the promotion
rule rather than a win under it. The channel is a platform configuration value, not yet a registry alias,
and automatic upgrades that follow `stable` are not implemented.

## Execution on miners

Miners execute model workloads; the hosted platform handles accounts, routing,
job coordination and accepted-release registration. Validators independently
evaluate candidates. Customers call the API without downloading weights.
Bootstrap and test GPUs provide qualification evidence, not the permanent
serving architecture or a guarantee of fleet availability.

A queue miner installs d3-mini, which covers text and image jobs (H2O only if the operator still routes frozen H2O jobs). It advertises only profiles that
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
`acaf0d4ea251e54de928c75ef4352670d33192d3`). Image jobs use the same d3 runtime. Do not combine the environments or transfer one model's qualification to another. A
d3-mini worker is approved explicitly; an H2O qualification does not cover it.

Read the [base tier](/operations/base-tier), [image training](/training/imajev)
and [miner setup](/operations/miners). Earlier speed ratios from a different
runtime do not guarantee performance on the current stack.
