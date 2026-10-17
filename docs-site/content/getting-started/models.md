---
title: H2O, d3-mini and Imajev
description: Choose the pinned text, multimodal or image profile and distinguish training from inference.
---

# H2O, d3-mini and Imajev

Zils supports three current profiles. **H2O Lightning 4B is the default base for new text
adapter jobs. Imajev 4B handles image-and-text decisions and image adapters. d3-mini is merged
and available to qualified miners and validators, but it is not the default for new jobs.**
Each job, candidate and accepted release keeps its own immutable model identity.

| Profile | Use | Input limits |
| --- | --- | --- |
| `h2o-lightning-4b-v1.2.3` | Text adapters: choice, true/false and score | 2,048 full prompt tokens; up to 255 outcomes in the training contract |
| `d3-mini-4.5b-v1` | Text, up to four images and one video; yes/no, choice and score questions | 4,096 input tokens; up to 255 outcomes. Available to qualified miners and validators; not the default for new jobs |
| `imajev-4b-v1` | One image plus text; one choice question | Up to 4,096 actual tokens and 400,000 processor pixels; 2–16 outcomes |
| `jevk5-4b-v0.3` | Existing text jobs and compatible releases | Keep the original job's limits and reference |

API request limits also apply. The text API's Score request contract allows
2–10 levels. The H2O profile's training limit does not enlarge every API limit.
Oversized inputs are rejected; the runtime does not silently truncate examples.

## Training defaults and inference names

`GET https://training.zils.ai/v1/config` identifies the default for **new training
jobs**. It now reports H2O. Changing that default does not convert existing
JevK5 adapters, replace their base weights, or repoint the `zils-shared` inference
alias. Use the authenticated [model listing](/getting-started/quickstart#_2-list-available-models)
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
`channels.latest`. As of 17 October 2026 the channel is a platform configuration value, not yet a
registry alias, and automatic upgrades that follow `stable` are not implemented.

## Execution on miners

Miners execute model workloads; the hosted platform handles accounts, routing,
job coordination and accepted-release registration. Validators independently
evaluate candidates. Customers call the API without downloading weights.
Bootstrap and test GPUs provide qualification evidence, not the permanent
serving architecture or a guarantee of fleet availability.

A queue miner can install H2O, Imajev or both. It advertises only profiles that
are individually approved and have enough free memory. One worker processes
training jobs serially; separate qualified workers can run workloads in parallel.
Each model uses its own pinned runtime and release directory. The current queue
does not by itself implement open, permissionless miner discovery or inference
routing to arbitrary public miners.

## Runtime qualification

H2O uses Python 3.12, PyTorch 2.10 / CUDA 13.0 and FLA 0.5.2. Its exact base revision
is `acaf0d4ea251e54de928c75ef4352670d33192d3`. The control process remains on
Python 3.13. The d3-mini runtime is also separate, with the same PyTorch and CUDA pins as H2O plus
torchvision, pillow and opencv, selected by `ZILS_D3_RUNTIME_PYTHON`. Imajev uses a separate pinned image
runtime. Do not combine the environments or transfer one model's qualification to another. A
d3-mini worker is approved explicitly; an H2O qualification does not cover it.

Read the [H2O contract](/training/h2o), [Imajev runtime guide](/training/imajev)
and [miner setup](/operations/miners). The H2O 4090 check established training
and adapter reload on that hardware. Earlier speed ratios from a different
runtime do not guarantee performance on the current stack.
