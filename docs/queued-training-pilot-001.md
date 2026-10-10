# Queued training pilot 001

On October 4, 2026, one synthetic customer job completed the live Supabase queue
with an explicitly approved miner, real model training, signed checkpoint upload,
and processor-side calibration and evaluation. **The job completed with no
qualifying model.** This is an operational experiment, not a published model
release or evidence of customer-task
generalization. [Aggregate results and provenance](data/queued-training-pilot-001.json)
contain the full-precision metrics and file hashes.

## Result

Both checkpoints were calibrated independently on the same 32-case split and then
evaluated on the same 64 held-out cases. Acceptance was frozen before evaluation:
at least 80% accuracy, positive skill against uniform probabilities, and at least
0.01 absolute Brier improvement over the calibrated starting checkpoint.

| Measure | Calibrated reference | Calibrated candidate |
| --- | ---: | ---: |
| Correct / 64 | 44 (68.75%) | 48 (75.00%) |
| Equal-family Brier loss ↓ | 0.408204 | 0.361863 |
| Wrong at ≥90% confidence | 0 | 4 |
| Calibration temperature | 1.624505 | 0.812252 |
| Median / p95 inference, ms | 2342.1 / 3011.7 | 2376.0 / 2815.7 |

Brier improved by 0.046342, exceeding the 0.01 requirement, but
75% accuracy missed the 80% requirement. Confident mistakes increased from zero
to four. The processor retained the original threshold and withheld an accepted
model; no threshold was relaxed and no additional candidate was tried.

| Task family | Reference correct / 16 | Candidate correct / 16 | Candidate wrong at ≥90% confidence |
| --- | ---: | ---: | ---: |
| Evidence | 8 | 11 | 2 |
| Policy | 11 | 11 | 0 |
| Routing | 12 | 12 | 1 |
| Severity | 13 | 14 | 1 |

The miner submitted on its first assignment attempt. The authenticated customer
result matched the processor report, and recorded predictions reproduced the
reported test metrics. The customer download endpoint
returned HTTP 409 with no artifacts, consistent with the acceptance decision.
Accepted-artifact delivery through a real qualifying queue run remains unverified.

## Method and hardware

The run used repository commit `9b2fda7a605af792114d831ec13fc57a1cad88c3`, the
pinned Kev runtime, the original pinned public reference, and the
`Qwen/Qwen3.5-0.8B-Base` revision recorded in the aggregate JSON. The miner received
only the hash-verified training export; calibration and test remained with the
processor. No chain weights were published.

The dataset contained 64 training, 32 calibration, and 64 test cases, evenly
distributed across evidence, policy, routing, and severity tasks. Cases came from
the existing synthetic generator with seed `20261004`. Within each original split
and family, the first 16/8/16 clean cases ordered by ID were selected. IDs, source
groups, and exact prompts passed the split-boundary checks.

Training ran on an Apple M4 Pro with 24 GiB unified memory using MPS and FP32:
one epoch, learning rate 2e-5, batch 1, accumulation 4, and seed `765515033`.
All 64 records were processed in 16 optimizer steps with 8,372 forward tokens;
none were rejected or truncated. The measured training loop and saving took
27.49 seconds, excluding initial model loading and network transfer. Peak sampled
device allocation was 3.41 GiB and peak process RSS was 4.55 GiB; these overlap in
unified memory and must not be added. Choice option permutation remained enabled;
none-option and distractor insertion were disabled.

Evaluation used CPU FP32 on an existing Ubuntu 24.04 VM with four vCPUs and 8 GiB
RAM. A separate inference service was also active. Memory pressure during the
baseline pass required temporary 4 GiB swap; it was removed after the run. Neither
service was restarted. Timings include encoding and synchronized per-case
inference, excluding model loading, transport, queue delay, and calibration
fitting. This shared-host observation is not a serving performance guarantee.

The temperature fitter minimizes macro-family NLL over 81 log-spaced values from
0.25 to 4 using only calibration data. The reference temperature is reset before
fitting; each candidate starts at temperature 1.0. Test labels are not used to fit
temperatures or select acceptance thresholds.

## Reproduce the inputs

Complete the Python 3.13 [repository setup](../README.md#repository-setup) on
macOS, Linux, or WSL 2. From the repository root, use a new output directory:

```bash
.venv-kev/bin/python - <<'PY'
from pathlib import Path
from zils import benchmark, jobs

source = benchmark.generate(20261004)
splits = {}
for split, per_family in [('train', 16), ('calibration', 8), ('test', 16)]:
    splits[split] = []
    for family in sorted(benchmark.ORACLES):
        rows = sorted(
            (c for c in source[split] if c['family'] == family and c['variant'] == 'clean'),
            key=lambda c: c['id'],
        )
        splits[split].extend(rows[:per_family])
jobs.build(
    Path('.private/queued-pilot-input'), 'synthetic-queue-pilot-001', splits,
    {'min_accuracy': 0.80, 'min_brier_improvement': 0.01},
    allow_training_data_export=True,
)
PY
```

This command reproduces the recorded split and training-export hashes. Follow the
[legacy Kev queue setup](kev-training-queue.md) to create a new job, upload those
three splits, register an operator-controlled miner, and explicitly approve it.
An existing configured Supabase project and coordinator are required. A new job
and miner identity produce a different training seed; the seed above records
this run, not a guarantee of identical results from a new queue assignment.

## Limits and verification

One candidate, one seed, small related synthetic templates, and clean variants
cannot establish statistical significance, customer-data performance, or
instruction-injection robustness. These test cases are now exposed development
data; independent final evaluation is still required. Raw predictions and model
artifacts remain private, so the published aggregate cannot independently attest
to the original execution.

The synthetic account used password authentication. This run did not test inbox
delivery or browser UI uploads, deploy hosted customer inference, or implement
billing. The disposable miner was disabled after completion.

`make check` passed 18 Python tests, Ruff lint/format, and the website test/build.
`make check-queue-db` passed the migration and access-control checks in an isolated
PostgreSQL 16.15 database. Production migration statements were not reapplied.
