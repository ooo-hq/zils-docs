---
title: Changelog
description: Product and developer-tool updates for Zils.
---

# Changelog

## Customer models pay miners

November 9, 2026

**20% of emissions for customer models.** Miners who train customers' open-tier
models now have a share: the adapter track gets 20% of emissions, paid from what
customers spend using those models through the API, up to half that spend; the
rest burns. Lite and mini keep 25% each; flash and z3, still closed, go from 25%
to 15% each. See [pool shares](/operations/soup#pool-shares).

**Customer jobs need the current miner release.** A miner that takes customer jobs
now names its installed release in every claim, and customer jobs go only to
accepted releases. An outdated miner logs "Run zils-miner update". The release
also deletes a customer's training data as soon as the miner is done with the job.
Releases and their notes are on the
[releases page](https://github.com/ooo-hq/zils/releases).

## Zils is live on Bittensor mainnet

November 3, 2026

**Subnet 127 on `finney`.** The Zils validator publishes weights on Bittensor
mainnet subnet 127. Miners register a hotkey on 127 with real TAO and commit
soup bodies with `zils-miner`; add `--network finney --netuid 127` to every chain
command, because the CLI never assumes mainnet. The subnet is full, so a
registration replaces the lowest-scoring UID past its immunity period, and a
hotkey that earns nothing can be replaced the same way. See the
[registration guide](https://github.com/ooo-hq/zils/blob/main/docs/bittensor-registration.md)
and [mining guide](https://github.com/ooo-hq/zils/blob/main/docs/mining.md).
No bodies have been committed on mainnet yet, so every pool's share burns until
the first body is kept. Entries below dated before today describe the testnet
rehearsal on subnet 579.

## Soup pools, `zils merge` and `zils-miner`

November 1, 2026

**Every base pool is a soup.** Each z3 size has its own [soup pool](/operations/soup):
miners commit model bodies, and validators keep the bodies that improve the pool and
average them into its next release. The four pools (lite, mini, flash and z3) each
get 25% of emissions, and all emissions go to the base pools. Lite and mini open
first; flash and z3 open later.

**SDK 0.4.11.** `zils merge` blends 2–5 fine-tunes of one base into a new model on
your machine, and `--pool d3-lite` or `--pool d3-mini` checks that the result is a
valid soup body ([merge models](/sdks/overview#merge-models)). Out-of-credit training
errors now say how much credit a job needs.

**The miner command is `zils-miner`.** The miner installer
(`curl -fsSL https://zils.ai/install.sh | sh`) used to install a command named
`zils`, which hid the customer CLI. The customer `zils` (`@zils/cli` 0.4.8 or later)
now forwards miner commands to `zils-miner`.

## Zils Current (now Zils Outcomes)

October 31, 2026

[Zils Current](/operations/current), since renamed Zils Outcomes, is a live stream of questions labelled by real
outcomes after they happen, so soup exams can include items no model has seen.

## z3-mini takes 8,192 input tokens

October 28, 2026

z3-mini's input limit doubled from 4,096 to 8,192 tokens per model pass, for
decisions and training. The other sizes keep 4,096. See
[z3-mini limits](/getting-started/models#z3-mini-limits).

## Pricing

October 22, 2026

Decisions cost $0.06 per million input tokens, with no charge for output. Training
costs $0.20 per million training tokens, with a $2 minimum per run (since October 21).
See [pricing and limits](/getting-started/pricing).

## `zils fit`

October 21, 2026

SDK 0.4.0 adds `zils fit`: it finds the model calls in your code that make typed
decisions and shows how much of that traffic Zils can take. In an AI coding agent,
run `npx -y @zils/cli fit agent`. See [find where Zils fits](/sdks/overview#find-where-zils-fits).

## Base-election bar lowered to +2

October 25, 2026

A base-model candidate now needs **+2 decision-score points** over the incumbent,
down from +3, with the other gates unchanged: a positive paired confidence bound,
calibration protection, two independent draws and the adapter regression suite.
Sealed exams are larger (100 test items per family) so the narrower bar is still
measured precisely, and the new exam passed qualification against the Decision
Index reference models. Six known exam families were refreshed; their public
development seed is
[`zils-ai/base-exam-seed-v3`](https://huggingface.co/datasets/zils-ai/base-exam-seed-v3).
See the [election guide](/operations/base-tier#what-a-round-decides).

## Decision-quality election guide

October 23, 2026

The [public election guide](/operations/base-tier) now documents the live mini
testnet rule: +3 decision-score points, a positive paired confidence bound and
calibration protection. It separates qualification, release-window review and
king payouts, and records the verified 50% base / 20% feature / 30% adapter
allocation. Linked candidate and miner guides are aligned; single-track
validator examples are explicitly historical. This documentation update does
not change validator configuration, elect a model or enable mainnet.

## z3 model line

Zils' decision models now use the **z3** public name. **z3-mini v1** is the
founding baseline, using unchanged upstream d3-mini weights. Other sizes remain
planned until separately released and qualified. Subsequent approved
miner-trained winners receive their own versioned releases.

Existing API IDs, pool keys, downloads and release fingerprints remain valid.
See the [z3 model guide](/getting-started/models) for names and provenance.

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
existing H2O jobs keep their frozen profile. JevK5 and Imajev
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
[Python installation](/sdks/overview#python-sdk-and-mcp-server). The playground links to
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
