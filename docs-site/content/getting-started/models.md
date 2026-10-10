---
title: H2O and Imajev
description: Choose the pinned text or image profile and distinguish training from inference.
---

# H2O and Imajev

Zils supports both models. **H2O Lightning 4B is the default base for new text
adapter jobs. Imajev 4B handles image-and-text decisions and image adapters.**
Each job, candidate and accepted release keeps its own immutable model identity.

| Profile | Use | Input limits |
| --- | --- | --- |
| `h2o-lightning-4b-v1.2.3` | Text adapters: choice, true/false and score | 2,048 full prompt tokens; up to 255 outcomes in the training contract |
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
Python 3.13. Imajev uses a separate pinned image runtime. Do not combine the two
environments or transfer one model's qualification to the other.

Read the [H2O contract](/training/h2o), [Imajev runtime guide](/training/imajev)
and [miner setup](/operations/miners). The H2O 4090 check established training
and adapter reload on that hardware. Earlier speed ratios from a different
runtime do not guarantee performance on the current stack.
