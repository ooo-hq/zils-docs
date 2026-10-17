---
title: Run JevK5 locally (historical)
description: Historical guide to running the retired JevK5 4B checkpoint locally with its upstream runtime.
---

# Run JevK5 4B (historical)

::: warning Retired model
JevK5 4B no longer powers the shared Zils decision API: it was [retired on 17 October 2026](/training/jevk5) in favour of [d3-mini](/getting-started/models). This guide stays as the record of the upstream runtime used by the [product-matching experiment](/research/commerce); it is not a current Zils workflow.
:::

Use the upstream JevK5 runtime to turn context and a typed question into probabilities. This guide runs it on your own GPU. To call the hosted Zils service, use the [API quickstart](/getting-started/quickstart).

## Before you start

Use Linux x86_64 or WSL 2, Git, Python 3.13, and an NVIDIA GPU with a working CUDA driver and BF16 support. The upstream model card estimates about 9 GB of GPU memory for the BF16 model; leave additional room for inputs and runtime overhead. Allow at least 25 GB of free disk for weights, packages, and cache. The separate Zils commerce experiment used an RTX 4090.

This recipe uses the CUDA runtime. For other hardware, consult the upstream [alternative runtimes](https://github.com/allebee/jevk5/tree/f26426d16f59e8bbe1470e5b162cc89329e29b29#run-it-on-any-gpu-a-mac-or-a-cpu); their performance is outside the Zils experiment's measurements.

## 1. Create an environment

Start in a directory where you want to keep the model and environment. Use the same directory and activated environment for the remaining commands.

```bash
mkdir -p zils-jevk5
cd zils-jevk5
python3.13 -m venv .venv-jevk5
. .venv-jevk5/bin/activate
python -m pip install \
  'torch==2.8.0' 'transformers==5.17.0' \
  'accelerate==1.15.0' 'huggingface-hub==1.33.0' \
  'jevk5 @ git+https://github.com/allebee/jevk5@f26426d16f59e8bbe1470e5b162cc89329e29b29'
python -c 'import torch; assert torch.cuda.is_available(), "CUDA is not available"; assert torch.cuda.is_bf16_supported(), "BF16 is not supported"; print(torch.cuda.get_device_name())'
```

The runtime source is pinned to version 0.3.3 at the commit shown above. Installation and the first model download need internet access. Optional acceleration packages are not required for this example.

## 2. Download the pinned model

```bash
python - <<'PYTHON'
from huggingface_hub import snapshot_download

snapshot_download(
    repo_id="alibiserikbay/JevK5",
    revision="c4f7fdb3aeab5582336406e78d3bef11bf98833d",
    local_dir="models/jevk5",
    allow_patterns=["*.json", "*.safetensors", "*.jinja", "README.md", "SHA256SUMS"],
)
PYTHON
```

This is the same starting checkpoint revision recorded in the [Zils product-matching experiment](/research/commerce). Its merged weights are based on Qwen3.5-4B. Keep `jevk5_config.json` with the weights: it supplies the model's calibration settings. A floating model name can fetch a different revision later.

## 3. Make a decision

```bash
python - <<'PYTHON'
import json
from jevk5 import JevK5

model = JevK5("models/jevk5", graphs=False)
result = model.decide(
    "Please send the invoice for my last order.",
    {
        "type": "choice",
        "instructions": "Choose the team responsible for this request.",
        "criteria": {
            "billing": "Invoices, payments, and refunds",
            "technical": "Software failures and troubleshooting",
            "account": "Account access and profile changes",
        },
    },
)
print(json.dumps(result, indent=2))
PYTHON
```

The result includes `choice`, `confidence`, `probabilities`, and `input_tokens`. Read the actual returned probabilities; an example request does not establish accuracy on your traffic. This first run disables CUDA graph capture to simplify startup. It is not a latency benchmark.

## 4. Call it over local HTTP

The upstream server can expose the downloaded model on loopback:

```bash
JEVK5_GRAPHS=0 jevk5-serve \
  --model models/jevk5 --host 127.0.0.1 --port 8090
```

Leave that terminal running. In a second terminal, send a request:

```bash
curl --fail-with-body http://127.0.0.1:8090/v1/systemone \
  -H 'Content-Type: application/json' \
  -d '{"state":"Please send the invoice for my last order.","questions":{"route":{"type":"choice","instructions":"Choose the responsible team.","criteria":{"billing":"Invoices and payments","technical":"Software troubleshooting","account":"Account access"}}}}'
```

Read `answers.route` for the decision. Stop the server with Ctrl+C. This upstream local server serializes model work and does not provide Zils tenant accounts, managed credentials, or usage controls.

Continue with [Prepare a dataset](/training/data) to evaluate your task. Miner operators should use the [JevK5 miner guide](/operations/miners) for the hosted training queue.

Source references: [pinned runtime](https://github.com/allebee/jevk5/tree/f26426d16f59e8bbe1470e5b162cc89329e29b29), [pinned model](https://huggingface.co/alibiserikbay/JevK5/tree/c4f7fdb3aeab5582336406e78d3bef11bf98833d), and [model license](/research/attribution).
