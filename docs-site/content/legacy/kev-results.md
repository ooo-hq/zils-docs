---
title: Understand the result (legacy Kev 0.8B)
---

# Understand the result

::: warning Legacy Kev 0.8B workflow
These commands and artifacts belong to the original training system. Start with the [API quickstart](/getting-started/quickstart) for the current model; use the [JevK5 miner guide](/operations/miners) for the hosted queue.
:::

Training completion means the workflow ran. It does not mean the candidate is better than the starting model or ready for deployment.

## Read the acceptance decision

A local customer round's `report.json` records the job identity, calibrated baseline evaluation, candidate evaluations, and `delivery` decision.

| Result | Meaning | Next action |
| --- | --- | --- |
| `accepted` | A candidate met every frozen acceptance condition | Review evidence and evaluate independently before deployment |
| `no_qualifying_model` | No candidate met every condition | Inspect baseline comparisons, data quality, and error patterns |
| Failed job or aborted evaluation | The workflow did not produce a valid comparison | Inspect the recorded failure before retrying |

For queued jobs, `completed` can include `no_qualifying_model`. The synthetic queue pilot demonstrated this: the candidate improved but missed the accuracy threshold, so no accepted-model download was delivered.

## Compare more than accuracy

Read Brier loss alongside accuracy, high-confidence mistakes, and task-family results. A model can tie on accuracy and produce worse probabilities. Our [public JevBench comparison](/research/jevbench) recorded exactly that outcome.

Latency figures only apply to the measured hardware and timing scope. The checkpoint rubric excludes model loading, checkpoint transfer, and application HTTP overhead from its per-question timings.

## Inspect an accepted artifact

A local accepted result points to a checkpoint directory relative to the round directory. It includes a calibrated adapter and decision head plus `release.json`, recording model hashes, base revision, and acceptance information.

Keep the round report with the artifact. The artifact still requires the pinned base model. Exporting it does not publish weights or deploy a prediction endpoint.

## Reserve an independent final evaluation

Repeated development rounds reuse the test set. Passing a threshold on that set is not a guarantee of generalization or statistical significance. Reserve independent final data and compare with the approach your application already uses.

Read the [full acceptance gate](/training/local-jobs#inspect-the-result) and [research record](/research/) for measured tradeoffs and limitations.
