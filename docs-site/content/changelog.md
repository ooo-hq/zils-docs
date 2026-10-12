---
title: Changelog
description: Product and developer-tool updates for Zils.
---

# Changelog

## SDK 0.2.0

October 12, 2026

**Rank a short list by your own criterion.** The new experimental `rank` function
orders 2–10 JSON items using the existing model. It returns original item
indices, relative scores, comparison count, model identity, and token usage.

For example, give Zils several possible support actions and ask which best
addresses the customer's issue. Your application can use the full order or
choose the first item under its own policy.

```sh
npm install @zils/sdk@^0.2.0
```

Read the [ranking guide](/sdks/ranking) for runnable TypeScript and Python
examples. [Noul, Choice, and Score](/getting-started/decisions) remain available;
ranking combines Choice comparisons in the SDK without adding a new API question
type or training a new model.

| Surface | Available in this release |
| --- | --- |
| JavaScript/TypeScript SDK | `client.rank` in the public npm package |
| Python SDK | Sync and async `client.rank`; source and release wheel require repository access |
| npm CLI | 0.2.0 bundles the matching Python SDK; no ranking command |
| MCP | Existing decision tools; no ranking tool |
| Playground | Ranking guide link; no interactive ranking demo yet |

Ranking is experimental. Scores are relative strengths, not confidence
percentages. Every pair is compared in both orders: three items require six
judgments and ten require 90. Existing usage limits and billing apply.
This release does not establish better accuracy on your task.

The [SDK overview](/sdks/overview) covers installation and credentials. The
JavaScript/TypeScript package is available on [npm](https://www.npmjs.com/package/@zils/sdk).
