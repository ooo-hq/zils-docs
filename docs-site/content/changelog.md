---
title: Changelog
description: Product and developer-tool updates for Zils.
---

# Changelog

## SDK 0.3.0

October 13, 2026

**Grouped ranking is now an optional SDK setting.** Add `groupSize: 4` in
TypeScript or `group_size=4` in Python to compare overlapping groups. Ten items
use 10 Choice judgments instead of 90. Pairwise ranking remains the default,
so existing calls keep their behavior.

```sh
npm install @zils/sdk@^0.3.0
```

Both methods accept 2–10 JSON items and return original indices, relative
scores, comparison count, model identity and unchanged token usage. Both send
one HTTP request. Existing context limits, billing and retry behavior apply.

Grouped ranking is experimental. Fewer judgments can reduce work, but a small
synthetic live pilot found worse ordering and fallback choices. Test the full
order on your task; this release does not promise accuracy or proportional
savings. Scores remain relative strengths, not confidence percentages.

The [ranking guide](/sdks/ranking#optional-grouped-ranking) covers both SDKs,
group sizes and the tradeoff. JavaScript/TypeScript SDK and CLI 0.3.0 are
published on npm. The CLI bundles the matching Python SDK without adding a
ranking command or MCP tool. Python sync/async support is available through
source and release artifacts with SDK repository access; see
[Python installation](/sdks/overview#install-python). The playground links to
the guide and does not yet have an interactive ranking demo.

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
