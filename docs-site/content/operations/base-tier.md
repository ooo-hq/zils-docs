---
title: Base-model competition
description: The live testnet decision-quality election, king payouts, and reviewed z3 release process.
---

# Base-model competition

Miners compete to improve **z3** by submitting a full-weight replacement for a pool's pinned base. Validators measure decision quality on private exams. Passing an exam does not earn a reward or publish a model: a candidate must qualify, survive a release-window comparison, and receive reviewed promotion.

**Live status, checked 25 October 2026:** the decision-quality election is running for z3-mini on testnet subnet **579**. The incumbent is **z3-mini v1**, the founding baseline using unchanged upstream d3-mini weights. Its king history is empty; no elected successor or completed release window was present at this check. Mainnet incentives are not live.

The five public lineages are z3-lite, z3-nano, z3-mini, z3-flash and z3. Their operational pool keys remain `d3-lite`, `d3-nano`, `d3-mini`, `d3-flash` and `d3`. Only the mini base competition is enabled in this verified configuration; each other base pool is disabled with zero allocation. A registered profile alone does not open a competition. See [public names and artifact identities](/getting-started/models#public-names-and-artifact-identities).

The z3-mini pool runs as a **soup pool** from the mainnet launch: instead of crowning one candidate, validators average up to five miner bodies each day and pay seats in that soup. See [Soup pool](/operations/soup). The king election below applies to every other pool.

## Submit a candidate

Start with [Tune a base miner](/operations/miner-tuning) for a smoke attempt,
training settings, code entry points and a controlled comparison workflow.

1. **Train and merge.** Produce a full-weight replacement for the exact incumbent of an enabled pool. The [base candidates guide](/operations/base-candidates) describes the recipe and frozen artifact contract.
2. **Upload.** Put the artifact in your public Hugging Face model repository, pinned by commit.
3. **Commit on chain.** Run `python -m zils.miner commit-candidate` with a hotkey registered on testnet subnet 579. The commitment is `zils1:<sha256>:<revision>:<owner/repo>`. Without `--yes`, this is a dry run.
4. **Check.** Run `python -m zils.miner doctor` to check the submission setup.

One hotkey has one active candidate commitment. The pinned parent routes it to a pool. Disabled pools, wrong-lineage parents and copied earlier commitments are rejected. Validators discover commitments on chain and download candidates; miners need no inbound port or validator URL.

Each pool can have its own **submission cooldown**: the minimum time between one hotkey's distinct submissions to that pool, counted in chain blocks. A commitment inside the cooldown is refused at intake, after you have already paid for its training and upload; commit again once it has passed. Retries and the confirmation run of an accepted submission are never refused, and each pool's cooldown is tracked separately. If you run the [automatic base miner](https://github.com/ooo-hq/zils/blob/main/docs/automatic-base-mining.md), set `interval_seconds` to at least the pool's cooldown, plus a small margin.

## What a round decides

The election uses a **0–100 decision score**, with separate metrics for each question type:

| Question type | Family metric | Trivial baseline |
| --- | --- | --- |
| Choice | Exact accuracy | Strongest of uniform guessing, fixed option ID and fixed original position |
| Yes/no (`noul`) | Balanced accuracy | 0.5; both classes required |
| Score | Expected numeric outcome's normalized mean absolute error | Best constant target-median prediction |

Each family becomes skill relative to its baseline, clipped to [0, 1]. Families are averaged equally within each category and known/new block; those blocks weigh 60%/40%. Category weights are reasoning 25.85%, language 25.85%, retrieval 20.02%, tools 18.28%, and arts 10%. Every category covers all three question types.

A candidate must pass **all three gates on each qualifying draw**:

| Gate | Requirement |
| --- | --- |
| Decision improvement | At least **+2.0 points** over the incumbent |
| Uncertainty | Paired bootstrap **lower 95% bound strictly above zero**, using 2,000 resamples |
| Calibration protection | Calibrated full-vector Brier increases by **no more than 0.005** |

Temperature is fitted only on the sealed calibration split; the decision is measured on the sealed test split. These are base-election rules. Customer adapter acceptance rules and feature-track metrics are separate.

Every eligible candidate can qualify, including a runner-up. A second independent draw must start at least **12 hours after both the candidate and incumbent finish their first-draw evidence**. The same checkpoint must pass again. Reusing a cached result does not create a second independent draw or reset its completion time.

Public results expose aggregate metrics and evidence hashes. Private predictions and per-case outcomes are not returned to miners. Disclosing exam cases retires them from future inference; finishing a round does not automatically publish the private exam.

## From qualification to a release

1. **Pass both draws.** Bind the candidate, incumbent, policy and chain ownership to the verified evidence.
2. **Pass the adapter regression suite.** Use every pinned reference job under seeds **553, 771 and 991**. For each job, mean accuracy may fall by at most **0.01** (one percentage point) and mean Brier may rise by at most **0.005**. Flat results pass; missing jobs or seeds fail. Save a verified readiness receipt.
3. **Close a scheduled release window.** The implemented contract requires a declared **14–28 day** schedule. Freeze all active ready candidates before scoring them and the incumbent on one fresh, common, independent closing draw. The highest-scoring survivor wins; ties prefer the earlier commitment, then checkpoint hash. Later entrants wait for a later window. No survivor means no new king. This schedule requirement does not announce a currently scheduled release date.
4. **Review and install promotion.** Stage the verified winner as a new versioned z3 release with provenance and evidence. Upload is opt-in. Staging alone does not install validator configuration, publish chain weights or change hosted channels. Approved promotion updates the incumbent and king history.

Readiness and window receipts are bootstrap-validator attestations; they do not establish multi-validator consensus. The [operator election runbook](https://github.com/ooo-hq/zils/blob/main/docs/base-election.md#qualify-candidates-and-close-a-release-window) documents the verified commands and required receipts.

## Who is paid

**Only crowned kings receive base-model rewards.** Passing one or both exams, producing a readiness receipt, or winning a closing comparison does not itself start payment.

For each pool, take the five most recent distinct king hotkeys, then keep those still registered. They split that pool's allocation equally. A deregistered king drops out of that set and the remaining members share its slice. A hotkey in multiple pool histories receives the sum of its allocations. A pool with no eligible king, or a disabled pool, sends its allocation to the configured burn UID; other pools do not inherit it.

The installed testnet allocation, checked **23 October 2026**, is:

| Track | Share of the configured reward vector | Allocation within the track |
| --- | --- | --- |
| Base models | **50%** | All assigned to mini; other base pools receive zero |
| Feature tracks | **20%** | 80% mini box / 20% lite box (16% / 4% of the whole vector) |
| Customer adapters | **30%** | Eligible hosted-queue work |

These are configured weight allocations, not guaranteed token earnings. Feature tracks have their own metrics and king histories; enabling the lite box track does not enable the lite base election. Each track is normalized over its own earners. An unearned allocation goes to the subnet-owner burn UID rather than increasing another track's share. With no mini king, the base allocation burns. The older 70/30 base/adapter split is historical.

## Channels

| Channel | Required review | Used by |
| --- | --- | --- |
| `latest` | Verified window winner, exact-profile registration, platform training/serving qualification, and explicit channel proposal review | New jobs opting in with `base_channel` |
| `stable` | Prior latest passes legacy regression and every-job/every-seed migration checks, with no unresolved recorded problems | New customer jobs by default |

A newly elected latest cannot become stable in the same window. A window with no new king can still advance the prior latest if its checks pass. The proposal binds the actual channels at window opening; installation is a separate reviewed action.

Each pool has separate channels. Existing jobs and adapters keep their exact base until their own migration is accepted. Automatic upgrades that follow stable are not implemented. A channel is a platform configuration value, not an inference alias.

## Activation and evidence

Each base pool needs its own qualified exam, frozen policy and blueprint, immutable model/runtime identities, and adapter-suite manifest before intake is enabled. Software tests alone do not qualify GPU hardware, a model or a private exam. Hosted availability additionally requires training and serving qualification, capacity and profile registration.

The 17 October adoption of stock d3-mini was an owner override after its confirmation draw against H2O tied. That historical result and the z3-mini v1 founding release are not wins under the current election. No candidate promotion is implied by the z3 naming update.

The current contract lives in the [decision-quality election runbook](https://github.com/ooo-hq/zils/blob/main/docs/base-election.md); see also [model pools](https://github.com/ooo-hq/zils/blob/main/docs/model-pools.md) and [platform qualification](https://github.com/ooo-hq/zils-platform/blob/main/docs/model-pools.md). Current validators use `base_pools` and `base_pool_rounds`. Do not deploy the legacy `base_tier` examples alongside them.
