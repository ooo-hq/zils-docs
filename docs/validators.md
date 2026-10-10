# Run a validator

Before running service commands, complete the [source installation](/operations/platform-setup#source-installation).
Run from the zils-platform checkout with the pinned sibling zils checkout available,
unless a section explicitly says to use the subnet checkout.

Choose the workflow before starting a validator. Both evaluate miner candidates,
but only the closed Bittensor fleet can publish weights to the chain.

| Workflow | Model | Validator role |
| --- | --- | --- |
| [Hosted training queue](#h2o-queue-validator) | H2O Lightning 4B; legacy JevK5 | Trusted processor validates datasets, evaluates candidates, and exports accepted models |
| [Closed Bittensor testnet](#bittensor-testnet-validator) | Kev 0.8B | Registered validator scores the configured miner roster and explicitly publishes testnet weights |

There is no public, permissionless validator onboarding in this workflow.
Queue validators need protected operator credentials. Testnet validators need
operator coordination, registered identities, and chain eligibility. Mainnet is
rejected by the fleet.

## H2O queue validator

Use the [H2O rollout guide](/operations/h2o) for the default text model, isolated
GPU runtime, worker qualification, and references for existing jobs.

## JevK5 queue validator

### 1. Prepare the model host

Complete [Install and create the reference](/training/jevk5#install-and-create-the-reference)
from a fresh clone. Use Linux or WSL 2, Python 3.13, a BF16-capable NVIDIA GPU,
and at least 25 GB free disk for the base model and packages, plus space for job
data and candidates. The checked GPU is an RTX 4090; input lengths affect memory.

The result must be a verified `models/jevk5-reference`. The processor runs its
own inference and calibration; a miner's reported score is not an evaluation.

### 2. Configure protected access

Complete the resources and server environment in
[shared queue setup](/operations/training-service#run-the-api-and-processor).
For an existing deployment, use its operator-provided configuration; do not
recreate its database resources. From the repository root, if the environment
file does not already exist:

```bash
mkdir -p .private
cp .env.example .private/training.env
chmod 600 .private/training.env
```

Edit this file with the deployment's Supabase URL and server service-role key.
Set `ZILS_TRAINING_MODEL=jevk5-4b-v0.3` and `ZILS_TRAINING_API_URL` to the
coordinator's reachable URL (`https://training.zils.ai` for the hosted service).
The API and processor must use the same model and Supabase project. Access to
the hosted URL alone does not authorize a validator.

Keep service credentials, calibration/test data, and processor state away from
miner accounts. On shared hardware, use separate operating-system identities
and the [shared compute lock](/training/jevk5#configure-the-services).

### 3. Start the processor

Install the subnet model and rehearsal requirements into the platform environment with the CUDA PyTorch backend before running this legacy JevK5 processor. H2O instead uses the isolated runtime in its rollout guide.

Load the configured environment and run from the repository root:

```bash
set -a
. .private/training.env
set +a
.venv-platform/bin/python -m zils_platform.coordinator process \
  --state .private/queue-processor \
  --reference ../zils/models/jevk5-reference --device cuda
```

Use a service supervisor for continuous operation. `--once` handles at most one
pending stage and exits; it does not wait for a full training job to finish.
Each state directory permits one processor process. Database leases coordinate
claimed stages and recover abandoned work.

The API, [approved miners](https://github.com/ooo-hq/zils/blob/main/docs/queue-miners.md), and any automatic assignment service
run separately. Follow [miner approval](/operations/training-service#approve-miners-and-run-a-queued-miner)
or [automatic assignment](/training/automatic) so validated jobs can reach
miners. A waiting job is not evidence that the evaluator is broken.

### 4. Check evaluation and acceptance

The processor checks dataset boundaries and model identity before assignment.
For submitted candidates it verifies artifact hashes and the allowed adapter
tensors, fits calibration on the calibration split, and scores held-out test
cases. It loads its own pinned architecture, not miner-provided executable code.

A first version must beat the uniform floor, meet the customer's accuracy target,
and improve Brier loss against the calibrated base by the required margin.
[Version upgrades](/training/versions) compare against the pinned previous
customer model instead. An accepted model gets a release manifest and private
artifacts. A completed job can correctly return `no_qualifying_model`.

Inspect the customer-visible aggregate result and the protected local reports
under `.private/queue-processor/`. Do not expose raw evaluation records, storage
URLs, or server credentials. Queue weight vectors are diagnostic scores; this
processor does not submit them to Bittensor. Serving activation is handled by
the separate [automatic workflow](/training/automatic).

### 5. Recover without changing the evaluation

Restart with the same protected environment and state directory after resolving
an infrastructure failure. Let expired leases recover; do not manually change
job status to bypass ownership or acceptance. Inspect failed-job logs before
creating a replacement job.

If pending jobs use Kev, retain its verified reference and add
`--additional-reference models/reference`. Follow the
[model transition procedure](/training/jevk5#existing-jobs-and-rollback) rather
than rewriting an existing job's model identity.

## Bittensor testnet validator

Use the subnet repository’s [testnet validator guide](https://github.com/ooo-hq/zils/blob/main/docs/validators.md#bittensor-testnet-validator).
Run all fleet and chain commands from that checkout.
