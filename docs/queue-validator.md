# Run a validator

Before running service commands, complete the [source installation](../README.md#source-installation).
Run from the zils-platform checkout with the pinned sibling zils checkout available,
unless a section explicitly says to use the subnet checkout.

Choose the workflow before starting a validator. Both evaluate miner candidates,
but only the closed Bittensor fleet can publish weights to the chain.

| Workflow | Model | Validator role |
| --- | --- | --- |
| [Hosted training queue](#queue-validator) | d3-mini 4.5B; frozen H2O jobs (retiring) | Trusted processor validates datasets, evaluates candidates, and exports accepted models |
| [Bittensor testnet](#bittensor-testnet-validator) | d3-mini base tier and adapter rounds (subnet repository) | Registered validator scores miners and explicitly publishes testnet weights |

There is no public, permissionless queue validator onboarding in this repository.
Queue validators need protected operator credentials. Testnet validators need
operator coordination, registered identities, and chain eligibility. Mainnet is
rejected by the fleet.

## Queue validator

<a id="h2o-queue-validator"></a><a id="jevk5-queue-validator"></a>
d3-mini (`d3-mini-4.5b-v1`) is the only served base since 17 October 2026, on
both channels. H2O serving is off and H2O is retiring; JevK5 was retired on
17 October 2026. Existing jobs keep their frozen profile, so keep the reference
for any profile that pending jobs still use.

### 1. Prepare the model host

Complete steps 1 and 3 of the [d3 rollout](d3-rollout.md#install-and-qualify):
the d3 GPU environment (`.venv-d3`, `ZILS_D3_RUNTIME_PYTHON`), a verified
`models/d3-reference`, and hardware qualification. For frozen H2O jobs, also keep
the isolated runtime and reference from the [H2O rollout](h2o-rollout.md).

The processor runs its own inference and calibration; a miner's reported score
is not an evaluation.

### 2. Configure protected access

Complete the resources and server environment in
[shared queue setup](supabase-training.md#run-the-api-and-processor).
For an existing deployment, use its operator-provided configuration; do not
recreate its database resources. From the repository root, if the environment
file does not already exist:

```bash
mkdir -p .private
cp .env.example .private/training.env
chmod 600 .private/training.env
```

Edit this file with the deployment's Supabase URL and server service-role key.
Set `ZILS_TRAINING_MODEL=d3-mini-4.5b-v1` and `ZILS_TRAINING_API_URL` to the
coordinator's reachable URL (`https://training.zils.ai` for the hosted service).
The API and processor must use the same model and Supabase project. Access to
the hosted URL alone does not authorize a validator.

Keep service credentials, calibration/test data, and processor state away from
miner accounts. On shared hardware, use separate operating-system identities
and the same protected `ZILS_COMPUTE_LOCK` for every process sharing a GPU.

### 3. Start the processor

Load the configured environment and run from the repository root:

```bash
set -a
. .private/training.env
set +a
.venv-platform/bin/python -m zils_platform.coordinator process \
  --state .private/queue-processor \
  --reference /absolute/path/to/zils/models/d3-reference --device cuda
```

The `--reference` must match `ZILS_TRAINING_MODEL`. Add
`--additional-reference` for each other profile that pending jobs still use
(for example `models/h2o-reference`).

Use a service supervisor for continuous operation. `--once` handles at most one
pending stage and exits; it does not wait for a full training job to finish.
Each state directory permits one processor process. Database leases coordinate
claimed stages and recover abandoned work.

The API, [approved miners](https://github.com/ooo-hq/zils/blob/main/docs/queue-miners.md), and any automatic assignment service
run separately. Follow [miner approval](supabase-training.md#approve-miners-and-run-a-queued-miner)
or [automatic assignment](automatic-training.md) so validated jobs can reach
miners. A waiting job is not evidence that the evaluator is broken.

### 4. Check evaluation and acceptance

The processor checks dataset boundaries and model identity before assignment.
For submitted candidates it verifies artifact hashes and the allowed adapter
tensors, fits calibration on the calibration split, and scores held-out test
cases. It loads its own pinned architecture, not miner-provided executable code.

A first version must beat the uniform floor, meet the customer's accuracy target,
and improve Brier loss against the calibrated base by the required margin.
[Version upgrades](version-selection.md) compare against the pinned previous
customer model instead. An accepted model gets a release manifest and private
artifacts. A completed job can correctly return `no_qualifying_model`.

Inspect the customer-visible aggregate result and the protected local reports
under `.private/queue-processor/`. Do not expose raw evaluation records, storage
URLs, or server credentials. Queue weight vectors are diagnostic scores; this
processor does not submit them to Bittensor. Serving activation is handled by
the separate [automatic workflow](automatic-training.md).

### 5. Recover without changing the evaluation

Restart with the same protected environment and state directory after resolving
an infrastructure failure. Let expired leases recover; do not manually change
job status to bypass ownership or acceptance. Inspect failed-job logs before
creating a replacement job.

If pending jobs use an older profile (H2O, JevK5 or Kev), retain its verified
reference and pass it with `--additional-reference`. Never rewrite an existing
job's model identity.

## Bittensor testnet validator

Use the subnet repository’s [testnet validator guide](https://github.com/ooo-hq/zils/blob/main/docs/validators.md#bittensor-testnet-validator).
Run all fleet and chain commands from that checkout.
