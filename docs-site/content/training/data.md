---
title: Prepare a dataset
---

# Prepare data for d3-mini training

Start with one decision and labeled examples you are authorized to use. The [Zils dashboard](https://zils.ai/train) guides data preparation and upload; the hosted queue trains d3-mini candidates and evaluates them against a frozen comparison model.

## Define the task

Record the context available at decision time, allowed outcomes, and correct label. Exclude information that only becomes available afterward. The training API accepts three JSONL splits using this case format:

```json
{"id":"ticket-001","group_id":"conversation-001","family":"support-routing","state":{"text":"Please send my invoice."},"question":{"type":"choice","instructions":"Choose the responsible team.","criteria":{"billing":"Invoices and payments","technical":"Software troubleshooting"}},"label":"billing"}
```

Each line is one complete record. `label` identifies an outcome; `group_id` keeps related source records together; `family` identifies the task group for evaluation. The training format differs from the prediction API's `model`, `state`, and `questions` request.

d3-mini training supports at most 255 outcomes and 4,096 input tokens per example. Inputs that exceed the limit are rejected, not truncated. See [d3-mini](/getting-started/models). Frozen H2O jobs keep their 2,048-token [contract](/training/h2o#training-and-scoring).

## Separate the data

| File | Purpose | Miner access |
| --- | --- | --- |
| `train.jsonl` | Fit candidate adapters | Approved miners only |
| `calibration.jsonl` | Fit confidence calibration | Validator only |
| `test.jsonl` | Compare the frozen models | Validator only |

Split related conversations, documents, or other source groups together before upload. Case IDs must be globally unique; groups and exact prompts cannot cross splits. Calibration and test must contain matching task families, all present in training. Review semantic duplicates and label quality yourself.

Reserve an independent final set if you repeatedly inspect test results. For upgrades, avoid overlap with data used to train or calibrate the previous model too.

## Set acceptance criteria

Freeze minimum accuracy and minimum absolute Brier improvement before evaluation. First versions compare against the calibrated base. Explicit upgrades compare against the named previous accepted version. See [version selection](/training/versions).

Training may complete with `no_qualifying_model`. The [product-matching study](/research/commerce) recorded an additional adapter that reduced held-out accuracy and worsened probability error. Training completion does not justify replacement on its own.

## Upload with an explicit trust boundary

Approved miner operators can read and retain exported training data. The export-consent flag records your decision; it does not provide confidential compute or recall downloaded copies.

Follow [Training workflow](/training/shared-queue) for authentication, private uploads, and approval. The [automatic workflow](/training/automatic) can assign an approved miner when capacity is available and activate only accepted, verified customer models.

For terminal uploads, use the [training CLI](/training/cli). Image jobs are d3-mini jobs with a frozen image intake; see [image training](/training/imajev). Retired JevK5 job records keep their original 16-outcome limit and model identity.
