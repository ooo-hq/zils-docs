# Base candidates

For a smoke attempt, training settings and controlled comparisons, use the
[miner tuning guide](miner-tuning.md).

A base candidate is a full-weight replacement for the pinned text base,
`d3-mini-4.5b-v1` (the base on both channels since 17 October 2026, adopted by
owner decision after it tied the H2O incumbent on the confirmation draw; see
[d3-mini](roadmap.md#d3-mini)). H2O Lightning 4B v1.2.3 is retired: no longer
served, no new jobs; its candidate contract is kept below for the record.
The public release line is **z3**; the artifact/profile identifiers below remain
unchanged. Miners may train a compatible candidate using permitted development
data. The live mini competition uses the
[decision-quality election](/operations/base-tier), checked 23 October 2026.
The 17/18 October rehearsal used an earlier rule and remains historical evidence.
Candidates enter through an immutable public Hugging Face revision and chain
commitment; validators discover and score those artifacts.
The channel setting on the platform
is a configuration value (`ZILS_TRAINING_MODEL_LATEST`), not yet a registry
alias; automatic "follow stable" upgrades are not implemented.

## Promoted profiles

An approved z3 winner receives a new versioned release and profile; it does not
replace the frozen `d3-mini-4.5b-v1` identity. The
[verified-window promotion command](https://github.com/ooo-hq/zils/blob/main/docs/base-election.md#qualify-candidates-and-close-a-release-window)
stages the candidate's files with a Zils `NOTICE` and `README.md`. Upload is opt-in.
The helper uses compatibility artifact names such as `d3-mini-4.5b-zils-rN`
and prints the `SPECS` entry (`parent` names the profile it was trained from), the
pins file `d3-mini-4.5b-zils-rN-pins.json` (the parent's runtime pins over the
published files) and the registration the runtime needs: the new id joins
`TEXT_ADAPTER_MODELS`, `TEXT_RUNTIME_MODULES` (`.d3`), `RUNTIME_PYTHON_ENV` (the
same interpreter), `CANDIDATE_BASE_ENV` and `PINS_FILES`. Every d3-family profile
shares the vendor runtime code, which is loaded from the vendor release only; the
profile a checkpoint belongs to comes from its `model.json`, so a reference
written with `zils.d3 reference --model <id>` trains, evaluates and serves
adapters for that base with no new flags. Frozen jobs keep their profile; the
platform registers the row (`zils_model_profiles`) and the `latest` channel names
the new id. `zils.d3 candidate --adapter <dir> --out <dir>` is the reference merge
recipe: the parent's shards with `lora_alpha / r` scaled `B @ A` added to each of
the 152 language targets, contract files copied byte for byte.

## What stays fixed

Only the weights change. A d3 candidate must keep:

- the architecture, layer sizes and tokenizer of the pinned base, so the
  production LoRA recipe attaches to the same 152 language modules;
- the 19 files listed as `models.D3_CONTRACT_FILES` byte-identical to the parent
  (`config.json`, `decision_config.json`, the two preprocessor configs,
  `chat_template.jinja`, tokenizer files, `readout.safetensors`, the seven vendor
  runtime modules, `LICENSE`, `NOTICE`);
- the 4,096-token input limit, the FP32 code readout and the pinned runtime
  (`zils/d3-pins.json`).

Before loading a d3 candidate the validator checks that its index `weight_map`
names exactly the parent index's tensors, maps them only to the two shard file
names, and that each shard holds exactly the tensors the index assigns to it;
transformers then rejects any tensor whose shape differs from the parent. Vendor
code is always loaded from the vendor release, never from a candidate.

The validator refuses a candidate whose contract files differ from the parent
hashes, that contains any file outside the list below, or whose weights do not
load exactly.

(H2O, retired: seven contract files `tokenizer.json`, `tokenizer_config.json`,
`chat_template.jinja`, `serve_config.json`, `h2o_lightning_shim.py`,
`generation_config.json`, `LICENSE`; one `model.safetensors`; 2,048 tokens;
`zils/h2o-pins.json`.)

## Artifact

A directory containing exactly these files (`models.D3_CANDIDATE_FILES`):

| File | Content |
| --- | --- |
| `model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors` | all weights, bf16, in the parent's shard layout |
| `model.safetensors.index.json` | the parent's index, unchanged |
| `model.json` | `{"version": "zils-checkpoint/v1", "model": "d3-mini-4.5b-v1", "kind": "candidate", "temperature": 1.0, "profile": <the parent profile>}`; write it with `zils.models.write_metadata(path, kind="candidate", model=zils.models.D3)` |
| the 19 contract files | copied from the parent |

Nothing else: a `candidate.json`, a README or a stray `__pycache__` is rejected.
Total size must stay under 9.5 GiB (the parent is 9.08 GB; a merged LoRA is the
same size).

## Commit

A candidate is two things: the artifact in **your own public Hugging Face model
repo**, pinned by commit, and **one chain commitment** made with your registered
miner hotkey on subnet 579 (the hotkey file only; the coldkey is never read):

```text
zils1:<checkpoint sha256>:<revision>:<owner/repo>
```

`<checkpoint sha256>` is the `zils.checkpoint_hash` of the directory (it covers
every file in the artifact), `<revision>` the full 40-hex commit sha of the upload
(never a branch or tag, so the bytes cannot change under the validators) and
`<owner/repo>` the model repo id. The string is plaintext, at most 305 bytes,
written as up to three 128-byte Raw fields of the Commitments pallet. Every
validator reads each registered hotkey's commitment at its round's preflight
block, freezes it in that round's chain snapshot and pulls the revision itself.
No validator URL, open port or long-running process is needed.

Install with `scripts/install.sh` ([miner setup](mining.md)); `zils setup` saves
the wallet, candidate and repo that the commands below default to.
`zils doctor` checks each prerequisite in order (requirements, d3 training
runtime, hotkey file, registration, candidate, Hugging Face login and repo at the
revision, the commitment on chain) and prints the first fix or, when all pass,
the block your commitment landed in. `zils commit-candidate` does the work:

```bash
hf auth login   # once, with a write token for your account
zils commit-candidate   # flags such as --candidate or --repo override the saved values
```

From a checkout without the installer, `.venv-kev/bin/python -m zils.miner` takes
the same subcommands with `--wallet-name`, `--wallet-hotkey`, `--candidate` and
`--repo`.

It checks the directory with the validator's own `validate_candidate` (it needs
the pinned parent on disk, as the merge recipe does), hashes it, reads your uid
and current commitment from the chain and prints the commitment it would write.
That is a dry run; add `--yes` to upload only the candidate files to the repo
(created public if absent), check through the public API that the repo at the new
commit holds every file at the local size and LFS digest, write the commitment
and read it back. With an upload you made yourself, pass `--revision <commit sha>`
and the command skips the upload. It refuses an unregistered hotkey, a branch
name for a revision, a revision the repo does not have, and files that differ
from the local candidate; when the chain already holds exactly this commitment it
writes nothing, because committing again moves your block later.

What the validator does with it, every round: refuses a commitment that does not
parse, names the incumbent's hash, or carries a hash another hotkey committed at
an earlier block; downloads a new hash once from
`huggingface.co/<repo>/resolve/<revision>/<file>`, only the candidate files, under
the 9.5 GiB budget declared by the repo listing and enforced on every byte; checks
the checkpoint hash and the candidate contract; and scores it in the sandbox.
A hash it has already pulled costs no download and no rescoring, so leave an
unchanged commitment alone: it stays in every round's decision. Commit again only
when you have a new candidate (new hash). Keep the repo and revision public until
your candidate is decided; a validator that has not pulled it yet can only score
what it can download.

### Copies

A checkpoint hash belongs to the hotkey that committed it at the earliest block.
The same hash from another hotkey at a later block is refused, so replaying a
winner's commitment, or re-uploading its files under your own repo, earns
nothing. A hash two hotkeys committed in that same earliest block belongs to
nobody (no tie-break a front-runner could win); if that ever happens to you,
merge again (a new hash) and commit.

Commitments are plaintext, not timelocked (decided 18 October 2026). A sealed
commitment would hide the pointer only until it reveals, and the repo itself must
be public for every validator to pull, so a copier watching Hugging Face learns
nothing later than one watching the chain; sealing would also delay every
candidate by the reveal period and tie intake to the drand beacon. What timelock
does stop is a same-block replay of a commitment seen in the mempool, which today
earns the replayer nothing (the tie rule above); revisit if griefing that way
appears. Neither scheme stops a near-copy: the same weights re-saved so the hash
changes. Such a copy scores the same as the original, and `base_round.decide`
breaks exact ties by uid. The defence there is score-based (prefer the earlier
commitment unless the later one is better by a margin) and is an open owner
decision; until then a promoted winner is protected by king of the hill, since a
copy of the incumbent is never eligible.

### Results

The per-round `base_tier` row (Brier and accuracy against the incumbent,
eligibility, pending and confirmed winner) is published by each validator in its
signed round result over its own HTTP API (`GET /results/<round>`); the chain does
not carry it. What the chain does carry, readable without any URL, is the payout:
the validator's weights and your incentive, for example
`btcli subnets metagraph --netuid 579 --network test`. A validator could publish
its API address on chain (`serve_axon`) so miners find it without an operator
announcement; not done yet.

### Reference recipe: train a LoRA, merge it

The fleet's 20–24 GB cards cannot full-fine-tune the 4.5B backbone, and every
full fine-tune Zils has tried lost to the LoRA. The published recipe is the
production adapter merged into the backbone:

```bash
export ZILS_D3_RUNTIME_PYTHON="$PWD/.venv-d3/bin/python"
.venv-d3/bin/python -m zils.d3 reference --out models/d3-reference
.venv-d3/bin/python -m zils.d3 train --data train.jsonl --reference models/d3-reference \
  --out candidate-adapter --seed 553 --device cuda
.venv-d3/bin/python -m zils.d3 candidate --adapter candidate-adapter --out candidate > provenance.json
```

`train.jsonl` is the customer training export format (one `{"state", "questions":
{"decision": {..., "label"}}}` per line); rank 16, lr 2e-5, one epoch, about
10.5 GB of GPU memory. `candidate` adds `lora_alpha / r` scaled `B @ A` to each
of the 152 language targets in FP32, stores BF16 in the parent's shards, copies
the index and contract files and runs the validator's own `validate_candidate`
before returning; it needs about 10 GB of RAM and 10 GB of disk. Keep
`provenance.json` yourself; it must not go in the artifact. Whatever you train
on, the exam is realistic decisions in families you have not seen: the 18
October rehearsal candidate, trained on 8,400 synthetic rule cases, learned the
format perfectly and still tied stock d3 on the sealed draws.

## How it is scored

Use the [current election guide](/operations/base-tier#what-a-round-decides):
**+2 decision-score points**, a strictly positive paired lower 95% bound, and
no more than **0.005 calibrated Brier regression**, on each of two independent
draws. The second starts at least 12 hours after the candidate and incumbent
finish their first-draw evidence. Eligible runners-up can qualify.

Every pinned adapter job must pass under seeds 553, 771 and 991: mean accuracy
may fall by at most 0.01 and mean Brier rise by at most 0.005 per job. Flat results
pass. A readiness receipt admits the candidate to a scheduled release window;
all ready candidates face the same fresh closing draw before reviewed promotion.

Only crowned kings earn the base allocation. The five most recent distinct king
hotkeys are selected, then those still registered split the pool's allocation.
The founding baseline has no miner owner. Empty allocations burn. See
[the current payout allocation](/operations/base-tier#who-is-paid).

Public reports contain aggregates and evidence hashes, not private predictions
or per-case outcomes. Exam cases are not automatically published after a round;
disclosed cases are retired from future inference.

## Validator and publisher tooling

Use the [operator election runbook](https://github.com/ooo-hq/zils/blob/main/docs/base-election.md#qualify-candidates-and-close-a-release-window)
for `zils.regression_suite --election`, `zils.base_release qualify`, `freeze`,
`close`, and `scripts/promote_base.py --window-report`. Promotion requires a
verified closed-window report and the active pool configuration. An old
`--decision` file alone cannot authorize a current release.

Staging does not install configuration, publish chain weights or move hosted
channels. Upload requires `--upload`; exact-profile registration and platform
training/serving qualification precede a reviewed latest-channel change.
Stable has separate regression and migration gates; the newly elected latest
cannot become stable in the same window. Existing adapters retain their pinned
base until their own migration is accepted.

## Starting points

- `python -m zils.d3 reference --out models/d3-reference` downloads and
  verifies the parent (9.1 GB); the merge recipe above is the baseline to beat.
- Full-weight fine-tuning of a 4B-class parent fits on one 80 GB GPU with fp32
  master weights and bf16 autocast (peak observed 85 GB on a 288 GB card) and has
  lost to the LoRA every time Zils tried it: lr 2e-5 diverges, 5e-6 trails the
  production adapter at equal data. Treat it as a research direction, not the
  recipe.
- A local scorer with the decision-quality metrics, calibration and family weighting is
  `zils.base_round`; run it against a previously published round to estimate
  where you stand before submitting.

## What is not promised

The incumbent can win. Challengers are never paid, only kings: if no candidate
is promoted, the base does not change, the existing kings keep their share and,
with no king yet, the base share is burned at `base_pools.burn_uid`. A candidate that clears the exam but exceeds the adapter regression tolerances
is rejected regardless of its exam score.
