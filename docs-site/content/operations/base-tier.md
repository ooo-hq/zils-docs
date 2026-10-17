---
title: Base-model competition
description: How miners submit a replacement base, how validators score it, and what is running today.
---

# Base-model competition

The base tier lets miners compete to replace the pinned base of a text profile. A miner submits a full-weight replacement; validators score it against the current base and, if it wins, retrain a fixed set of reference adapters on both before it is promoted. Customer adapters are trained on whichever base is pinned for their job.

**Status, October 17, 2026:** the mechanism is implemented and no public round has been run. The d3-mini confirmation draw did not confirm a winner, and H2O remains the incumbent. Open admission is off by default. See [current status](#current-status) for detail, and [model profiles](/getting-started/models) for the profiles involved.

## What a round decides

1. **Submit.** A miner submits a candidate: full weights for the pinned base of one text profile.
2. **Score.** Validators score the candidate on a sealed holdout against the incumbent. A candidate is eligible when its skill is positive, its accuracy is not below the incumbent's, and its Brier improvement is at least 0.01 with a paired-bootstrap 95% lower bound above zero. Eligible candidates share the round's weight in proportion to skill.
3. **Confirm.** The best eligible candidate is scored again on a second, disjoint sealed draw at least 12 hours later and must stay eligible. This is the confirmation draw.
4. **Check adapters.** Before promotion, a fixed suite of reference adapter jobs is retrained on the incumbent and the candidate with the production recipe. The candidate passes only if no job is worse by more than 0.005 Brier and at least one is better.

Miners never receive per-case results. A round's cases are published after it closes and are never reused.

## Channels

| Channel | Advances | Used by |
| --- | --- | --- |
| `latest` | When a candidate is confirmed and passes the adapter suite | Jobs that opt in with `base_channel` on creation |
| `stable` | At most quarterly, to a base that held `latest` through a full sealed-set window with no rollback | New customer jobs by default |

A retired base keeps serving its existing releases until 30 days after its last dependent adapter is re-released, or 90 days after it leaves both channels, whichever is later.

## Current status

As of October 17, 2026:

- Candidate loading, round decisions, sandboxed evaluation, the regression suite, chain-derived admission and the dry-run promotion script are merged in the subnet repository.
- Open admission is off by default, and no public round has been run.
- The channel setting on the platform is a configuration value, not yet a registry alias. Automatic upgrades that follow `stable` are not implemented.
- The round-one sealed holdout has 1,458 teacher-authored cases in six families (292 calibration, 1,166 test). The round-one incumbent is stock H2O Lightning 4B v1.2.3, with Brier 0.184 and accuracy 87.7% on the test split through the validator path.
- Stock d3-mini (`d3-mini-4.5b-v1`) is **not promotable today** under these rules. On the night of October 16–17, 2026, one rented B300 ran 6.75 hours of trials. The first draw cleared (Brier 0.142 against 0.184 for H2O). The confirmation draw, a second disjoint teacher-authored sealed set (291 calibration and 1,156 test cases, same six families) scored 12 hours later through the deployed validator path, did not confirm a winner: d3-mini scored Brier 0.1790 and accuracy 88.6% against 0.1794 and 88.5% for H2O, an improvement of 0.0004 with a paired-bootstrap 95% interval of [−0.022, +0.023]. The rule needs at least 0.01 with a positive lower bound.
- The adapter regression suite passed, on one reference job (ABCD) where the rule asks for three or four: adapters trained on d3-mini scored calibrated Brier 0.2515 against 0.2801 for adapters trained on H2O (84.0% vs 81.6%).
- `latest` is not set (no latest base is configured). `stable` and the default for new jobs remain H2O Lightning 4B v1.2.3, H2O remains the incumbent, and no round-two decision was frozen. d3-mini remains a merged, available profile for qualified miners and validators, with its platform migrations applied, but it is not the default and is not promoted. See the [d3-mini results](/research/#d3-mini-a-multimodal-base-candidate).
- **Decision, October 17, 2026.** Zils is adopting d3-mini as its base anyway, by the owner's decision and recorded as an override of the promotion rule rather than a win under it. The grounds are capability: adapters trained on d3-mini beat adapters trained on H2O on the reference job and on ABCD, and d3-mini takes images and video, which H2O does not serve. `latest` moves to d3-mini once a permanent d3 fleet is running (a qualified d3 miner, a processor with the d3 reference, an always-warm d3 adapter runtime behind the gateway, and gateway and workflow on code that knows the profile), and `stable` follows after one real customer job has trained and served on it. Existing H2O jobs and releases keep their frozen profile and move only through `base_change` upgrade jobs. From the moment `latest` moves, stock d3-mini is the base-tier incumbent that future candidates must beat under the unchanged rule.

The submission format, fixed files and validator procedure are in the subnet's [base candidates guide](https://github.com/ooo-hq/zils/blob/main/docs/base-candidates.md). For miner setup, see [miner operations](/operations/miners).
