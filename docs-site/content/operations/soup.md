---
title: Soup pool
description: "How the z3 soup pools work: the four pools, what a body is, how to commit one, how a daily round builds the soup, and how seats, the crown and releases pay."
---

# Soup pool

In a soup pool, miners do not compete for one crown. Each day validators build the best **soup**: a uniform average of up to five model bodies submitted by different miners. You earn by holding a seat in the round's soup, or by submitting the round's best single body. From the mainnet launch every z3 base pool is a soup pool.

The soup pool is new at the mainnet launch. The design rests on one internal experiment on public open models, in which plain averages of two or three public Qwen3.5-4B decision fine-tunes scored above stock z3-mini on two sealed exam draws, and adding a fifth model lowered the score. Treat the numbers on this page as launch policy that may change, not as measured results.

## Four pools

There is one soup pool per model size, each with its own bodies, rounds, seats and share of the base emission. A body competes only in the pool it is committed to.

| Pool | Chassis (pinned) | Body parent (pinned revision) | Chassis tensors | Body size cap | Input cap | Commitment |
| --- | --- | --- | --- | --- | --- | --- |
| `d3-lite` (z3-lite, 0.8B) | `vllm-sr/d3-lite` | `Qwen/Qwen3.5-0.8B` @ `2fc06364715b967f1860aea9cf38778875588b17` | 473 | 2 GiB | 4,096 tokens | `zilsb3:d3-lite:…` |
| `d3-mini` (z3-mini, 4.5B) | `zils-ai/d3-mini-4.5b-v1` | `Qwen/Qwen3.5-4B` @ `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` | 723 | 10 GiB | 8,192 tokens | `zilsb2:…` |
| `d3-flash` (z3-flash, 8.4B) | `vllm-sr/d3-flash` | `Qwen/Qwen3.5-9B` @ `c202236235762e1c871ad0ccb60c8ee5ba337b9a` | 759 | 24 GiB | 4,096 tokens | `zilsb3:d3-flash:…` |
| `d3` (z3, 26B) | `vllm-sr/d3-ultra` | `Qwen/Qwen3.8-27B` @ `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` | 1,183 | 64 GiB | 4,096 tokens | `zilsb3:d3:…` |

The z3 chassis uses `prefix_bidir` attention and the `header-v1` prompt layout; both are fixed by the chassis, so a z3 body is an ordinary Qwen3.8-27B-layout fine-tune. Round items longer than a pool's input cap are left out of that pool's rounds.

