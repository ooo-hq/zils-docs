---
title: Changelog
description: Product and developer-tool updates for Zils.
---

# Changelog

## King-of-the-hill payout and d3 CLI support

October 19, 2026

**The base tier now pays kings only, in source.** The base-tier share is split
equally over the last five distinct registered kings: the miners of promoted
bases. A challenger earns nothing until it is crowned. With no king, the share
burns at `base_tier.burn_uid`. This replaces the 18 October rule where the exam
winner took the share.
See [who is paid](/operations/base-tier#who-is-paid).

**The adapter track can pay from hosted-queue work.** A testnet validator can pay
its adapter share from signed evidence of delivered queue jobs. It is off by
default in the validator config.

**The CLI trains d3-mini, unreleased.** The SDK source now submits d3-mini text
training jobs. No npm release includes it yet; the published CLI is 0.3.0. See
[train from the CLI](/training/cli).

## Base tier on testnet

October 18, 2026

**Submit a base candidate from outside.** Register a hotkey on Bittensor testnet
subnet 579, upload your candidate to a public Hugging Face repo, and commit it on
chain with `python -m zils.miner commit-candidate`. Validators pull it
themselves. `python -m zils.miner doctor` checks each setup step. See the
[base candidates guide](/operations/base-candidates).

**Miner terms and admission are published.** Outside miners may train customer
jobs under the [miner terms](/operations/miner-terms). The hosted queue's chain
admission is off by default; see
[miner admission](/operations/miner-admission).

**Playground.** Signed-in users can run their own trained models with their API
key (since 17 October). A question picker now adds questions by type and saves
them per model.

## d3-mini is the only base

October 17, 2026

**d3-mini (`d3-mini-4.5b-v1`) is the only served base**, for text and image
jobs, on both the `stable` and `latest` channels. The owner adopted it on
capability grounds; its confirmation draw tied, so this overrides the promotion
rule rather than winning under it. See [d3-mini](/getting-started/models).

**H2O, JevK5 and Imajev are retired.** H2O serving is off and H2O is retiring;
existing H2O jobs keep their frozen profile. [JevK5](/training/jevk5) and Imajev
are retired; image jobs run on d3-mini.

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
