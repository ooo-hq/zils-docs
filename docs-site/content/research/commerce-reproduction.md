---
title: Commerce reproduction status
---

# Commerce reproduction status

The product-matching experiment has a recorded method and measured results, but its reproduction scripts are not yet available on the public repository's `main` branch. A fresh public checkout cannot currently rerun this experiment or open its local shopping demo.

## Inspect the published evidence

The [experiment report](/research/commerce) records the source model, dataset, grouped splits, training recipe, hardware, and limitations. You can download the evidence directly:

| Record | Purpose |
| --- | --- |
| [Aggregate results](/downloads/docs/data/commerce-pilot-001.json) | Complete metrics and uncertainty estimates |
| [Frozen protocol](/downloads/experiments/commerce-001/protocol.json) | The study contract fixed before training |
| [Dataset manifest](/downloads/experiments/commerce-001/evidence/dataset-manifest.json) | Source-file and split hashes |
| [Environment record](/downloads/experiments/commerce-001/evidence/environment.json) | Runtime and executed script provenance |
| [Recorded logits](/downloads/experiments/commerce-001/evidence/predictions.jsonl) | Outputs used for the recorded analysis |

The [attribution page](/research/attribution) preserves the applicable model, data, and code licenses. Generated adapter weights are not a published model release.

## Run a supported public workflow

Use the [local JevK5 guide](/getting-started/local-inference) to run local decisions with the same pinned starting checkpoint. The separate [legacy fleet quickstart](/legacy/kev-quickstart) covers Kev 0.8B training. Neither path reproduces the commerce experiment's additional adapter or measured evaluation.
