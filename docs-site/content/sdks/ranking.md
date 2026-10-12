---
title: Rank options
description: Order 2–10 options by your criterion with the experimental Zils ranking SDK.
---

# Rank options

Give Zils a short list and describe what should come first. The SDK returns the
ranked order and relative scores. For example, rank support actions by how well
they address a customer's issue, or rank product descriptions by relevance to a
request.

**Available in SDK 0.2.0 · Experimental.** Ranking is available in the
JavaScript/TypeScript and Python SDKs. The [playground](https://zils.ai/playground)
links to this guide; it does not yet have an interactive ranking demo.

## Choose the right operation

| You want to… | Use |
| --- | --- |
| Answer a yes/no question | Noul (`noul`) |
| Select one named option | Choice (`choice`) |
| Rate something against defined, ordered levels | Score (`score`) |
| Order a short list by a criterion | SDK `rank` |

Noul, Choice, and Score remain the API's question types. `rank` is an additional
SDK function: it combines Choice comparisons using the existing model and
`/v1/systemone` endpoint. There is no `type: "rank"` question, new model to train,
ranking CLI command, or ranking MCP tool.

## JavaScript and TypeScript

Use Node.js 20 or newer and install the published package:

```sh
npm install @zils/sdk@^0.2.0
```

Set `ZILS_API_KEY` through your server's secret storage. The SDK uses an inference
API key, independently of CLI browser sign-in. Follow the
[API quickstart](/getting-started/quickstart) if you need a key and model access.
Keep credentials and SDK calls on the server.

```ts
import { ZilsClient } from '@zils/sdk';

const client = new ZilsClient();
const items = ['Update the logo', 'Checkout is failing', 'Fix a typo'];
const result = await client.rank({
  items,
  instructions: 'Most urgent customer impact first',
});

for (const entry of result.ranking) {
  console.log(items[entry.index], entry.score);
}
console.log(result.model, result.comparisons, result.usage.billable_input_tokens);
```

The request can include `model` to select a model available to your account.
The second argument accepts the existing timeout, retry, and abort-signal
options. See [SDK configuration](/sdks/overview#credentials-and-defaults).

## Python

Use Python 3.11 or newer and the 0.2.0 package. Python is available through source
and release artifacts that require SDK repository access; it is not on PyPI.
See [Python installation](/sdks/overview#install-python) before running this code.
Set `ZILS_API_KEY` through your application's secret storage.

```python
from zils_sdk import ZilsClient

items = ["Update the logo", "Checkout is failing", "Fix a typo"]
with ZilsClient() as client:
    result = client.rank(items, "Most urgent customer impact first")
    for entry in result.ranking:
        print(items[entry.index], entry.score)
    print(result.model, result.comparisons, result.usage.billable_input_tokens)
```

Use `AsyncZilsClient` with `async with` and `await client.rank(items, instructions)`
for asynchronous applications. Both clients accept existing per-call `model`,
timeout, retry, and extra-header options.

## Read the result

`ranking` contains every item, strongest first. Each entry has a zero-based
`index` into your original list and a relative `score`. Equal scores retain
input order. Duplicate items remain separate entries.

A score of **1 means strongest in this list**, not 100% confidence or perfect
quality. Tied leaders can all score 1. Scores do not sum to 1 and should not be
compared across different lists or criteria. Even the best option in a poor list
can score 1; your application still needs a policy for whether to use it.

The result also includes the responding `model`, the number of `comparisons`, and
the original `usage`. Inspect the returned values; the example does not promise
a particular ranking or score.

## Limits and usage

Supply **2–10 finite JSON items** and a nonempty instruction. Items may be text,
numbers, or structured records. Object keys must be strings. Convert dates,
sets, and custom objects to JSON yourself. Put any shared context needed to
judge the options in the instructions.

The SDK compares every pair in both orders in one HTTP request:

| Items | Choice judgments |
| --- | --- |
| 2 | 2 |
| 3 | 6 |
| 10 | 90 |

The count is `n * (n - 1)`. One HTTP request can involve many model judgments.
Existing context, request, execution, and billing limits still apply; ten long
documents may exceed them. Use returned usage rather than assuming the cost of
a single Choice question.

`usage.input_tokens` measures resource use. `usage.billable_input_tokens` measures
billable input and can be absent; do not substitute the resource count for it.
Automatic retries remain off by default.

## How it works and when to use it

The SDK averages the two presentation orders of each pair, then fits relative
Bradley–Terry strengths locally. Comparing both orders reduces a fixed preference
for the first option, but does not guarantee correct or unbiased comparisons.
This feature does not train or change the model's weights.

Use ranking for a short list whose order requires interpreting text or context.
For exact arithmetic, unit conversion, or a purely numeric sort, use ordinary
code. Evaluate ranking on labeled examples from your task before relying on it;
the release does not establish an accuracy gain over Choice.

Invalid inputs are rejected before a request. Incomplete or invalid comparisons
raise an error instead of returning a partial ranking. A model request can
already have been billed even if its response cannot be ranked. API and transport
errors propagate normally; there is no automatic repair request.

Read the [0.2.0 release note](/changelog#sdk-0-2-0) for availability across SDKs,
the CLI, and the playground.
