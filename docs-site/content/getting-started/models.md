---
title: z3 model line
description: The z3 decision models, their sizes and limits, and which model IDs to use.
---

# z3 model line

**z3** is the Zils family of decision models. Each size is a separate **soup pool** on
the network: miners commit model bodies, and validators average the bodies that
improve the pool into its next release (see [Soup pool](/operations/soup)).

The first release, **z3-mini v1**, is the unchanged upstream d3-mini checkpoint.
Zils adopted it as the founding baseline on 17 October 2026; it is not a
miner-trained release.

| Model | Approximate parameters | Profile ID | Soup pool | Input limit |
| --- | ---: | --- | --- | ---: |
| z3-lite | 0.85B | `d3-lite-0.8b-v1` | `d3-lite`, open at launch | 4,096 tokens |
| z3-mini | 4.54B | `d3-mini-4.5b-v1` | `d3-mini`, open at launch | 8,192 tokens |
| z3-flash | 8.39B | `d3-flash-8.4b-v1` | `d3-flash`, opens later | 4,096 tokens |
| z3 | 26B | `d3-ultra-26b-v1` | `d3`, opens later | 4,096 tokens |

Hosted decisions and hosted training use **z3-mini**. The other sizes are network
pools; `GET https://training.zils.ai/v1/config` lists which of them, if any, a
hosted account can train or call.

## Names and IDs

The website uses z3 names. API profile IDs, pool keys, downloaded artifacts and
signed release records keep their original `d3` identities, and there are no `z3-*`
API aliases. Use the exact values the service returns.

- A **profile ID** such as `d3-mini-4.5b-v1` names a base for training jobs.
- An **inference model ID** names something you can call. `zils-shared` is the shared
  z3-mini base; a trained model gets its own ID when activation reaches `ready`.
  List yours with the [model listing](/getting-started/quickstart#_2-list-available-models).
- A profile ID is not an inference model ID.

The founding weights are in the pinned
[Hugging Face repository](https://huggingface.co/zils-ai/z3-mini-v1/tree/c9b7515250c0444192767fc00975402f12421413).
Every later release publishes its exact checkpoint revision, parents, evaluation
evidence and version.

## z3-mini limits

| Request or job | Limit |
| --- | --- |
| Decision request | 8,192 input tokens per model pass; up to 255 outcomes per question |
| Image decision request | Up to 4 images and 8 questions |
| Score questions | 2–10 levels |
| Video | Not accepted by the hosted API |
| Text training example | 8,192 input tokens; up to 255 outcomes |
| Image training example | One PNG and one choice question; the processed prompt, photo tokens included, must fit 4,096 tokens |

Oversized inputs are rejected, not truncated.

## Base channels

Each pool has `stable` and `latest` channels. `stable` is the default; `latest` is
opt-in. A job resolves its channel to an exact profile when it is created, so later
channel updates never change that job or its accepted model.

To pin a base when creating a job with `POST /v1/jobs`, add these fields:

```json
{"pool":"d3-mini","base_channel":"stable","model":"d3-mini-4.5b-v1"}
```

The exact `model` stops a channel change between discovery and job creation from
selecting a different base. All supplied fields must agree; unknown, disabled and
unavailable choices are rejected. The [CLI](/training/cli) takes the same values as
`--pool`, `--base-channel` and `--model`. Trained models do not follow a channel
automatically; see [model versions](/training/versions) to move one to a new base.
