---
language:
- en
license: apache-2.0
base_model: vllm-sr/d3-mini
tags:
- zils
- z3
- decision-model
---

# z3-mini v1 — founding baseline

z3 is the Zils line of decision models. z3-mini v1 is its founding baseline,
using the unchanged upstream d3-mini weights. It was selected by Zils as the
starting point for the mini lineage; it is not a miner-trained election winner.

Under the z3 release policy, miners train candidates against the current
incumbent of an enabled lineage. After independent
validation and release approval, an elected candidate becomes a subsequent z3
release. A submitted candidate is not an official release.

## Provenance

This founding release uses the 25 model and runtime files mirrored in
[`zils-ai/d3-mini-4.5b-v1`](https://huggingface.co/zils-ai/d3-mini-4.5b-v1/tree/b54402a963373cc44713f18c9596c580e31cc68b),
which pins [`vllm-sr/d3-mini`](https://huggingface.co/vllm-sr/d3-mini/tree/a475367de0d8133a3c1a2a0dc12303d89cfa2ab4).
No weights were changed. The original LICENSE and NOTICE files apply.
The original runtime filenames and immutable d3 profile remain valid.

## Use and availability

The Zils profile has a 4,096-token input ceiling. Hosted availability is checked
separately from weight publication. Use the model ID returned by your Zils
account's model listing for inference; this release name is not itself an API
inference alias.

See the [model guide](https://docs.zils.ai/getting-started/models) for training,
compatibility and current availability, and [Zils](https://zils.ai) for access.
