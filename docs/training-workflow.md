# Training workflow

Use the [Zils dashboard](https://zils.ai/train) to submit your data, train H2O text
candidates, and review the result. You need a Zils account with training access
and labeled data you are authorized to share with approved miners. You do not
need to set up a database or run a GPU to use the hosted service. For access,
[contact Zils](https://zils.ai/contact).

## 1. Prepare your data

Start with one decision you want the model to make. Follow
[Prepare a dataset](https://docs.zils.ai/training/data) to define the question,
allowed answers, labels, and three separate JSONL files:

| File | Purpose | Access during training |
| --- | --- | --- |
| `train.jsonl` | Train candidate adapters | Approved miners |
| `calibration.jsonl` | Calibrate confidence | Trusted validator; not sent to miners |
| `test.jsonl` | Evaluate candidates | Trusted validator; not sent to miners |

Keep related source records together in one split. Choose your minimum accuracy
and required improvement in probability error before submitting the job. H2O
training supports at most 255 outcomes and 2,048 prompt tokens per example.
Oversized inputs are rejected, not silently shortened.

## 2. Upload and submit

Sign in to the dashboard, prepare your job, and review the permission to export
training data to approved miners. Submit only data you are authorized to share.
Uploads use private storage and temporary upload URLs associated with your job.

Upload all three splits before submitting for validation. If an upload is
interrupted, resume the missing files. An uploaded file cannot be replaced in
that job; cancel and create a new job to change the inputs. A failed file transfer
restarts that file rather than resuming from the interrupted byte.

Your signed-in dashboard session authorizes training actions. The API key used
for predictions is a separate credential.

## 3. Follow training progress

Validation checks the dataset and pins the job's model and acceptance criteria.
The job then waits for approved miner assignment and available capacity. Only
approved miners receive its training export; registering a miner does not grant
access to every customer's data.

An assigned miner trains a candidate adapter. The trusted validator checks the
returned artifact, calibrates confidence, and evaluates it on the held-out test
split. Miners do not receive calibration data, test data, or acceptance criteria.

The dashboard tracks upload, validation, assignment, training, and evaluation.
Waiting for approval or capacity is different from a failed job. There can be
at most five active jobs per account.

## 4. Review the result

| Result | What it means |
| --- | --- |
| `accepted` | A candidate met all frozen acceptance conditions |
| `no_qualifying_model` | Evaluation finished, but no candidate met every condition |
| Failed job | Training or evaluation could not complete; review the reported error |

**Completed does not guarantee an improved model.** A first version is compared
with the calibrated starting model. An explicit upgrade is compared with the
named previous accepted version on the new test data. A rejected candidate does
not replace your current API model.

Review the aggregate results and comparison before using a model on real traffic.
An accepted result can include private, short-lived artifact download links.
Measured acceptance on this test set is not a guarantee on future data. See
[Understand the result](https://docs.zils.ai/training/results) and
[Model versions and upgrades](version-selection.md).

## 5. Use an API-ready model

Training completion and API readiness are separate. After a candidate is
accepted, the activation workflow verifies the serving runtime and registers
the private model for your account. **Only the workflow state `ready` confirms
an API model ID.** `activating`, `activation_failed`, or `needs_review` does not
mean the new model is serving.

Use the confirmed model ID in the `model` field of your prediction request with
your existing API key. An immutable ID pins a release; the task alias follows
accepted upgrades. Follow the
[API quickstart](https://docs.zils.ai/getting-started/quickstart) to make a request.
Other accounts cannot list or call your private model.

## Data access and cancellation

**Approved miner operators can read and retain the exported training data.**
Private storage and expiring URLs control access, but cannot recall downloaded
copies. Export consent does not provide confidential compute. Calibration and
test data stay with the trusted validator.

Canceling stops new claims and prevents a canceled job from completing through
the queue. It does not immediately stop remote compute or delete data already
downloaded by a miner. Training files and local run records remain until operator
cleanup; automatic training-data retention and deletion are not implemented.
The decision API's bulk-data retention controls are separate.

For service configuration and miner approval, use
[Deploy the training service](supabase-training.md).

For terminal training, use the [CLI guide](/training/cli). For image-and-text adapters, use [Imajev training](/training/imajev). Each job freezes its own model profile; existing JevK5 jobs are not converted to H2O.