Lite and mini run rounds from the start. Flash and z3 open later, each at a block fixed in the validator configuration. A pool pays nothing before it opens; its share burns (see [Pool shares](#pool-shares)). Bodies committed to a pool before it opens are admitted at its first round.

## What a body is

A body is the full set of language and vision weights of a fine-tune of the pool's body parent at its pinned revision (table above). Every soup runs on the pool's pinned chassis: its answer layer, prompt and runtime are fixed and are not part of a submission. A body is eligible when:

- **Layout:** its safetensors contain every chassis tensor under `language_model.*` and `visual.*` (the pool's tensor count) with the chassis shape, stored as `bfloat16` or `float32`. Every tensor is rounded to `bfloat16` for the body hash, the checks and the soup, so a tensor saved as `float32` hashes like its `bfloat16` cast. One leading `model.` is stripped from names; `lm_head*` and `mtp.*` are ignored; any other tensor rejects the body. Sharded and single-file checkpoints are both accepted, and the body hash does not depend on the shard layout.
- **Change:** the relative change of its language layers from the pool's Qwen parent, ‖body − Qwen‖ / ‖Qwen‖, is at most **0.15**. You may start from plain Qwen, from the pool's chassis, from a release, from the current soup or from any open fine-tune of that Qwen revision.
- **Licence:** the repo's `README.md` front matter declares `license:` as `apache-2.0`, `mit`, `bsd-3-clause` or `bsd-2-clause`.
- **Size:** the safetensors total at most the pool's body size cap.
- **Ownership:** the repo holds `zils-owner.json` containing exactly `{"hotkey": "<your ss58 hotkey>"}`, the hotkey that commits it. Scouts who find a good open model re-upload it to their own repo with their own ownership file. The first valid commitment of a body hash wins it.

For training settings and comparing a fine-tune with its parent before you publish, see [Train a soup body](/operations/miner-tuning).

## Commit a body

Register a hotkey on the Zils subnet ([Register on Bittensor](/operations/bittensor-registration)) and install the miner CLI:

```bash
curl -fsSL https://zils.ai/install.sh | sh
```

1. Put the body's safetensors and `README.md` (with the licence) in one folder. Let the CLI write the ownership file for your hotkey; it also checks the body locally and prints its hash:

   ```bash
   zils-miner commit-body --pool <pool> --repo <you>/<body-repo> --path ./my-body --write-owner
   ```

   `--pool` is `d3-lite`, `d3-mini` (the default), `d3-flash` or `d3` (z3).

2. Upload the folder to your Hugging Face model repo and note the commit sha the upload prints (`hf auth login` once with a write token). The body hash does not cover the ownership file, so anyone who copies a public body could commit its hash first: upload to a **private** repo, commit while it is private, and make it public before the round's commit deadline. Validators download after the deadline, and a repo that is still private then fails.

   ```bash
   hf upload <you>/<body-repo> ./my-body .
   ```

3. Check and commit. Without `--yes` the command is a dry run: it validates the body at that revision against the pool's chassis and parent, prints the body hash and the exact commitment (`zilsb2:<body sha256>:<revision>:<repo>` for d3-mini, `zilsb3:<pool>:<body sha256>:<revision>:<repo>` for the other pools), and writes nothing. With `--yes` it also confirms the repo matches your local folder, writes the commitment with your hotkey and reads it back:

   ```bash
   zils-miner commit-body --pool <pool> --repo <you>/<body-repo> --revision <upload commit> --path ./my-body
   zils-miner commit-body --pool <pool> --repo <you>/<body-repo> --revision <upload commit> --path ./my-body --yes
   ```

   Without `--path` the command downloads the body at the revision instead. It also downloads the pool's pinned chassis and Qwen parent (about 2 GB each for lite, 9 GB for mini, 17 to 19 GB for flash and 52 to 56 GB for z3) unless you pass local copies with `--chassis` and `--base`. Wallet flags choose the hotkey, and `--network` and `--netuid` choose the subnet.

A hotkey has **one commitment slot, shared by `zils1` base candidates and soup bodies of every pool**: committing a body replaces the hotkey's base candidate or its body in another pool, and the reverse. Use a separate hotkey for each pool. Validators key seats by hotkey and body hash, so a body already in the pool keeps its seat until it leaves the pool, even after you commit a new one.

## A round

Validators run one soup round per day for each open soup pool:

1. **Seed.** The hash of the first block after the commit deadline picks the round's exam subset and breaks ties. The subset comes from the validator's private round bank or, if it is set up, partly or wholly from fresh [Zils Outcomes](/operations/current) items.
2. **Admit** new bodies with the checks above, at most 6 new bodies and 12 claims per round in commitment order (flash: 4 and 6; z3: 2 and 3). A hotkey whose claim fails a check or a download sits out the next 3 rounds.
3. **Reject copies:**
   - a re-upload, whose change from Qwen is nearly identical (cosine ≥ 0.999) to an earlier commitment's, a house ingredient's, the current soup's or the release's;
   - a body built largely from other miners' bodies: other hotkeys' bodies explain at least 30% of the part of its change that the house ingredients, the current soup and the release leave unexplained;
   - a behavioural twin of a pool body (near-identical answers, temperature-scaled copies included).

   **You may fine-tune the current soup or the release**, as well as a house ingredient or a listed public model (see [Pay](#pay)): the change you add is measured from them, so a fine-tune is not refused because the soup contains other miners' bodies, and it is paid as a trainer body. Re-weighting the seated bodies, or re-uploading one with small changes, is refused. Re-uploading a listed public model is allowed, since that is a scout's work, but the first near re-upload of each listed model wins: another hotkey's later near re-upload of it is refused while the first stays in the pool. Only a near-exact re-upload or a broken body bans its hash; the other refusals apply to that commitment only, and it is evaluated again when you commit a new revision or the pool body it matched leaves the pool.
4. **Pool:** new bodies are screened on a few hundred items. The pool is the current members, the house ingredients, the best screened new bodies and the best past single bodies, at most 20 (flash 10, z3 5).
5. **Solo:** each pool body is graded alone on the chassis. Every score from here on (solo, greedy, contribution, crown) is on the items of this round and the validator's last two finished rounds pooled together (`decision_rounds`, default 3), because one subset's noise is larger than the greedy margin. A new body is graded on the earlier rounds' items too.

   Under the default scoring, `calibrated_brier`, the validator holds apart a private 20% of those items, chosen by a secret that changes every round, and fits one temperature per body or soup on them. The other 80% are scored at that temperature on Brier skill (ranked probability score skill for Score questions), each against the best constant answer for the family. Confidence counts, but sharpening or softening a body's probabilities without changing its answers earns nothing. Bodies are always graded at the temperature the validator fits; a temperature in a body's own files is never read. The margins below apply on this scale.
6. **Greedy soup:** starting from the best single body, add the next best only if the soup's score rises by at least **0.5** points; stop at **5** members.
7. **Contribution:** each member is left out once; what the soup loses without it is its contribution.

## Pay

Each pool's emission share pays **five seats of 16% each** (80% in all) and **20% to the best single body** (the crown). A seat's value is fixed: it does not grow when fewer members are seated. Seats are re-earned every round; a displaced member stops earning at once.

| Part | Share | Who earns it |
| --- | --- | --- |
| Soup seats | 5 × 16% | One seat for each member whose contribution is at least **0.8** points, multiplied by its rate and subject to the fine-tune rule below. Empty seats, house seats and seats below the floor burn. |
| Crown | 20% | The round's best single body that is not a house ingredient, multiplied by its rate, only if it beats every house ingredient alone and the current soup by at least **1.2** points on the pooled items. Otherwise the crown burns. A soup usually beats its members, so expect the crown to burn in most rounds; it pays for a body that is better than the soup by itself. |

**Fine-tunes (launch rule).** A seat is credited by what the soup loses without the body, so a fine-tune that takes its base's place would also be credited with its base's contribution. Until seats are credited relative to a body's base, validators split each body's change over the allowed bases (house ingredients, listed public models, the soup and the release). If at least half of it comes from those bases, the body is a fine-tune, and its bases are the ones explaining at least 10% of it:

- If one of its bases is a listed public model, it is paid at the scout rate.
- Otherwise its seat is paid only if the body alone beats the best of its bases by at least **1.2** points on the round's items. If a base cannot be scored that round, the seat is unpaid.

A body held back this way keeps its place in the soup and its seat share burns. Train enough to beat what you started from.

| Rate | Multiplier | Applies to |
| --- | --- | --- |
| Trainer | 1.0 | A body you trained, including a fine-tune of a house ingredient, the current soup or the release. |
| Scout | 0.25 | An unchanged or lightly changed re-upload of a model on the pool's known-public list (weight-change cosine of at least 0.9 to it), or a fine-tune of a listed model under the launch rule above. |
| House mix | 0.25 | A body whose change from Qwen is almost entirely a mix of house ingredients' and listed models' changes (less than 5% left over; real fine-tunes leave about 10%), or, when it was admitted, almost entirely a mix of house ingredients, listed models, the soup and the release. |
| House ingredient | 0 | The open decision models of the pool's size already public at launch. The pool includes them unpaid. |

Each pool has its own house ingredients, listed in the `zils` repository under `zils/data/`: `soup-house.json` (mini: five open Qwen3.5-4B decision models), `soup-house-lite.json` (`vllm-sr/d3-lite` and `internlm/Intern-Decision-0.8B`), `soup-house-flash.json` (`vllm-sr/d3-flash`) and `soup-house-z3.json` (`vllm-sr/d3-ultra`).

Each pool may also have a **known-public list** of other public decision models of its size, each pinned to a revision: `soup-known-lite.json` and `soup-known-mini.json` in the same folder. Flash and z3 have none. Finding one of these models and committing it unchanged or lightly changed earns the scout rate. Full pay is for real training: a fine-tune that moves well away from every listed model (cosine under 0.9) earns the trainer rate, whichever model it started from. Validators resolve each list entry once, keep only a private sketch of its weights and delete the files; listed models are never graded, seated or paid themselves.

**Scouting.** The list is not the limit of what you can commit. Any open fine-tune of the pool's Qwen parent that passes the eligibility checks under [What a body is](#what-a-body-is) can be committed by the first hotkey to find it, listed or not. The list only names the public models validators already know about, and those pay 0.25. A find that is not on the list and far from every listed model (cosine under 0.9) pays the trainer rate even though you did not train it: the pool cannot tell a find from a fine-tune and does not need to, because every body earns its seat the same way, by making the soup better on the round's items. If the find is itself a fine-tune of a house ingredient, the soup or the release, its seat pays only if it beats that base by 1.2 points, like any other fine-tune. Hunting Hugging Face for strong open decision models of the pool's size, adding the Qwen vision tower when the export is text-only, and committing them first is real work the pool pays for. Check a candidate with `zils-miner commit-body --pool <pool> --path ./found-body --check` before you upload it.

Every unearned part burns to the subnet owner's uid. Until miners submit new bodies, most of a pool's share burns.

### Pool shares

The launch configuration (`zils/data/base-pools-launch.json`) gives the base pools 80% of all emissions and the adapter track, which pays miners for [customer models](/operations/customer-jobs), the other 20%. Lite and mini get 25% of all emissions each, so a trainer's seat there is 4% and a crown 5%; flash and z3 get 15% each (a seat 2.4%, a crown 3%). The four pools have 24 paid spots. Flash and z3 burn their shares until their opening blocks, which are in each validator's configuration and its published report.

## What validators publish

Each round's public record lists the soup members (hotkey, body hash, rate), their rounded contributions, per-category soup scores, the pool's scoring and the soup's fitted temperature, the rounds whose items the decisions were scored on and their item count, and sha256 hashes of the item subset, the per-item predictions and the soup weights, so a round can be audited against the validator's private record. Per-family scores are never published. On the fixed round bank, exam items and labels stay private, so outside re-grading of such a round is not possible yet. A validator may instead draw round items from [Zils Outcomes](/operations/current), whose items are public and can be rebuilt by anyone; a body committed after an item resolved could have been trained on it.

## Releases

A soup is not served until it is released. Every 14 to 28 days, at a release window, the current soup must beat the current release by at least +1 point with a positive lower bound on each of two sealed release draws that rounds never use, pass the 12-hour confirmation draw and the pinned three-seed adapter suite. A reviewed promotion then makes it that tier's next z3 version; the released soup carries the temperature fitted for it, which serving applies. Members are paid through seats, not as kings, and the release itself has no single winner.

The member cap (5), pool size, change bound (0.15), 80/20 split, fixed seat value, rates (1.0 / 0.25 / 0), the fine-tune launch rule, the scoring, pool shares and release cadence are policy choices made for the launch, not tuned results. The greedy margin (0.5), seat floor (0.8) and the crown and fine-tune bars (1.2) are about 2.5 standard errors of the differences they test, measured by resampling the items of a 3,000-item dry run and scaled to the pooled three-round window; a smaller real gain is not paid until the pool has more items.
