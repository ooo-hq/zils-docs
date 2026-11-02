# Train a soup body

Start by changing your training data while keeping the supplied trainer fixed.
Compare the resulting checkpoint with its parent on separate development cases
before publishing it. The supplied recipe is a starting point, not a demonstrated
way to earn a soup seat.

This guide trains a body for the `d3-mini` pool, using the z3-mini profile
`d3-mini-4.5b-v1` as the concrete example; other pools work the same way with their own
parent. To make a body without training, merge or re-upload listed public models instead
([merge models](/sdks/overview#merge-models), [Soup pool: pay](/operations/soup#pay)).

## 1. Prepare the runtime and a smoke attempt

Use Linux x86_64 or WSL 2, a BF16-capable NVIDIA GPU, Git, and `uv`. Follow
[install and verify the reference](queue-miners.md#2-install-and-verify-the-reference)
from a fresh clone to create `.venv-kev`, `.venv-d3`, and `models/d3-reference`.
That installation section sends no chain transaction; customer queue admission
is not needed for local base experiments. Run the commands below from the clone's
root. Do not modify a checkout used by a running worker or validator.

The existing mini recipe has measured about 10.5 GB of GPU memory; workers require
12,288 MiB free. Longer examples or changed recipes can need more. Keep at least
30 GiB free for an attempt, in addition to installed dependencies and model caches.
Merging needs roughly 10 GB of host RAM and another full checkpoint on disk.
Use an idle GPU or the host's existing coordination mechanism: direct training
does not acquire the scheduled runner's shared GPU lock.

Create four synthetic examples to verify the file format. The key must be
`questions.decision`, with the label inside that question. This is the trainer's
export format, not the customer submission format with split IDs and families.

```sh
mkdir -p .private/miner-tuning
cat > .private/miner-tuning/smoke.jsonl <<'JSONL'
{"state":"Please refund the duplicate charge.","questions":{"decision":{"type":"noul","instructions":"Does the customer request a refund?","label":"true"}}}
{"state":"When will my parcel arrive?","questions":{"decision":{"type":"noul","instructions":"Does the customer request a refund?","label":"false"}}}
{"state":"I was charged twice.","questions":{"decision":{"type":"choice","instructions":"Which team should handle this?","criteria":{"billing":"Payments and invoices","delivery":"Shipping and tracking"},"label":"billing"}}}
{"state":"The tracking page has not updated.","questions":{"decision":{"type":"choice","instructions":"Which team should handle this?","criteria":{"billing":"Payments and invoices","delivery":"Shipping and tracking"},"label":"delivery"}}}
JSONL

export ZILS_D3_RUNTIME_PYTHON="$PWD/.venv-d3/bin/python"
.venv-d3/bin/python -m zils.d3 train \
  --data .private/miner-tuning/smoke.jsonl \
  --reference models/d3-reference \
  --out .private/miner-tuning/smoke-adapter --seed 553 --device cuda
.venv-d3/bin/python -m zils.d3 candidate \
  --adapter .private/miner-tuning/smoke-adapter \
  --out .private/miner-tuning/smoke-candidate \
  > .private/miner-tuning/smoke-provenance.json
```

Use new output directories for another attempt; training refuses to overwrite an
existing one. Inspect `.private/miner-tuning/smoke-adapter/training_metrics.json`
for finite loss, example count, optimizer steps, seed and runtime. Successful
merging checks the candidate contract, not quality. These examples are only a
plumbing check; do not submit this checkpoint as evidence of improvement.

## 2. Choose what to change

| Setting | Current behavior | How to change it |
| --- | --- | --- |
| Training examples | One decision per JSONL row | Supply another `--data` file; keep evaluation data separate |
| Parent and seed | Parent from `--reference`; explicit `--seed` | Select a compatible reference and record both values |
| Learning rate, epochs, accumulation | AdamW, `2e-5`, one shuffled pass; four examples per update, shorter final window | Edit your experimental trainer; these are not CLI flags |
| LoRA shape | Rank 16, alpha 32, dropout 0.05, pinned language targets | Coordinate trainer/merge changes or use your own full-checkpoint exporter |
| Automatic cadence | New seed per attempt, configured data/reference | Set `interval_seconds`, `start_after`, and `max_training_seconds` in the scheduled runner config |

For data-only experiments, use the smoke commands with your real export and new
output paths. Cover the decision types and domains you want to improve, balance
labels, review ambiguous examples, and keep related source material within one
split. Use public or otherwise permitted research data; never use customer exports
or validator-private exams for base training. Mini's 8,192-token limit includes
the compiled question and state. Longer training inputs do not extend it.

The relevant code is:

| File | Responsibility |
| --- | --- |
| [`zils/jevk5.py`](../zils/jevk5.py) → `train` | Shared training loop, despite the historical name: optimizer, shuffling, accumulation and recorded metrics |
| [`zils/d3.py`](../zils/d3.py) | D3 runtime, LoRA construction, adapter validation, full-weight merge and command arguments |
| [`zils/base_miner.py`](../zils/base_miner.py) | Scheduled attempts, GPU coordination, receipts, upload and chain commitment |
| [`zils/miner.py`](../zils/miner.py) | Setup and body commits |

Keep recipe experiments in a separate checkout. A learning-rate change needs
both the optimizer and recorded `learning_rate` in `training_metrics.json` updated.
Epoch or accumulation changes also need accurate step counts, loss normalization
and metrics. The trainer is shared with customer adapters and other profiles;
do not deploy experimental edits into those workers. Run the
[development checks](development.md) after code changes, then a small GPU attempt.

Changing rank alone is insufficient: stock adapter validation requires rank 16,
alpha 32, dropout 0.05 and the exact target set; merging uses fixed `32 / 16`
scaling. A custom recipe may compete by exporting compliant full weights, but its
merge must match the actual adapter configuration. Preserve the parent architecture,
tokenizer, tensor layout and pinned contract files. Keep validator checks intact;
follow the [candidate contract](base-candidates.md#what-stays-fixed).

## 3. Compare before publishing

1. Freeze training and development splits before fitting. Keep a final test split
   untouched while choosing settings. Record provenance and file hashes; exact
   deduplication alone does not catch paraphrases from the same source.
2. Compare the unchanged parent, the supplied recipe and one proposed change on
   the same development cases. Match seeds and training budgets where possible.
   If dataset size changes, report tokens and optimizer updates as well as epochs.
3. Measure accuracy for choices, balanced accuracy for yes/no, normalized
   expected-value error for scores, and full-vector Brier. Report domain/type
   breakdowns, training time and memory. A gain in one area can hide another's loss.
4. Repeat promising comparisons across seeds, then evaluate the selected recipe
   once on the untouched test split. Preserve losses and regressions as well as
   wins. Training loss or one favorable seed is not a qualification result.

This is an experiment protocol, not an automatic benchmark command. Supply your
own permitted datasets and evaluation harness. Private validator exams are not
available to miners, and a local result cannot certify that a body earns.

Validators score bodies with calibrated Brier skill on their private exams, and a
fine-tune earns only when it improves on its bases by the pool's margin. Rewards
come from seats in the round's soup and from the crown; see
[Soup pool: pay](/operations/soup#pay).

## 4. Commit your checkpoint as a body

Complete [registration](bittensor-registration.md) and run `zils-miner setup` to
configure your wallet and a public Hugging Face repository. The miner installer
supplies `zils-miner`; npm's `@zils/cli` is the separate customer client.

A body must be the pool's full Qwen3.5 model with its vision tower. Check your
checkpoint folder before uploading anything:

```sh
zils-miner commit-body --pool d3-mini --path ./my-body --check
```

Then follow [Commit a body](/operations/soup#commit-a-body) to write the ownership
file, upload to Hugging Face and commit the exact revision on chain.
