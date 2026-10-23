---
title: Learn about decision models
description: Understand decision models and design your first evaluation without running a miner or validator.
---

# Learn about decision models

A decision model estimates which of your defined outcomes fits the context. In Zils, that context can be text or, with an image model, an image plus text. Start by understanding the output, then test one task before comparing models or training adapters.

You can read the concepts and published evidence without an account or GPU. Hosted experiments require API access. Running a miner or validator is a separate role, not a prerequisite for learning or evaluating decisions.

## Understand the terms

| Term | Meaning |
| --- | --- |
| Decision | An answer to a defined choice, yes/no or ordered-score question |
| Probability | The model's estimate for an outcome; it can be wrong even when high |
| Calibration | How well probabilities match observed outcomes across many examples |
| Adapter | Trained changes that specialize a base model for a task |
| Held-out evaluation | Testing on examples excluded from training and development decisions |

Zils reads scores for answer options without generating a prose response. Your application interprets the result and chooses an action. Read [how decisions work](/getting-started/decisions) for question types and the distinction between probability and API confidence.

## Design your first experiment

Use a narrow task, such as routing requests to three support teams. A small exploratory set can reveal mistakes; it is not enough by itself to establish production quality.

1. **Define the task.** Write the outcomes and labeling rules before collecting predictions. Decide how to handle ambiguous examples.
2. **Separate your data.** Keep development examples apart from a held-out test set. If training, reserve separate training, calibration and test splits using the [dataset guide](/training/data).
3. **Choose a baseline.** Test your current rules or model alongside an available Zils model on the same examples.
4. **Collect predictions.** Use the [API quickstart](/getting-started/quickstart) and record the returned model ID, probabilities and expected answer for each example. API calls use your account's access and billing terms.
5. **Compare outcomes.** Measure accuracy, probability error and high-confidence mistakes. Break results down by meaningful task groups and report sample sizes and uncertainty.

Freeze your acceptance criteria before inspecting the final test results. Repeatedly tuning against the test set makes it part of development; use fresh evaluation data for a new claim.

## Read evidence in context

The [research record](/research/) includes gains, regressions and rejected candidates. Start with a report's question, dataset, baseline and limitations before its headline score. A deterministic baseline can outperform a learned model when rules fully describe the task.

For a speed comparison, match hardware, runtime, input lengths and measurement conditions. H2O's older 4090 speed ratio does not guarantee performance on the updated runtime. Training and adapter reload checks establish compatibility, not accuracy on your task.

Use the [z3-mini profile](/getting-started/models) when studying current model compatibility. Legacy Kev, JevK5, H2O and Imajev experiments retain their recorded model identities; they are not instructions to change the current default.

## Reproduce or contribute

Reports link published evidence and explain reproduction limits. Some raw datasets, checkpoints or scripts are unavailable; do not assume every reported run can be reproduced from a fresh clone. The [commerce reproduction guide](/research/commerce-reproduction) shows this distinction explicitly.

Use the [repository map](/getting-started/repositories) to find model code and documentation. When reporting a result, include the task, model identity, data split, source revision, runtime, hardware and baseline. Keep customer records and credentials out of public issues and pull requests.

**Next:** read [how decisions work](/getting-started/decisions), then define the outcomes for one task you want to test.
