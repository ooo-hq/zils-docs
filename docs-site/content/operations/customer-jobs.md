---
title: Train customer jobs
description: "Train customers' open-tier models on your GPU: register a hotkey, qualify the host, run the queue worker, keep to the current release, and earn from the adapter track."
---

# Train customer jobs

When a customer trains on the open tier, network miners train the model. A
customer-job miner runs a **queue worker**: it claims a job, trains a z3-mini
adapter on the job's training split, and submits it. Zils evaluates the result on
data the miner never sees and serves accepted models through its API.

This is separate from the [soup pools](/operations/soup). `zils-miner` commits
soup bodies; it has no customer-job command. One host can do both, and customer
jobs then take priority on a shared card.

## Who can join

Registering a hotkey on mainnet subnet 127 is the admission. There is no
application and no operator approval. The coordinator at `https://training.zils.ai`
reads the subnet's registrations itself. `GET https://training.zils.ai/v1/config`
shows `admission`: mode `chain`, the network and netuid, and the `terms_sha256` of
the current [miner terms](/operations/miner-terms).

You need:

- A hotkey registered on subnet 127 ([Register on Bittensor](/operations/bittensor-registration)).
  Keep the coldkey off the mining host.
- Linux x86_64 or WSL 2 with an NVIDIA GPU that supports BF16 and its CUDA driver.
  The worker needs **12 GB (12,288 MiB) of free GPU memory**; training peaks at
  about 10.5 GB on an RTX 4090. CPU and Apple MPS are not supported.
- About 25 GB of free disk for models and dependencies, plus room for job data.

Customer jobs run on z3-mini only (`d3-mini-4.5b-v1`, inputs up to 8,192 tokens).

## What you receive

For each job: the training split only (states, questions and labels) and, for an
image job, its training photos. Calibration and test splits, acceptance
thresholds and the customer's identity stay with Zils. Private-tier jobs never
reach network miners.

The [miner terms](/operations/miner-terms) apply. Use the data only for the job,
do not serve or hand over the adapter, and delete what you keep.

The worker deletes a job's training rows, photos and partial downloads as soon as
it leaves the job: after it submits, when the lease is lost, when the job is
cancelled or fails, and when it hands the job back. Anything a crash left behind
is deleted before the next claim. The trained candidate, raw training output and
logs stay on disk. The terms require you to delete those within 7 days of the job
finishing; the worker does not do that yet.

## 1. Install

The miner installer clones the `zils` repository at the stable release into
`~/.zils/zils` and builds both runtimes. `ZILS_SKIP_SETUP=1` skips the soup
miner's setup questions:

```bash
curl -fsSL https://zils.ai/install.sh | ZILS_SKIP_SETUP=1 sh
cd ~/.zils/zils
export ZILS_D3_RUNTIME_PYTHON="$PWD/.venv-d3/bin/python"
.venv-d3/bin/python -m zils.d3 reference --out models/d3-reference
```

The reference command downloads and checks the pinned z3-mini weights (about
9 GB). Run every command below from `~/.zils/zils`.

## 2. Accept the terms and qualify the host

Read the [miner terms](/operations/miner-terms). Mining with a registered hotkey
is acceptance. Check that the hash of your copy matches the one the coordinator
publishes:

```bash
sha256sum docs/mining-terms.md
curl -s https://training.zils.ai/v1/config
```

Then qualify the host on its real hardware. This runs the pinned runtime check,
a training step at the 8,192-token cap and an adapter reload, and writes
`qualification.json`:

```bash
.venv-kev/bin/python -m scripts.qualify_node --model d3-mini-4.5b-v1 \
  --runtime-python .venv-d3/bin/python --out .private/qualification \
  --terms-sha256 YOUR_TERMS_SHA256
```

## 3. Configure the worker

```bash
mkdir -p .private && chmod 700 .private
```

Save this as `.private/queue-miner.json`, with your own wallet details and the
terms hash:

```json
{
  "coordinator": "https://training.zils.ai",
  "hotkey": "YOUR_PUBLIC_HOTKEY_SS58_ADDRESS",
  "wallet": {
    "name": "YOUR_WALLET_NAME",
    "hotkey": "YOUR_HOTKEY_NAME",
    "path": "/absolute/path/to/your/wallets"
  },
  "terms_sha256": "YOUR_TERMS_SHA256",
  "qualification": ".private/qualification/qualification.json"
}
```

```bash
chmod 600 .private/queue-miner.json
```

The wallet directory must hold the named hotkey on this machine; the worker
checks that its address matches `hotkey` before it starts. Use a dedicated
operating-system account for the miner.

## 4. Start the worker

```bash
export ZILS_D3_RUNTIME_PYTHON="$PWD/.venv-d3/bin/python"
.venv-kev/bin/python -m miner.queue \
  --config .private/queue-miner.json --state .private/queue-miner \
  --reference models/d3-reference --device cuda
```

At startup the worker admits itself: it sends the terms hash and the
qualification report, signed by the hotkey. Every claim then carries the terms
hash and the installed release. The worker checks for work every ten seconds and
can stay quiet for a long time when there is none. Keep the same `--state` folder
across restarts; only one worker can use it at a time. Use a service supervisor
for continuous operation.

Work arrives in this order:

1. **Qualification jobs.** Synthetic jobs that grade the host. Zils pays for up
   to three qualification runs per hotkey every 30 days, queued one at a time and
   only while your worker is online and sending heartbeats. They earn nothing.
2. **Customer jobs**, once three qualification reports pass.

A successful submission prints `Submitted candidate for job ...`. That means the
artifacts arrived; Zils' evaluation decides whether the model is accepted.

## Stay on the current release

Every claim names the `zils` commit the worker runs. Customer jobs go only to
accepted releases: the current stable release (the commit in
[`release/stable`](https://github.com/ooo-hq/zils/blob/main/release/stable)) and,
for 24 hours after a **required** release, the one before it. After that, claims
from the older release are refused, and the worker logs:

```text
This miner is at ...; customer jobs need a current release. Run zils-miner update.
```

Run `zils-miner update`, then restart the worker. An **optional** release refuses
nothing; `zils-miner doctor` warns until you update. Each release says which it is
in its notes on the [releases page](https://github.com/ooo-hq/zils/releases). A
worker started from a copy without git history sends no release and gets no
customer jobs.

## How customer jobs pay

The adapter track has 20% of emissions ([pool shares](/operations/soup#pool-shares)).
A validator that runs the published rule pays it from signed platform evidence of
paid API use:

- You earn when an open-tier model you trained is accepted, delivered to the
  customer, and the customer pays to use it through the API. That spend counts
  for 30 days after delivery and is settled over 72-hour windows.
- Miners as a group earn at most half of that spend (`revenue_cap` 0.5). The
  rest of the share burns.
- Free and test use, qualification runs and undelivered models earn nothing.
  Only hotkeys registered on the subnet earn.

The full rule is in [Run a validator](/operations/validators#_7-pay-the-adapter-track-from-paid-adapter-use).
No earnings are promised: there may be no paid use, and your costs are yours.
