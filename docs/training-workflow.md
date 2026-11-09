# Training workflow

Train a z3-mini model on your own labeled examples and review the result. You need a
Zils account ([sign up](https://zils.ai/sign-in) with Google or an email link) and
labeled data you are authorized to use. You do not need to set up a database or run
a GPU.

You can start a run in four ways:

- **The website.** On the [table page](https://zils.ai/train/new), drop a CSV,
  Excel, JSON or JSONL file of past decisions, put the column it should decide on
  the right of the line, and start the run.
- **The CLI.** `zils train prepare` turns an export into the three files and
  `zils train submit --tier open|private` submits them ([Train from the CLI](/training/cli)).
- **A coding agent**, through the MCP server's training tools ([MCP](/sdks/overview#mcp)).
- **`zils fit train`**, from decisions your program logged ([find where Zils fits](/sdks/overview#find-where-zils-fits)).

## Choose a tier

Every run is open tier or private:

| | Open tier | Private |
| --- | --- | --- |
| Price | Free, within its limits | $0.20 per million training tokens, $2 minimum per run |
| Who trains it | Network miners | Zils workers only |
| Training data | The training split is sent to miners | Never sent to miners |
| The trained model | Served by Zils, used through the API; cannot be downloaded | Served by Zils, and its files can be downloaded |
| Limits | 3 runs per account in 24 hours; 5,000 examples and 5,000,000 training tokens per run; a daily limit across Zils | At most five active jobs per account |

Paid runs go ahead of open runs in the queue. See [pricing and limits](/getting-started/pricing#open-tier).

## 1. Prepare your data

Start with one decision you want the model to make. Follow
[Prepare a dataset](https://docs.zils.ai/training/data) to define the question,
allowed answers, labels, and three separate JSONL files:

| File | Purpose | Access during training |
| --- | --- | --- |
| `train.jsonl` | Train candidate adapters | Zils workers (private) or network miners (open tier) |
| `calibration.jsonl` | Calibrate confidence | Trusted validator; not sent to miners |
| `test.jsonl` | Evaluate candidates | Trusted validator; not sent to miners |

Keep related source records together in one split. Choose your minimum accuracy
and required improvement in probability error before submitting the job. z3-mini
training supports at most 255 outcomes and 8,192 input tokens per example.
Oversized inputs are rejected, not silently shortened.

## 2. Upload and submit

Sign in, prepare your job, choose its tier, and review the permission to export
training data. An open-tier run also needs your permission to send the training
split to network miners. Submit only data you are authorized to share. Uploads use
private storage and temporary upload URLs associated with your job.

Upload all three splits before submitting for validation. If an upload is
interrupted, resume the missing files. An uploaded file cannot be replaced in
that job; cancel and create a new job to change the inputs. A failed file transfer
restarts that file rather than resuming from the interrupted byte.

Your signed-in session authorizes training actions. The API key used for
predictions is a separate credential.

## 3. Follow training progress

Validation checks the dataset and pins the job's model and acceptance criteria.
The job then waits for a worker and available capacity. A private run goes only to
Zils workers. An open-tier run goes to one network miner at a time, chosen from
miners that have qualified their hardware.

The assigned worker trains a candidate adapter. The trusted validator checks the
returned artifact, calibrates confidence, and evaluates it on the held-out test
split. Miners do not receive calibration data, test data, or acceptance criteria.

The dashboard tracks upload, validation, assignment, training, and evaluation.
Waiting for capacity is different from a failed job. There can be at most five
active jobs per account.

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
An accepted private run can include private, short-lived artifact download links;
an open-tier model is used through the API only.
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

**On the open tier, the miner that trains your run can read its training split.**
The [miner terms](/operations/miner-terms) require miners to delete it within 7
days of the run finishing; Zils cannot verify that they do. Private storage and
expiring URLs control access, but cannot recall downloaded copies. Export consent
does not provide confidential compute. Calibration and test data stay with the
trusted validator. Use a private run for data that must not leave Zils.

Canceling stops new claims and prevents a canceled job from completing through
the queue. It does not immediately stop remote compute or delete data already
downloaded by a miner. Uploaded files stay until scheduled cleanup removes them;
copies a miner has already downloaded are outside that cleanup.
The decision API's bulk-data retention controls are separate.

For terminal training, use the [CLI guide](/training/cli). For photos, see [Train on images](/training/images). Each job freezes its own model profile.
