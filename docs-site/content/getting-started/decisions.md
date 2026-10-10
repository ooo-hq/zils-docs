---
title: How decisions work
---

# Context in. Probabilities out.

The Zils API reads a `state` and a set of typed `questions`, then returns decisions under matching keys in `answers`. The `model` field selects the shared JevK5 alias or a model available to your account. Ordinary predictions do not train the model or change its weights.

## Choose a question type

| Type | Define | Read |
| --- | --- | --- |
| `noul` | A yes/no proposition, with optional `true` / `false` descriptions | `noul`: probability of true |
| `choice` | A map of named outcomes to their descriptions | Winning `choice`, `probabilities`, and `confidence` |
| `score` | A list of ordered level descriptions, lowest first | Expected zero-based `score`, `probabilities`, `confidence`, and `legend` |

The shared API accepts 2–255 Choice outcomes and 2–10 Score levels. A score can be fractional because it is an expectation over levels. Instructions may be omitted or null. Give clear instructions when your task needs them.

The model reads answer-option logits without generating a prose answer. Large choice sets require multiple passes. Request, token, and execution bounds still apply; see [API capacity](/api/reference#capacity-usage-and-retention). Customer adapters use their [training-compatible serving limits](/operations/customer-models).

## Interpret confidence correctly

The probability distribution is the model's estimate, not a correctness guarantee. For Choice, API confidence measures the winning probability relative to a uniform guess: `(p_max - 1/n) / (1 - 1/n)`, clamped to 0–1. For two options, a winning probability of 0.9 gives confidence 0.8.

Score confidence describes concentration around the most probable level using the API's spread formula. Noul returns the probability of true directly and has no separate confidence field. The [API contract](/api/reference#request-and-credential-contract) links the formulas and compatibility scope.

The upstream Python runtime has a different response contract. Do not apply its raw-confidence interpretation to the Zils gateway.

## Evaluate your task

Measure accuracy, probability error, high-confidence mistakes, and important task groups on labeled data held out from development. Compare with your current approach and the shared model before training an adapter.

The [JevK5 product-matching experiment](/research/commerce) recorded an additional adapter that reduced held-out accuracy and worsened probability error. A completed training run does not establish an improvement.

## Apply your policy

Your application decides when to act or request review. A threshold does not implement a review system, and prompt instructions do not guarantee behavior.

The [training workflow](/training/automatic) evaluates candidates before activation. First versions compare with the calibrated base; explicit upgrades compare with the previous accepted version. [Version selection](/training/versions) keeps rejected or stale candidates from replacing the active model.
