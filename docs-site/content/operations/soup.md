---
title: Soup pool
description: "How the z3 soup pools work: the four pools, what a body is, how to commit one, how a daily round builds the soup, and how seats, the crown and releases pay."
---

# Soup pool

In a soup pool, miners do not compete for one crown. Each day validators build the best **soup**: a uniform average of up to five model bodies submitted by different miners. You earn by holding a seat in the round's soup, or by submitting the round's best single body. From the mainnet launch every z3 base pool is a soup pool; the soup replaces the [king election](/operations/base-tier).

The soup pool is new at the mainnet launch. The design rests on one internal experiment on public open models, in which plain averages of two or three public Qwen3.5-4B decision fine-tunes scored above stock z3-mini on two sealed exam draws, and adding a fifth model lowered the score. Treat the numbers on this page as launch policy that may change, not as measured results.

## Four pools

There is one soup pool per model size, each with its own bodies, rounds, seats and share of the base emission. A body competes only in the pool it is committed to.

| Pool | Chassis (pinned) | Body parent (pinned revision) | Chassis tensors | Body size cap | Input cap | Commitment |
| --- | --- | --- | --- | --- | --- | --- |
| `d3-lite` (z3-lite, 0.8B) | `vllm-sr/d3-lite` | `Qwen/Qwen3.5-0.8B` @ `2fc06364715b967f1860aea9cf38778875588b17` | 473 | 2 GiB | 4,096 tokens | `zilsb3:d3-lite:…` |
| `d3-mini` (z3-mini, 4.5B) | `zils-ai/d3-mini-4.5b-v1` | `Qwen/Qwen3.5-4B` @ `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` | 723 | 10 GiB | 8,192 tokens | `zilsb2:…` |
| `d3-flash` (z3-flash, 9B) | `vllm-sr/d3-flash` | `Qwen/Qwen3.5-9B` @ `c202236235762e1c871ad0ccb60c8ee5ba337b9a` | 759 | 24 GiB | 4,096 tokens | `zilsb3:d3-flash:…` |
| `d3` (z3, 27B) | `vllm-sr/d3-ultra` | `Qwen/Qwen3.8-27B` @ `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` | 1,183 | 64 GiB | 4,096 tokens | `zilsb3:d3:…` |

The z3 chassis uses `prefix_bidir` attention and the `header-v1` prompt layout; both are fixed by the chassis, so a z3 body is an ordinary Qwen3.8-27B-layout fine-tune. Round items longer than a pool's input cap are left out of that pool's rounds.

