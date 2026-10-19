# Capabilities and remaining work

## Available workflows

[d3-mini](/getting-started/models) is the only served base since 17 October 2026, for
text and [image](/training/imajev) jobs. H2O serving is off and H2O is retiring; JevK5
and Imajev are retired. Existing H2O, Imajev and Kev jobs keep their frozen pins.
The [model guide](/getting-started/models) separates training defaults from
inference aliases and describes model-specific runtime qualification.

The [decision API](/api/reference) provides account-scoped model listing,
typed predictions and text bulk jobs. [Image decisions](/api/images) use their
own upload and request contract. [SDKs and CLI](/sdks/overview) provide published
npm installation, browser sign-in and text training; Python/MCP is source-only.
The CLI does not yet submit image training jobs.

Qualified miners train candidates, validators evaluate independent calibration
and test splits, and [activation](/training/automatic) verifies accepted releases
before registering an account-owned inference model. A completed job can return
`no_qualifying_model`. Only `ready` confirms that an accepted model is available
through the API. [Version selection](/training/versions) protects the active
version from rejected or stale upgrades.

The [repository map](/getting-started/repositories) separates model execution,
hosted services, clients, the website and documentation. Miners are the execution
architecture; bootstrap GPUs are for testing and qualification. Local and guarded
Bittensor fleets use separate setup and do not establish open network availability.

## What still needs evidence or implementation

| Area | Remaining work |
| --- | --- |
| Customer quality | Representative held-out evaluation for every task; synthetic checks do not establish improvement |
| Capacity | Sustained reliability and concurrency measurements on qualified workers |
| Public network | Mainnet, public health and chain reporting, a public leaderboard, and independently verified serving health; see the status list below |
| Clients | Python package publication; image training and bulk workflows beyond the current CLI/SDK surface |
| Model promotion | Retain exact profiles, evidence and rollback support; qualify new runtimes before assigning work |

## Open competition status

Status of the work for an open competition, as of 19 October 2026 (merged on
`main`; this page does not record what a given host runs):

1. Admission rules: base-tier entry is registration on testnet subnet 579. Miners
   upload a candidate to Hugging Face and commit it on chain with
   `zils.miner commit-candidate` (ooo-hq/zils#59); `zils.miner doctor` checks
   each setup step (#57). A validator reads the commitments itself
   ([open admission](validators.md#open-admission-base-tier), intake #53). The
   [miner terms](mining-terms.md) are published (#52) and their hash travels in
   every signed queue claim (#56). The hosted queue's chain-derived
   [admission](miner-admission.md) is built and off.
2. Isolated evaluation: the sandboxed evaluation subprocess is merged.
3. Refreshed held-out benchmarks: the round-one sealed holdout is authored
   (1,458 cases in six families). The first confirmation draw, run on
   17 October 2026 on a second, disjoint sealed set (291 calibration and 1,156
   test cases), did not confirm a winner; see [d3-mini](#d3-mini).
4. Promotion and rollback: two channels and the adapter regression suite are
   decided and implemented. The suite has run once, on 17 October 2026, and
   passed on its single reference job (the rule asks for three or four). The
   channel is platform configuration today; since 17 October 2026 `stable` and
   `latest` both name d3-mini by owner decision. A registry alias and automatic
   follow-stable upgrades remain.
5. Payment: base and adapter tracks pay from one weight vector (#49). King of
   the hill (#60, merged 19 October 2026, not deployed): the last five distinct registered kings split the base share,
   and an empty track burns at `base_tier.burn_uid`. The adapter track can pay
   from delivered hosted-queue customer jobs (`adapter_evidence`, #61, off by
   default, not deployed).
6. Public health, chain reporting and a public leaderboard: remaining. A Zils
   base-tier validator has run on testnet 579 since 18 October 2026 (#54, #58);
   it is temporary and its uptime is not guaranteed. Mainnet is not implemented.

### Base tier

Miners can submit a full-weight replacement for the pinned base of a text
profile. [Base candidates](base-candidates.md) describes the submission
contract, scoring, the confirmation draw, the regression suite and the `latest`
and `stable` channels. Candidate loading, round decisions, sandboxed evaluation,
the regression suite, chain-derived admission and the dry-run promotion script
are merged. Under the king-of-the-hill rule (merged, not deployed), a testnet fleet pays the last five kings, the promoted bases'
miners, from the base tier's share of the one weight vector (challengers earn
nothing until promoted; an unpaid share is burned), blended with adapter rounds
([two-track payment](mining.md#two-tracks-on-the-testnet-the-base-tier-pays-first)).
No outside miner has been crowned king yet.

### d3-mini

The profile `d3-mini-4.5b-v1` (vendor model `vllm-sr/d3-mini`, mirrored as
`zils-ai/d3-mini-4.5b-v1`) was merged on 16–17 October 2026: the profile and
pins, the runtime module, node provisioning and qualification, images and video
through the runtime, platform routing, a `latest` channel that can point at d3
when configured, and cross-profile upgrades with `base_change`
(see [version selection](version-selection.md#changing-the-base-profile)).

d3 was not promoted by the exam; it is the default for new jobs since
17 October 2026 by the owner's decision (below). On the night of
16–17 October 2026, on one rented B300 over 6.75 hours, the base tier's rules
were applied and stock d3-mini is **not promotable today**. The first draw
cleared (Brier 0.142 against 0.184 for H2O), but the confirmation draw, on a
second disjoint teacher-authored sealed set, did not confirm a winner: d3 0.1790
and H2O 0.1794, an improvement of 0.0004 with a paired-bootstrap 95% interval of
[−0.022, +0.023], where the rule needs at least 0.01 with a positive lower
bound. The adapter regression suite passed, on one reference job where the rule
asks for three or four.

Decision, 17 October 2026: the owner adopted d3-mini as the base anyway, on
capability grounds (adapters trained on d3 beat adapters trained on H2O on the
reference job and on ABCD; d3 takes images and video), recorded as an override of
the promotion rule rather than a win under it. The same afternoon the hosted
platform set `stable` and `latest` to d3-mini, qualified a d3 miner and serving
host, moved the owner's H2O task to d3 through a `base_change` upgrade and
switched H2O serving off. JevK5 was retired from the code on 17 October 2026 (its
frozen checkpoints stay readable). Imajev is retired too: d3 serves image jobs,
and existing frozen Imajev jobs keep their profile.
Stock d3-mini is the base-tier incumbent for round two. The recorded evidence is in
[model research](model-research.md#d3-mini-evidence-16-october-2026).

Approved miners can read and retain exported training data. Export consent does
not provide confidential compute or recall downloaded copies. Data retention
rules depend on the workflow; see the [image policy](/api/images#limits-and-retention)
and [bulk policy](/api/reference#capacity-usage-and-retention).

## Read research within its scope

The [product-matching experiment](/research/commerce) recorded an additional
JevK5 adapter that reduced held-out accuracy and worsened probability error.
It was not promoted. The [queue pilot](/research/queue-pilot) missed its frozen
acceptance threshold and delivered no accepted model.

H2O's current-runtime training/reload check is compatibility evidence, not a
matched quality or speed comparison. Earlier speed ratios use different runtime
conditions and cannot promise current-stack performance. Preserve unfavorable
results and compare models on the same cohort and stack.
