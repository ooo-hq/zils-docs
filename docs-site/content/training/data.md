---
title: Prepare a dataset
---

# Prepare data for z3 training

Start with one decision and labeled examples you are authorized to use. The website's [table page](https://zils.ai/train/new) and `zils train prepare` turn a spreadsheet or export into the files below; the hosted queue trains candidates on the selected immutable profile and evaluates them against a frozen comparison model.

Select an available pool and channel before creating the run. Omitting selection
keeps the mini stable default. Every new run stores the resolved profile; recovery
keeps the original profile even when the channel changes. See [model pools](/getting-started/models).

## Define the task

Record the context available at decision time, allowed outcomes, and correct label. Exclude information that only becomes available afterward. The training API accepts three JSONL splits using this case format:

```json
{"id":"ticket-001","group_id":"conversation-001","family":"support-routing","state":{"text":"Please send my invoice."},"question":{"type":"choice","instructions":"Choose the responsible team.","criteria":{"billing":"Invoices and payments","technical":"Software troubleshooting"}},"label":"billing"}
```

Each line is one complete record. `label` identifies an outcome; `group_id` keeps related source records together; `family` identifies the task group for evaluation. The training format differs from the prediction API's `model`, `state`, and `questions` request.

z3-mini supports at most 255 outcomes and 8,192 input tokens per example. Inputs that exceed the limit are rejected, not truncated. See [z3-mini](/getting-started/models).

## Separate the data

| File | Purpose | Miner access |
| --- | --- | --- |
| `train.jsonl` | Fit candidate adapters | Zils workers (private) or network miners (open tier) |
| `calibration.jsonl` | Fit confidence calibration | Validator only |
| `test.jsonl` | Compare the frozen models | Validator only |

Split related conversations, documents, or other source groups together before upload. Case IDs must be globally unique; groups and exact prompts cannot cross splits. Calibration and test must contain matching task families, all present in training. Review semantic duplicates and label quality yourself.

Reserve an independent final set if you repeatedly inspect test results. For upgrades, avoid overlap with data used to train or calibrate the previous model too.

## Set acceptance criteria

Freeze minimum accuracy and minimum absolute Brier improvement before evaluation. First versions compare against the calibrated base. Explicit upgrades compare against the named previous accepted version. See [version selection](/training/versions).

Training may complete with `no_qualifying_model`. The [product-matching study](/research/commerce) recorded an additional adapter that reduced held-out accuracy and worsened probability error. Training completion does not justify replacement on its own.

## Upload with an explicit trust boundary

Whoever trains the run can read the training split. Private runs are trained only by Zils workers; open-tier runs are trained by network miners, who must delete the data within 7 days of the run finishing (see [open tier](/getting-started/pricing#open-tier)). The export-consent flag records your decision; it does not provide confidential compute or recall downloaded copies.

Follow [Training workflow](/training/shared-queue) for sign-in, tiers and uploads. When capacity is available, the platform assigns a worker: a Zils worker for a private run, a qualified network miner for an open-tier run. Only accepted, verified models are activated. Private training costs $0.20 per million training tokens with a $2 minimum per run; open-tier training is free within its limits. See [pricing](/getting-started/pricing).

For terminal uploads, use the [training CLI](/training/cli). For image jobs, see [Train on images](/training/images).
