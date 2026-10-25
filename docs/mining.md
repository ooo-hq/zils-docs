# Run a text or image fleet miner

Local and Bittensor testnet fleets support **z3-mini v1** text jobs
(`d3-mini-4.5b-v1`, the base since 17 October 2026). H2O Lightning 4B and the
ImaJev image profile are retired; existing bundles for them keep working, and new
bundles should pin its unchanged d3 profile. Existing Kev 0.8B bundles remain supported; JevK5 4B bundles
are retired. For workers that claim different customer jobs,
use the [queue miner guide](https://github.com/ooo-hq/zils/blob/main/docs/queue-miners.md).
Queue and fleet miners use the same trainers but different credentials and startup commands.

After the one-time setup below, run this in your assigned miner folder:

```bash
./start-miner
```

The miner trains one candidate per round, submits its signed checkpoint, receives
the validator's result, and waits for the next round. Stop with Ctrl+C, or use
`./start-miner --rounds 1` for a single result. The first start downloads the
pinned text base model. Image miners require the separately installed, verified
image runtime described below. Later starts reuse the cache.

## Prepare bundles on the validator

For a text fleet, create the d3 reference with the
[queue miner setup](https://github.com/ooo-hq/zils/blob/main/docs/queue-miners.md#2-install-and-verify-the-reference)
Prepare authorized, independent training/calibration/test JSONL files using the
[customer data format](https://github.com/ooo-hq/zils/blob/main/docs/customer-jobs.md#prepare-data).
The following freezes those files and an example acceptance policy; choose your
policy before evaluating candidates:

```bash
.venv-kev/bin/python -m zils.jobs --job-id text-v1 \
  --model d3-mini-4.5b-v1 --train .private/train.jsonl \
  --calibration .private/calibration.jsonl --test .private/test.jsonl \
  --min-accuracy 0.80 --min-brier-improvement 0.01 \
  --allow-training-data-export --out .private/jobs/text-v1
.venv-kev/bin/python -m zils.fleet init --out .private/fleet-local \
  --benchmark .private/jobs/text-v1 --checkpoint models/d3-reference \
  --host VALIDATOR_PRIVATE_IPV4
```

Replace `VALIDATOR_PRIVATE_IPV4` with the validator's numeric private address
(RFC 1918 or a Tailscale `100.64.0.0/10` address; public addresses are refused).
Use new output paths or reuse an existing audited benchmark. The default ports
are 8900 for the validator and 8901–8903 for three miners. Assign one
`miner-N.tar.gz` to each machine.

Only training data goes into a miner bundle. The validator keeps calibration
cases, test cases, and full reports. Local bundles contain disposable signing
keys and must stay private. [Testnet bundles](testnet.md) contain public wallet
references instead; provision each hotkey separately.

### Image fleets

Fleet image bundles use the retired ImaJev profile only; `zils.fleet init`
takes `--images` for ImaJev jobs and no other profile. New d3 image jobs run in
the [hosted queue](queue-miners.md), where a d3 miner downloads a job's frozen
training photos itself. Use this section only to rerun an existing ImaJev job.

Complete the pinned runtime and maximum-context hardware qualification in
[image training](https://github.com/ooo-hq/zils-platform/blob/main/docs/image-training.md#worker-and-service-setup)
for every participating miner and the validator. Use a fresh published starting
checkpoint, not an earlier customer adapter. The operator supplies an audited
image-job directory built by `zils.image_jobs.build`, its canonical image cache
(`<sha256>.png`), and measured admission limits. Those are private inputs; fleet
initialization does not download customer photos or resolve hosted predecessor jobs.

```bash
.venv-kev/bin/python -m zils.fleet init --out .private/fleet-image \
  --benchmark .private/jobs/image-v1 --checkpoint models/imajev-starting-checkpoint \
  --images .private/image-cache --min-free-mib QUALIFIED_FREE_MIB \
  --max-seconds QUALIFIED_TRAINING_SECONDS --host VALIDATOR_PRIVATE_IPV4
```

Replace both qualification placeholders with the operator's measurements. Memory
admission must cover peak reserved GPU memory plus 512 MiB and be at least
12,288 MiB; the training deadline must be 1–3,600 seconds. Use limits sufficient
for every host in this fleet. Bundles receive only training photos; calibration
and test photos stay with the validator. Export verifies image hashes and sizes.

Each model uses its own fleet directory and ports. Never combine text and image
scores into one reward vector. Only one validator may publish for a hotkey/subnet;
do not run competing vertical publishers that overwrite each other's weights.

For a legacy Kev rehearsal, keep `zils.benchmark build` and `models/reference`.
Do not relabel a Kev manifest as a different model.

## Set up each machine once

1. Unpack its assigned archive and enter the `miner-N` folder.
2. Install Git and Python 3.13, then install the pinned dependencies:

   ```bash
   python3.13 -m venv .venv-kev
   .venv-kev/bin/python -m pip install -r requirements/model.txt -r requirements/rehearsal.txt
   ```

   With `uv`, use `uv venv --python 3.13 .venv-kev` and
   `uv pip install --python .venv-kev/bin/python -r requirements/model.txt -r requirements/rehearsal.txt`.

3. Allow the assigned miner TCP port from the validator's private address.
   Allow validator TCP 8900 from the miner machines.
4. Run `./start-miner --rounds 1`. It can start before the validator and will retry.

d3 needs a qualified CUDA host and the isolated runtime below on every miner
and the validator. CPU and Apple MPS fallback apply only to Kev. Use `--device cuda`
explicitly. To reuse an environment or cache, set `ZILS_PYTHON`
to its absolute Python path and `HF_HOME` to the cache directory.

For d3 bundles, install the isolated runtime on each host and export it before
every start (the validator needs the same variable):

```bash
uv venv --python 3.12 .venv-d3
uv pip install --python .venv-d3/bin/python --torch-backend=cu130 -r requirements/d3.txt
export ZILS_D3_RUNTIME_PYTHON="$PWD/.venv-d3/bin/python"
./start-miner --device cuda --rounds 1
```

For legacy H2O bundles, do the same with `.venv-h2o`, `requirements/h2o.txt`
and `ZILS_H2O_RUNTIME_PYTHON`.

d3 training waits until at least 12,288 MiB of GPU memory is free
(`ZILS_D3_MIN_FREE_MIB` raises that floor). Neither side silently substitutes
another runtime. The pins are `zils/d3-pins.json`; the retired H2O contract is in
[h2o-queue.md](h2o-queue.md).

For legacy ImaJev image bundles, also install and verify the isolated runtime on each host:

```bash
uv venv --python 3.13 .venv-image
uv pip install --python .venv-image/bin/python --torch-backend=cu128 -r requirements/imajev.txt
.venv-image/bin/python -m scripts.download_imajev --out models/imajev-reference
export ZILS_IMAGE_RUNTIME_PYTHON="$PWD/.venv-image/bin/python"
export ZILS_IMAGE_REFERENCE="$PWD/models/imajev-reference"
./start-miner --device cuda --rounds 1
```

The validator needs these same image runtime variables. Set the shared
`ZILS_COMPUTE_LOCK` and the qualified `ZILS_IMAGE_GPU_MEMORY_FRACTION` when sharing
a GPU, as described in the image training guide. Low capacity makes a miner wait;
it never permits a smaller unverified memory allowance.

### Windows / NVIDIA GPU

Run the miner inside WSL 2, using the supported NVIDIA driver installed on
Windows. Do not install a Linux NVIDIA display driver inside WSL. Check CUDA
from the miner environment:

```bash
.venv-kev/bin/python -c 'import torch; assert torch.cuda.is_available(), "CUDA is not ready"; print(torch.cuda.get_device_name(0))'
```

The validator must reach the miner directly at its private IPv4 address.
Default WSL NAT does not support this callback layout without additional
network setup. Use [WSL mirrored networking](https://learn.microsoft.com/en-us/windows/wsl/networking#mirrored-mode-networking)
and limit the Windows/Hyper-V firewall rule to the assigned port and validator.
See [NVIDIA's WSL setup](https://docs.nvidia.com/cuda/wsl-user-guide/index.html).
Native Windows service execution and NAT traversal are not implemented.

## Start the validator

From the repository root:

```bash
.venv-kev/bin/python -m zils.fleet validator \
  --config .private/fleet-local/validator/config.json --rounds 1
```

Remove `--rounds 1` for continuous rounds. The validator evaluates after every
miner submits or the collection deadline expires. It verifies signatures and
hashes, calibrates each candidate, and scores the separate evaluation cases.
Local mode never writes weights to Bittensor. Testnet mode needs registered
wallets and explicit publication; follow the [testnet guide](testnet.md).

## Two tracks on the testnet: the base tier pays first

This heading is retained for existing links. The live configuration now has
**three tracks**, checked 23 October 2026: **50% base models, 20% feature tracks,
and 30% customer adapters**. The old 70/30 split is historical. See the
[current election and payout guide](/operations/base-tier#who-is-paid).

- **Base models:** z3-mini candidates must improve the decision score by at least
  **+2 points**, have a strictly positive paired lower 95% bound, and increase
  calibrated Brier by no more than **0.005** on each of two independent draws.
  Confirmation starts at least 12 hours after both candidate and incumbent finish
  their first evidence. All eligible candidates can qualify. The pinned adapter
  suite and a fresh release-window comparison precede reviewed promotion.
  Only crowned kings earn; exam success alone pays nothing.
- **Feature tracks:** mini box and lite box receive 16% and 4% of the whole vector,
  respectively. Their separate competitions do not enable another base pool.
- **Customer adapters:** the live validator uses eligible
  [hosted-queue evidence](queue-miners.md). Customer-job acceptance remains
  separate from base election. Qualification and operator-owned jobs do not earn.

Each pool's five most recent distinct king hotkeys are selected before filtering
for current registration; the remaining kings split that pool's allocation.
Empty tracks burn their share rather than giving it to another track. These are
configured weights, not guaranteed token earnings. The founding baseline has no
miner owner and its king history was empty at this check.

Anti-gaming: one adapter submission per hotkey per round and one base candidate
commitment per hotkey on chain; a claim cannot change within a round; a candidate
hash another hotkey committed at an earlier block is refused; every
sealed split is audited against its manifest before scoring, and payment goes
only to registered roster UIDs. You receive aggregate metrics, never per-case
outcomes. Private exams are not automatically published after a round; disclosed cases are retired from future inference.

What a base-tier miner needs: the 20–24 GB cards in today's fleet cannot
full-fine-tune the 4.5B backbone, but a d3 LoRA trains in about 10.5 GB of
GPU memory. Train a LoRA on d3 and merge it with `zils.d3 candidate`, which
writes the two bf16 shards in the parent's layout plus the untouched contract
files and validates the result (see
[the reference recipe](base-candidates.md#reference-recipe-train-a-lora-merge-it));
the merge needs about 10 GB of RAM and 10 GB of disk per candidate, and the
upload is at most 9.5 GiB. Customer jobs take priority on a shared card; base
training fills the idle time. What you train on decides everything: the 18
October rehearsal candidate, trained only on synthetic rule cases, tied stock d3
on the sealed exam.

## Compete in the base tier from outside

You do not need a bundle, an operator or an invitation to enter the base tier:
registration on subnet 579 is the admission. About an afternoon end to end, most
of it the training run.

You do not need any validator's address or hotkey to compete: candidates are
chain commitments that every validator reads itself. Validators are run by
whoever operates them; find them on the metagraph
(`btcli subnets metagraph --netuid 579 --network test`).

Start with the installer on the mining host. It clones Zils into `~/.zils/zils`,
builds the miner runtime and, on Linux x86_64 with an NVIDIA GPU, the d3 training
runtime, links `zils` into `~/.local/bin` and starts `zils setup`, which asks for
your wallet, candidate folder and Hugging Face repo, saves them to
`~/.zils/miner.json` and runs the doctor. Rerun it to update.

```bash
curl -fsSL https://zils.ai/install.sh | sh
```

From then on `zils doctor` names the next step and prints its command; the steps are:

1. **Register a hotkey on testnet subnet 579** following the
   [registration guide](bittensor-registration.md); keep the hotkey file on the
   mining host and the coldkey elsewhere.
2. **Read the [miner terms](mining-terms.md).** Running a miner against a Zils
   validator means you accept them.
3. **Train and merge a candidate** with the
   [reference recipe](base-candidates.md#reference-recipe-train-a-lora-merge-it):
   `zils.d3 reference`, `zils.d3 train` on data of your choosing, `zils.d3 candidate`
   to merge the adapter into the parent's shards. The result is a directory that
   passes the candidate contract; the exam is realistic decisions in families you
   have not seen, so what you train on decides everything.
4. **Upload and commit.** Log in to Hugging Face once (`hf auth login`, a write
   token), then let `zils commit-candidate` upload the candidate files to
   your public model repo and commit `zils1:<hash>:<revision>:<repo>` on chain
   with your hotkey (details in [base candidates: commit](base-candidates.md#commit)):

   ```bash
   zils commit-candidate
   ```

   It reads the wallet, candidate and repo saved by `zils setup`; flags such as
   `--candidate` or `--repo` override them for one run.

   Without `--yes` it is a dry run that prints the commitment; with `--yes` it
   uploads, checks the public repo at the new commit, writes the commitment and
   reads it back. No validator URL, no open port, nothing left running: every
   validator reads the commitments at the start of its round and pulls the
   revision from Hugging Face, once per distinct hash.
5. **Let the doctor check.** It runs the checks in order (requirements, d3
   training runtime and GPU, hotkey file, registration, candidate, Hugging Face
   login and repo at the revision, commitment on chain) and stops at the first
   failing one with the exact command that fixes it:

   ```bash
   zils doctor
   ```

   You can run it before step 1 (it tells you to create the wallet), before
   step 3 (it prints the merge recipe), before step 4 (it prints the commit
   command) and again after each fix.
6. **Read the result.** Your payout is on chain: the validators' weights and your
   incentive (`btcli subnets metagraph --netuid 579 --network test`). The
   aggregate row per round (Brier and accuracy against the incumbent, eligibility,
   the pending and confirmed winner) is in each validator's signed round result on
   its own API (`GET /results/<round>`), not on chain. Per-case results are never returned. An ineligible or
   rejected candidate earns nothing; fix it, merge again and commit the new hash.
   Leave an unchanged commitment alone: it stays in every round at no cost, and
   committing it again moves your block later, which can hand the hash to a copier
   who committed it in between.

## Results and restarts

Miner logs, frozen candidates, and results are in `state/jobs/`. Full validator
reports are in `validator/state/rounds/`. Restarting a miner reuses completed
candidates; an interrupted training epoch starts again. The validator reloads
accepted submissions after restart. Service locks prevent duplicate launches,
and a per-device compute lock serializes work on shared hardware.

Keep started bundles at their original location: saved checkpoint paths are
absolute. Archive completed rounds between runs if disk space fills; training
and evaluation stop when less than 2 GiB is free. Regenerate bundles to upgrade
code; existing bundles are standalone snapshots.

This is a closed development fleet with a fixed one-epoch recipe. Every round
starts from the same reference with different seeds; winners are not promoted
automatically. The reused synthetic benchmark measures development progress.
Signed HTTP authenticates messages but does not encrypt them; use a trusted
private LAN. Evaluation runs each submission in a network-less namespace where
the host allows it (`sandbox` in every report says which mode ran); that bounds
network and lifetime, not every hostile-checkpoint behaviour.
