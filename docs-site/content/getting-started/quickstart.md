---
title: API quickstart
description: Create a Zils API key and make a decision with an available model.
---

# Make your first API call

Call an available model without downloading weights or running a GPU. You need a Zils account with API access and a terminal with Bash or zsh, and curl.

This developer quickstart routes a support request to one of three teams. You will get a structured answer your application can inspect; the API does not move the ticket. For the broader workflow, read [how Zils fits into your application](/getting-started/ecosystem).

## 1. Create an API key

Sign in at [zils.ai/train](https://zils.ai/train), open **API keys**, and create a named key. Save the secret when it is shown; it is displayed only once. Keep it in your server's secret storage, away from browser code and source control. If your account lacks access, [contact Zils](https://zils.ai/contact).

Key management uses your signed-in session. Prediction calls use the resulting Zils API key. These credentials are not interchangeable.

Replace `YOUR_ZILS_API_KEY` in each `curl` command below with the API key you just created.

## 2. List available models

```shell
curl --fail-with-body 'https://training.zils.ai/decision/v1/models' \
  -H 'Authorization: Bearer YOUR_ZILS_API_KEY'
```

The following text example uses the shared alias `zils-shared`. Confirm it is available in your model list before continuing. The response identifies the release that actually answered; use an immutable ID from the catalog when you need to pin that release. For an image task, use the separate [image request guide](/api/images).

z3-mini is the base for new training jobs. Training profiles are different from callable model IDs; the [model guide](/getting-started/models) explains how to select an accepted adapter later.

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

## 4. Connect the answer to your workflow

Inspect the selected team and its probability before taking an action. For example, billing 0.90, technical 0.06 and account 0.04 would favor billing. These are illustrative values, not an expected response from the request above.

Your application needs its own policy for routing, review and API failures. Choose thresholds using labeled examples from your task; a 0.90 probability does not guarantee a correct answer. Start by recording predictions alongside your current process before enabling automatic actions.

You have completed the API quickstart when the response contains a resolved `model` and a valid `answers.route` distribution. You have not yet established accuracy for your application.

## Continue with your application

Install the [Zils SDK or CLI](/sdks/overview) for application integration. The [API reference](/api/reference) covers keys, bulk jobs, errors, capacity, and retention. [Prepare a dataset](/training/data) covers task evaluation and optional training.

To order several options instead of selecting one answer, try experimental
[SDK ranking](/sdks/ranking). SDK 0.3.0 keeps pairwise ranking as the default and
adds optional grouped comparisons. The guide includes Python and TypeScript
examples and explains relative scores, usage limits and the quality tradeoff.

To self-host, use the [API deployment guide](/operations/decision-api#start-from-a-fresh-clone). The historical [local JevK5 inference](/getting-started/local-inference) guide records the retired upstream runtime; it is not the current shared model.
