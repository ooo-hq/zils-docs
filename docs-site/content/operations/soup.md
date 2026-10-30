---
title: Soup pool
description: "How the z3-mini soup pool works: what a body is, how to commit one, how a daily round builds the soup, and how seats, the crown and releases pay."
---

# Soup pool

In a soup pool, miners do not compete for one crown. Each day validators build the best **soup**: a uniform average of up to five model bodies submitted by different miners. You earn by holding a seat in the round's soup, or by submitting the round's best single body. z3-mini is the soup pool at the mainnet launch; the other pools keep the [king election](/operations/base-tier).

The soup pool is new at the mainnet launch. As of 30 October 2026 no miner-submitted body had been graded or paid. The design rests on one internal experiment on public open models, in which plain averages of two or three public Qwen3.5-4B decision fine-tunes scored above stock z3-mini on two sealed exam draws, and adding a fifth model lowered the score. Treat the numbers on this page as launch policy that may change, not as measured results.

## What a body is

A body is the full set of language and vision weights of a fine-tune of `Qwen/Qwen3.5-4B` at revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`. Every soup runs on the pinned d3-mini chassis: its answer layer, prompt and runtime are fixed and are not part of a submission. A body is eligible when:

- **Layout:** its safetensors contain every chassis tensor under `language_model.*` and `visual.*` (723 tensors) with the chassis shape, in `bfloat16`. One leading `model.` is stripped from names; `lm_head*` and `mtp.*` are ignored; any other tensor rejects the body. Sharded and single-file checkpoints are both accepted, and the body hash does not depend on the shard layout.
- **Change:** the relative change of its language layers from the Qwen parent, ‖body − Qwen‖ / ‖Qwen‖, is at most **0.15**. You may start from plain Qwen, from a z3 release or from any open fine-tune of that Qwen revision.
- **Licence:** the repo's `README.md` front matter declares `license:` as `apache-2.0`, `mit`, `bsd-3-clause` or `bsd-2-clause`.
- **Size:** the safetensors total at most 10 GiB.
- **Ownership:** the repo holds `zils-owner.json` containing exactly `{"hotkey": "<your ss58 hotkey>"}`, the hotkey that commits it. Scouts who find a good open model re-upload it to their own repo with their own ownership file. The first valid commitment of a body hash wins it.

For training settings and comparing a fine-tune with its parent before you publish, see [Tune a base miner](/operations/miner-tuning).

## Commit a body

Register a hotkey on the Zils subnet ([Register on Bittensor](/operations/bittensor-registration)) and install the miner CLI:

```bash
curl -fsSL https://zils.ai/install.sh | sh
```

1. Put the body's safetensors and `README.md` (with the licence) in one folder. Let the CLI write the ownership file for your hotkey; it also checks the body locally and prints its hash:

   ```bash
   zils commit-body --repo <you>/<body-repo> --path ./my-body --write-owner
   ```

2. Upload the folder to a public Hugging Face model repo and note the commit sha the upload prints (`hf auth login` once with a write token):

   ```bash
   hf upload <you>/<body-repo> ./my-body .
   ```

3. Check and commit. Without `--yes` the command is a dry run: it validates the body at that revision, prints the body hash and the exact `zilsb2:<body sha256>:<revision>:<repo>` commitment, and writes nothing. With `--yes` it also confirms the public repo matches your local folder, writes the commitment with your hotkey and reads it back:

   ```bash
   zils commit-body --repo <you>/<body-repo> --revision <upload commit> --path ./my-body
   zils commit-body --repo <you>/<body-repo> --revision <upload commit> --path ./my-body --yes
   ```

   Without `--path` the command downloads the body at the revision instead. It also downloads the pinned d3-mini chassis and the Qwen parent (about 9 GB each) unless you pass local copies with `--chassis` and `--base`. Wallet flags, `--network` and `--netuid` work as for `commit-candidate`.

A hotkey has **one commitment slot, shared by `zils1` base candidates and `zilsb2` bodies**: committing a body replaces the hotkey's base candidate, and the reverse. Use a separate hotkey for each. Validators key seats by hotkey and body hash, so a body already in the pool keeps its seat until it leaves the pool, even after you commit a new one.

## A round

Validators run one soup round per day for each soup pool:

1. **Seed.** The hash of the first block after the commit deadline picks the round's private exam subset and breaks ties.
2. **Admit** new bodies with the checks above.
3. **Reject copies:** a body whose change from Qwen is nearly identical (cosine ≥ 0.999) to an earlier commitment's, a body mostly explained by earlier commitments or by the current soup or release, and a behavioural twin of a pool body (near-identical answers, temperature-scaled copies included).
4. **Pool:** new bodies are screened on a few hundred items. The pool is the current members, the house ingredients, the best screened new bodies and the best past single bodies, at most 20.
5. **Solo:** each pool body is graded alone on the chassis.
6. **Greedy soup:** starting from the best single body, add the next best only if the soup's score rises by at least **0.3** points; stop at **5** members.
7. **Contribution:** each member is left out once; what the soup loses without it is its contribution.

## Pay

The pool's emission share splits **80% to soup seats and 20% to the best single body** (the crown). Seats are re-earned every round; a displaced member stops earning at once.

| Part | Share | Who earns it |
| --- | --- | --- |
| Soup seats | 80% | Members whose contribution is at least **0.3** points, in equal parts, each multiplied by its rate. If no member clears the floor, the seat share burns. |
| Crown | 20% | The round's best single body that is not a house ingredient, multiplied by its rate. |

| Rate | Multiplier | Applies to |
| --- | --- | --- |
| Trainer | 1.0 | A body you trained. |
| Scout | 0.25 | A body within a similarity threshold of an open model released after launch. |
| House ingredient | 0 | The open Qwen3.5-4B decision models already public at launch. The pool includes them unpaid. |

Every unearned part burns to the subnet owner's uid, as in the base tier. Until miners submit new bodies, most of the pool's share burns.

## What validators publish

Each round's public record lists the soup members (hotkey, body hash, rate), their rounded contributions, per-category soup scores, and sha256 hashes of the item subset, the per-item predictions and the soup weights, so a round can be audited against the validator's private record. Exam items, labels and per-family scores are never published. The round bank is private, so outside re-grading of a round is not possible yet.

## Releases

A soup is not served until it is released. Every 14 to 28 days, at a release window, the current soup must beat the current release by at least +1 point with a positive lower bound on each of two sealed release draws that rounds never use, pass the 12-hour confirmation draw and the pinned three-seed adapter suite. A reviewed promotion then makes it the next z3-mini. Members are paid through seats, not as kings, and the release itself has no single winner.

The margin (0.3), floor (0.3), member cap (5), pool size (20), change bound (0.15), 80/20 split, rates (1.0 / 0.25 / 0) and release cadence are policy choices made for the launch, not tuned results.
