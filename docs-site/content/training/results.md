---
title: Understand the result
---

# Read predictions and training results

An API response means the model returned a decision. A completed training job means evaluation finished. Neither establishes quality without the associated labels, comparisons, and acceptance criteria.

## Read an API response

The response identifies the resolved `model` release, places decisions under their question IDs in `answers`, and records token counts in `usage`. Generated output tokens are zero.

| Question | Decision fields |
| --- | --- |
| Yes/no (`noul`) | `noul`: probability of true |
| Choice | Winning `choice`, `probabilities`, and normalized `confidence` |
| Score | Expected zero-based `score`, `probabilities`, `confidence`, and original `legend` |

API confidence is not simply the largest probability. [How decisions work](/getting-started/decisions#interpret-confidence-correctly) explains the distinction. Keep the resolved model ID with predictions so later comparisons identify the version actually used.

## Read a training result

| Result | Meaning |
| --- | --- |
| `accepted` | A candidate met the frozen quality conditions |
| `no_qualifying_model` | No candidate met every condition; existing API models remain available |
| Failed evaluation | No valid comparison was completed; inspect the recorded failure |

First versions compare with the calibrated pinned base. Upgrades compare with the previous accepted version's exact serving weights and temperature on the new test set. Candidates are calibrated on the new calibration split. See [version selection](/training/versions).

Accepted d3-mini artifacts, and older H2O artifacts, contain `adapter_config.json`, `adapter_model.safetensors`, `model.json`, and `release.json`. Accepted image jobs produce the same d3 text adapter release. Older Imajev artifacts additionally preserve the separately validated decision head and image configuration. Legacy Kev downloads retain their original format. Preserve the report, data split identifiers, model revision, and calibration record with each artifact.

## Distinguish acceptance from API readiness

The dashboard's separate `workflow` state describes assignment and activation. **Only `ready` confirms an API model ID.** `activating`, `activation_failed`, or `needs_review` does not mean the new model is serving.

The [automatic workflow](/training/automatic) verifies the runtime's release identity before registration. A stale upgrade cannot overwrite a newer active version. Use the immutable model ID to pin a version, or its stable task alias to follow accepted upgrades.

## Compare more than accuracy

Read probability error, high-confidence mistakes, task-group results, sample sizes, and independent final evaluation. The [JevK5 product-matching experiment](/research/commerce) retained an unfavorable additional-training result; its adapter was not promoted.

Latency comparisons must identify hardware and timing scope. A few successful requests do not establish production capacity or a service-level guarantee. The [API guide](/api/reference#verification-and-measured-scope) records measured checks and limitations.
