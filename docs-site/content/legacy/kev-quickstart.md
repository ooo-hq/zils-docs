---
title: Quickstart (legacy Kev 0.8B)
description: Install the pinned model and run one local training and evaluation round.
---

# Run your first local round

::: warning Legacy Kev 0.8B workflow
These commands and artifacts belong to the original training system. Start with the [API quickstart](/getting-started/quickstart) for the current model; use the [JevK5 miner guide](/operations/miners) for the hosted queue.
:::

Start with synthetic data to verify the training workflow on your own hardware. This creates local experimental candidates; it does not publish a model or write to Bittensor.

## Before you start

Use macOS, Linux, or WSL 2 with Git, Python 3.13, and [uv](https://docs.astral.sh/uv/getting-started/installation/) installed. Apple Silicon and an NVIDIA RTX 4090 have been used for recorded runs. CUDA, Apple MPS, and CPU are supported device paths; CPU training can be slow.

The first setup downloads the pinned reference checkpoint and base model. You need network access for installation and downloads. Keep space available for the model cache, training outputs, and evaluation snapshots; miners stop if free disk space drops below 2 GiB.

## Repository setup

Clone the repository, then run all subsequent commands from its root:

```bash
git clone https://github.com/ooo-hq/zils.git
cd zils
uv venv --python 3.13 .venv-kev
uv pip install --python .venv-kev/bin/python \
  -r requirements/model.txt -r requirements/rehearsal.txt
.venv-kev/bin/python -m scripts.download_models
```

Commands use the `zils` package. The `.venv-kev` environment is retained for this legacy Kev workflow; older `fez` commands remain compatible. Model downloads are pinned; later runs reuse the local cache.

## Run a local fleet

### 1. Create data and miner bundles

Use fresh output directories for each experiment:

```bash
.venv-kev/bin/python -m zils.benchmark build \
  --out .private/benchmarks/local
.venv-kev/bin/python -m zils.fleet init \
  --out .private/fleet-local \
  --benchmark .private/benchmarks/local --host 127.0.0.1
```

This creates one validator and three miner bundles. Training data goes to miners. Calibration and test data stay with the validator. Generated data, signing keys, and model artifacts remain in ignored `.private/` storage.

### 2. Start the validator

```bash
.venv-kev/bin/python -m zils.fleet validator \
  --config .private/fleet-local/validator/config.json --rounds 1
```

Leave this terminal running while the validator waits for miners.

### 3. Start the miners

In a new terminal at the repository root, run:

```bash
ZILS_PYTHON="$PWD/.venv-kev/bin/python" HF_HOME="$PWD/.cache/huggingface" \
  .private/fleet-local/miner-1/start-miner --rounds 1
```

Repeat in two additional terminals, replacing `miner-1` with `miner-2` and `miner-3`. The device is selected automatically: CUDA, then MPS, then CPU. Miners sharing a device run model work sequentially.

### 4. Inspect the round

The validator saves reports under:

```text
.private/fleet-local/validator/state/rounds/
```

Read the round's `report.json` to inspect candidate evaluations and proposed weights. Weights are local results in this mode; nothing is sent to a chain. The synthetic benchmark is a development check, not evidence of quality on your business data.

## Next step

Follow [Prepare a dataset](/legacy/kev-data) to define a customer task, or [Run a legacy miner](/legacy/kev-miners) to distribute miners across a trusted private network.