Lite and mini run rounds from the start. Flash and z3 open later, each at a block fixed in the validator configuration. A pool pays nothing before it opens (its share burns), and it may pay a temporary **boosted share** for its first weeks that steps down to its long-run share (see [Pay](#pool-shares)). Bodies committed to a pool before it opens are admitted at its first round.

## What a body is

A body is the full set of language and vision weights of a fine-tune of the pool's body parent at its pinned revision (table above). Every soup runs on the pool's pinned chassis: its answer layer, prompt and runtime are fixed and are not part of a submission. A body is eligible when:

- **Layout:** its safetensors contain every chassis tensor under `language_model.*` and `visual.*` (the pool's tensor count) with the chassis shape, stored as `bfloat16` or `float32`. Every tensor is rounded to `bfloat16` for the body hash, the checks and the soup, so a tensor saved as `float32` hashes like its `bfloat16` cast. One leading `model.` is stripped from names; `lm_head*` and `mtp.*` are ignored; any other tensor rejects the body. Sharded and single-file checkpoints are both accepted, and the body hash does not depend on the shard layout.
- **Change:** the relative change of its language layers from the pool's Qwen parent, ‖body − Qwen‖ / ‖Qwen‖, is at most **0.15**. You may start from plain Qwen, from the pool's chassis, from a release, from the current soup or from any open fine-tune of that Qwen revision.
- **Licence:** the repo's `README.md` front matter declares `license:` as `apache-2.0`, `mit`, `bsd-3-clause` or `bsd-2-clause`.
- **Size:** the safetensors total at most the pool's body size cap.
- **Ownership:** the repo holds `zils-owner.json` containing exactly `{"hotkey": "<your ss58 hotkey>"}`, the hotkey that commits it. Scouts who find a good open model re-upload it to their own repo with their own ownership file. The first valid commitment of a body hash wins it.

For training settings and comparing a fine-tune with its parent before you publish, see [Tune a base miner](/operations/miner-tuning).

## Commit a body

Register a hotkey on the Zils subnet ([Register on Bittensor](/operations/bittensor-registration)) and install the miner CLI:

```bash
curl -fsSL https://zils.ai/install.sh | sh
```

1. Put the body's safetensors and `README.md` (with the licence) in one folder. Let the CLI write the ownership file for your hotkey; it also checks the body locally and prints its hash:

   ```bash
   zils commit-body --pool <pool> --repo <you>/<body-repo> --path ./my-body --write-owner
   ```

   `--pool` is `d3-lite`, `d3-mini` (the default), `d3-flash` or `d3` (z3).

2. Upload the folder to your Hugging Face model repo and note the commit sha the upload prints (`hf auth login` once with a write token). The body hash does not cover the ownership file, so anyone who copies a public body could commit its hash first: upload to a **private** repo, commit while it is private, and make it public before the round's commit deadline. Validators download after the deadline, and a repo that is still private then fails.

   ```bash
   hf upload <you>/<body-repo> ./my-body .
   ```

3. Check and commit. Without `--yes` the command is a dry run: it validates the body at that revision against the pool's chassis and parent, prints the body hash and the exact commitment (`zilsb2:<body sha256>:<revision>:<repo>` for d3-mini, `zilsb3:<pool>:<body sha256>:<revision>:<repo>` for the other pools), and writes nothing. With `--yes` it also confirms the repo matches your local folder, writes the commitment with your hotkey and reads it back:

   ```bash
   zils commit-body --pool <pool> --repo <you>/<body-repo> --revision <upload commit> --path ./my-body
   zils commit-body --pool <pool> --repo <you>/<body-repo> --revision <upload commit> --path ./my-body --yes
   ```

   Without `--path` the command downloads the body at the revision instead. It also downloads the pool's pinned chassis and Qwen parent (about 2 GB each for lite, 9 GB for mini, 17 to 19 GB for flash and 52 to 56 GB for z3) unless you pass local copies with `--chassis` and `--base`. Wallet flags, `--network` and `--netuid` work as for `commit-candidate`.

A hotkey has **one commitment slot, shared by `zils1` base candidates and soup bodies of every pool**: committing a body replaces the hotkey's base candidate or its body in another pool, and the reverse. Use a separate hotkey for each pool. Validators key seats by hotkey and body hash, so a body already in the pool keeps its seat until it leaves the pool, even after you commit a new one.

## A round

Validators run one soup round per day for each open soup pool:

1. **Seed.** The hash of the first block after the commit deadline picks the round's private exam subset and breaks ties.
2. **Admit** new bodies with the checks above, at most 6 new bodies and 12 claims per round in commitment order (flash: 4 and 6; z3: 2 and 3). A hotkey whose claim fails a check or a download sits out the next 3 rounds.
3. **Reject copies:**
   - a re-upload, whose change from Qwen is nearly identical (cosine ≥ 0.999) to an earlier commitment's, a house ingredient's, the current soup's or the release's;
   - a body built largely from other miners' bodies: other hotkeys' bodies explain at least 30% of the part of its change that the house ingredients, the current soup and the release leave unexplained;
   - a behavioural twin of a pool body (near-identical answers, temperature-scaled copies included).

   **You may fine-tune the current soup or the release**, as well as a house ingredient: the change you add is measured from them, so a fine-tune is not refused because the soup contains other miners' bodies, and it is paid as a trainer body. Re-weighting the seated bodies, or re-uploading one with small changes, is refused. Only a near-exact re-upload or a broken body bans its hash; the other refusals apply to that commitment only, and it is evaluated again when you commit a new revision or the pool body it matched leaves the pool.
4. **Pool:** new bodies are screened on a few hundred items. The pool is the current members, the house ingredients, the best screened new bodies and the best past single bodies, at most 20 (flash 10, z3 5).
5. **Solo:** each pool body is graded alone on the chassis. Every score from here on (solo, greedy, contribution, crown) is on the items of this round and the validator's last two finished rounds pooled together (`decision_rounds`, default 3), because one subset's noise is larger than the 0.3-point margin. A new body is graded on the earlier rounds' items too.
6. **Greedy soup:** starting from the best single body, add the next best only if the soup's score rises by at least **0.3** points; stop at **5** members.
7. **Contribution:** each member is left out once; what the soup loses without it is its contribution.

## Pay

The pool's emission share splits **80% to soup seats and 20% to the best single body** (the crown). Seats are re-earned every round; a displaced member stops earning at once.

| Part | Share | Who earns it |
| --- | --- | --- |
| Soup seats | 80% | Members whose contribution is at least **0.3** points, in equal parts, each multiplied by its rate. If no member clears the floor, the seat share burns. |
| Crown | 20% | The round's best single body that is not a house ingredient, multiplied by its rate, only if it beats every house ingredient alone and the current soup by at least **0.3** points on the pooled items. Otherwise the crown burns. A soup usually beats its members, so expect the crown to burn in most rounds; it pays for a body that is better than the soup by itself. |

| Rate | Multiplier | Applies to |
| --- | --- | --- |
| Trainer | 1.0 | A body you trained, including a fine-tune of a house ingredient, the current soup or the release. |
| Scout | 0.25 | A body within a similarity threshold of a listed open model released after launch. |
| House mix | 0.25 | A body whose change from Qwen is almost entirely a mix of house ingredients' changes (less than 5% left over; real fine-tunes leave about 10%), or, when it was admitted, almost entirely a mix of house ingredients, the soup and the release. |
| House ingredient | 0 | The open decision models of the pool's size already public at launch. The pool includes them unpaid. |

Each pool has its own house ingredients, listed in the `zils` repository under `zils/data/`: `soup-house.json` (mini: five open Qwen3.5-4B decision models), `soup-house-lite.json` (`vllm-sr/d3-lite` and `internlm/Intern-Decision-0.8B`), `soup-house-flash.json` (`vllm-sr/d3-flash`) and `soup-house-z3.json` (`vllm-sr/d3-ultra`).

Every unearned part burns to the subnet owner's uid, as in the base tier. Until miners submit new bodies, most of a pool's share burns.

### Pool shares

The launch configuration (`zils/data/base-pools-launch.json`) gives the base emission to lite 35%, mini 30%, flash 20% and z3 10%; the other 5% is unassigned and burns. Flash and z3 burn their shares until their opening blocks. The launch configuration boosts flash to 30% for its first two weeks and 25% for the next two, and z3 to 15% for its first two weeks; a boost is paid out of budget that would otherwise burn and never reduces another pool's share. The exact blocks are in each validator's configuration and its published report.

## What validators publish

Each round's public record lists the soup members (hotkey, body hash, rate), their rounded contributions, per-category soup scores, the rounds whose items the decisions were scored on and their item count, and sha256 hashes of the item subset, the per-item predictions and the soup weights, so a round can be audited against the validator's private record. Exam items, labels and per-family scores are never published. The round bank is private, so outside re-grading of a round is not possible yet.

## Releases

A soup is not served until it is released. Every 14 to 28 days, at a release window, the current soup must beat the current release by at least +1 point with a positive lower bound on each of two sealed release draws that rounds never use, pass the 12-hour confirmation draw and the pinned three-seed adapter suite. A reviewed promotion then makes it that tier's next z3 version. Members are paid through seats, not as kings, and the release itself has no single winner.

The margin (0.3), floor (0.3), member cap (5), pool size, change bound (0.15), 80/20 split, rates (1.0 / 0.25 / 0), pool shares and release cadence are policy choices made for the launch, not tuned results.
