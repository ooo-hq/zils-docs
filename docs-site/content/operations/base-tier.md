---
title: Base-model competition
description: How miners submit a replacement base, how validators score it, how kings are paid, and what is running today.
---

# Base-model competition

The base tier lets miners compete to replace the pinned text base. A miner submits a full-weight replacement; validators score it against the current base and, if it wins, retrain a fixed set of reference adapters on both before it is promoted. Customer adapters are trained on whichever base is pinned for their job.

The model-pool implementation stages five independent competitions:
`d3-lite`, `d3-nano`, `d3-mini`, `d3-flash` and `d3`. Each has its own immutable
incumbent, draws, regression evidence, promotion history and allocation. d3-mini
keeps its existing state. The four new competitions start disabled with zero
allocation; no new pool is open merely because its profile is registered.

## Submit a candidate

1. **Train and merge.** Produce a full-weight replacement for the exact incumbent of one enabled pool. The reference recipe trains the production LoRA and merges it into the base. The [base candidates guide](/operations/base-candidates) lists the fixed files and the artifact format.
2. **Upload.** Put the artifact in your own public Hugging Face model repo, pinned by commit.
3. **Commit on chain.** Run `python -m zils.miner commit-candidate` with a hotkey registered on subnet 579. It writes `zils1:<sha256>:<revision>:<owner/repo>` as your chain commitment. Without `--yes` it is a dry run.
4. **Check.** `python -m zils.miner doctor` checks each step in order and prints the first fix.

One hotkey has one active candidate commitment. Its pinned parent metadata routes it to one pool; disabled pools and stale or wrong-lineage parents are rejected before GPU evaluation. Validators read the commitments and pull the candidate themselves. No open port or validator URL is needed. The earlier push command, `announce-candidate`, is removed. See [compete from outside](/operations/fleet-miners#compete-in-the-base-tier-from-outside).

## What a round decides

1. **Score.** Validators score the candidate on a sealed holdout against the incumbent. It is eligible when its skill is positive, its accuracy is not below the incumbent's, and its Brier improvement is at least 0.01 with a paired-bootstrap 95% lower bound above zero. The best eligible candidate is the pending winner.
2. **Confirm.** The pending winner is scored again on a second, disjoint sealed draw at least 12 hours later and must stay eligible.
3. **Check adapters.** Reference adapter jobs are retrained on the incumbent and the candidate with the production recipe. The candidate passes only if no job is worse by more than 0.005 Brier and at least one is better.
4. **Promote.** A candidate that passes all three is promoted in an owner-reviewed pull request. That crowns its miner as the newest king.

Miners never receive per-case results. A round's cases are published after it closes and are never reused.

## Who is paid

King of the hill, following Teutonic (owner decision, 19 October 2026; zils#60):

- Only kings are paid. A king is the miner of a promoted base.
- Each pool's allocation is split equally over its last five distinct registered king hotkeys.
- A challenger earns nothing until it is crowned. To dethrone the king it must clear the same 0.01 margin, the confirmation draw and the adapter suite.
- With no eligible king, or with a disabled pool, its allocation burns at the configured burn UID. Other pools are not renormalized. A hotkey in multiple pool histories receives the sum of its earned allocations.

Fixed configurable pool fractions sum to one inside the existing base budget. Staging preserves the 70/30 base/adapter split: mini starts with the full base allocation and the new pools with zero. No new percentages are implied. Base and adapter rounds pay from one weight vector. The 18 October rule, where the exam winner took the share, is gone. See [two-track payment](/operations/fleet-miners#two-tracks-on-the-testnet-the-base-tier-pays-first).

## Channels

| Channel | Advances | Used by |
| --- | --- | --- |
| `latest` | When a candidate is promoted | Jobs that opt in with `base_channel` on creation |
| `stable` | After a promoted base survives a full window on `latest` | New customer jobs by default |

Each pool has separate channel configuration; inspect current discovery for exact profile IDs. The channel is a platform configuration value, not an inference alias. Automatic upgrades that follow `stable` are not implemented.

## Activation and evidence

Local fixture and database tests verify routing, frozen profiles, replay and
reward composition. They do not qualify GPU hardware or establish live capacity.
Before activation, operators must register the pinned profile, measure its own
runtime/recipe at the full context cap and advertised modalities, qualify training
and serving separately, configure the pool's channels and capacity, and review
its allocation. Published catalogs fail closed when qualification or capacity is
missing. Owner-reviewed promotion remains required.

The 17 October adoption of stock d3-mini was an owner override after its
confirmation draw against H2O tied. Earlier rehearsals and experiments remain
historical evidence; they do not certify every d3 pool. See [d3 model pools](/getting-started/models)
and the [base candidates guide](/operations/base-candidates).

Operator configuration and staging commands live with their owners:
[subnet pools](https://github.com/ooo-hq/zils/blob/main/docs/model-pools.md) and
[platform qualification](https://github.com/ooo-hq/zils-platform/blob/main/docs/model-pools.md).
Do not configure legacy `base_tier` and new `base_pools` simultaneously. The staging
script preserves mini's incumbent and history; review its output before installing it.
