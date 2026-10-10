---
title: Prepare a dataset (legacy Kev 0.8B)
---

# Prepare a dataset

::: warning Legacy Kev 0.8B workflow
These commands and artifacts belong to the original training system. Start with the [API quickstart](/getting-started/quickstart) for the current model; use the [JevK5 miner guide](/operations/miners) for the hosted queue.
:::

Start with one decision and labeled examples you are authorized to use for training. The current workflow accepts JSONL files; it does not automatically turn an arbitrary spreadsheet into a training job.

## Define the task

Write down the context available at decision time, the allowed outcomes, and the label for each example. Keep information that would only become available after the decision out of the input.

A support-routing example looks like this:

```json
{"id":"ticket-001","group_id":"conversation-001","family":"support-routing","state":{"text":"Please send my invoice."},"question":{"type":"choice","criteria":{"billing":"Billing and invoices","technical":"Technical support"}},"label":"billing"}
```

This is one complete JSON object on one line. `label` must match an outcome key. `group_id` identifies the source group so related records can stay together.

## Create three separate files

After [repository setup](/legacy/kev-quickstart#repository-setup), create a private directory:

```bash
mkdir -p .private/customer-data
```

Prepare these files using your authorized labeled records:

| File | Purpose | Shared with miners? |
| --- | --- | --- |
| `train.jsonl` | Fit the candidate model | Yes, with approved miners |
| `calibration.jsonl` | Adjust predicted confidence | No; kept with the validator |
| `test.jsonl` | Measure candidate and baseline quality | No; kept with the validator |

Split by conversation, document, or other related source **before** writing the files. Case IDs must be globally unique. Groups and identical prompts cannot cross splits. Calibration and test must contain the same task families, all present in training.

The validator can detect exact overlap and group-ID overlap. It cannot detect every semantic duplicate or fix an incorrectly assigned group. Review the split and labels yourself.

## Set acceptance criteria before evaluation

Choose a minimum accuracy and minimum absolute Brier improvement over the calibrated starting checkpoint. Keep the criteria fixed for the job. Changing inputs or thresholds requires a new job version.

A candidate must also beat the uniform baseline and strictly improve on the calibrated starting checkpoint. These rules can produce no qualifying model, even when training completes.

## Understand the export boundary

Approved miner operators can read and retain exported training data. An export permission flag records your decision; it does not encrypt the data, provide confidential compute, or recall downloaded copies.

Use the [local training job guide](/training/local-jobs) to generate synthetic example inputs and create a manifest, or the [shared training queue](/training/shared-queue) for private uploads and approved miner assignments.
