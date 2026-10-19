---
title: Base-model competition
description: How miners submit a replacement base, how validators score it, how kings are paid, and what is running today.
---

# Base-model competition

The base tier lets miners compete to replace the pinned text base. A miner submits a full-weight replacement; validators score it against the current base and, if it wins, retrain a fixed set of reference adapters on both before it is promoted. Customer adapters are trained on whichever base is pinned for their job.

**Status, 19 October 2026:** d3-mini (`d3-mini-4.5b-v1`) is the base and the incumbent. The loop is merged and runs on Bittensor testnet subnet 579. No outside candidate has been promoted, so there is no king yet. The king-of-the-hill payout is merged and **not deployed**. See [current status](#current-status).

## Submit a candidate

1. **Train and merge.** Produce a full-weight d3-mini replacement. The reference recipe trains the production LoRA and merges it into the base. The [base candidates guide](/operations/base-candidates) lists the fixed files and the artifact format.
2. **Upload.** Put the artifact in your own public Hugging Face model repo, pinned by commit.
3. **Commit on chain.** Run `python -m zils.miner commit-candidate` with a hotkey registered on subnet 579. It writes `zils1:<sha256>:<revision>:<owner/repo>` as your chain commitment. Without `--yes` it is a dry run.
4. **Check.** `python -m zils.miner doctor` checks each step in order and prints the first fix.

Validators read the commitments and pull the candidate themselves. No open port or validator URL is needed. The earlier push command, `announce-candidate`, is removed. See [compete from outside](/operations/fleet-miners#compete-in-the-base-tier-from-outside).

## What a round decides

1. **Score.** Validators score the candidate on a sealed holdout against the incumbent. It is eligible when its skill is positive, its accuracy is not below the incumbent's, and its Brier improvement is at least 0.01 with a paired-bootstrap 95% lower bound above zero. The best eligible candidate is the pending winner.
2. **Confirm.** The pending winner is scored again on a second, disjoint sealed draw at least 12 hours later and must stay eligible.
3. **Check adapters.** Reference adapter jobs are retrained on the incumbent and the candidate with the production recipe. The candidate passes only if no job is worse by more than 0.005 Brier and at least one is better.
4. **Promote.** A candidate that passes all three is promoted in an owner-reviewed pull request. That crowns its miner as the newest king.

Miners never receive per-case results. A round's cases are published after it closes and are never reused.

## Who is paid

King of the hill, following Teutonic (owner decision, 19 October 2026; merged in zils#60, **not deployed**):

- Only kings are paid. A king is the miner of a promoted base.
- The base-tier share of each weight publication is split equally over the last five distinct registered kings.
- A challenger earns nothing until it is crowned. To dethrone the king it must clear the same 0.01 margin, the confirmation draw and the adapter suite.
- With no king, the base share is burned at `base_tier.burn_uid`. Stock d3-mini has no owner, so until the first promotion the share burns.

Base and adapter rounds pay from one weight vector. The 18 October rule, where the exam winner took the share, is gone. See [two-track payment](/operations/fleet-miners#two-tracks-on-the-testnet-the-base-tier-pays-first).

## Channels

| Channel | Advances | Used by |
| --- | --- | --- |
| `latest` | When a candidate is promoted | Jobs that opt in with `base_channel` on creation |
| `stable` | After a promoted base survives a full window on `latest` | New customer jobs by default |

Both channels name d3-mini since 17 October 2026. The channel is a platform configuration value, not yet a registry alias. Automatic upgrades that follow `stable` are not implemented.

## Current status

As of 19 October 2026:

- **d3-mini is the base.** The owner adopted it on 17 October 2026 on capability grounds. Its confirmation draw against H2O tied (Brier 0.1790 against 0.1794), so this is an override of the promotion rule, not a win under it. Stock d3-mini is the incumbent that candidates must beat. See the [d3-mini results](/research/#d3-mini-a-multimodal-base-candidate).
- **Public testnet validator.** A Zils base-tier validator has run on subnet 579 since 18 October 2026. It is temporary, its uptime is not guaranteed, and it does not publish weights yet. Its published URL and hotkey are for testnet only. See the [validator runbook](/operations/validators#runbook-a-public-validator-for-the-base-tier).
- **Rehearsal.** The full loop was rehearsed on 17–18 October. The candidate tied stock d3 on the sealed exams and passed the suite; nothing was promoted.
- **Payout.** King of the hill is merged, not deployed. No king exists yet.
- **Mainnet** is not implemented.

The submission format, fixed files and validator procedure are in the [base candidates guide](/operations/base-candidates). Open admission and miner terms are in [miner admission](/operations/miner-admission) and [miner terms](/operations/miner-terms).
