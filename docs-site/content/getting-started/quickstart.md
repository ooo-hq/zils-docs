---
title: API quickstart
description: Create a Zils API key and make a decision with an available model.
---

# Make your first API call

Call an available model without downloading weights or running a GPU. You need a Zils account with API access and a terminal with Bash or zsh, and curl.

## 1. Create an API key

Sign in at [zils.ai/train](https://zils.ai/train), open **API keys**, and create a named key. Save the secret when it is shown; it is displayed only once. Keep it in your server's secret storage, away from browser code and source control. If your account lacks access, [contact Zils](https://zils.ai/contact).

Key management uses your signed-in session. Prediction calls use the resulting Zils API key. These credentials are not interchangeable.

Replace `YOUR_ZILS_API_KEY` in each `curl` command below with the API key you just created.

## 2. List available models

```shell
curl --fail-with-body 'https://training.zils.ai/decision/v1/models' \
  -H 'Authorization: Bearer YOUR_ZILS_API_KEY'
```

The shared alias is `zils-shared`. H2O becoming the training default does not change that alias. Available private H2O, Imajev and legacy models are scoped to your account; image models use the [image request contract](/api/images). Use an immutable model ID from the catalog when you need to pin a release.

## 3. Ask a typed question

```shell
curl --fail-with-body 'https://training.zils.ai/decision/v1/systemone' \
  -H 'Authorization: Bearer YOUR_ZILS_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "zils-shared",
    "state": "Please send the invoice for my last order.",
    "questions": {
      "route": {
        "type": "choice",
        "instructions": "Choose the responsible team.",
        "criteria": {
          "billing": "Invoices and payments",
          "technical": "Software troubleshooting",
          "account": "Account access"
        }
      }
    }
  }'
```

The response's `answers.route` contains the selected `choice`, per-option `probabilities`, and `confidence`. The top-level `model` identifies the resolved release; `usage` records input tokens and zero generated output tokens. Read the actual returned values rather than assuming this example establishes accuracy on your traffic.

The API also supports yes/no (`noul`) and score questions. [How decisions work](/getting-started/decisions) explains the fields and their meaning.

## Continue with your application

Install the [Zils SDK or CLI](/sdks/overview) for application integration. The [API reference](/api/reference) covers keys, bulk jobs, errors, capacity, and retention. [Prepare a dataset](/training/data) covers task evaluation and optional training.

To self-host, use the [API deployment guide](/operations/decision-api#start-from-a-fresh-clone). To run the upstream model directly, follow [local JevK5 inference](/getting-started/local-inference). The upstream runtime and Zils gateway have different request validation and confidence contracts.
