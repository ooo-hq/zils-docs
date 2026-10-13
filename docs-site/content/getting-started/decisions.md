---
title: How decision models work
description: Understand context, outcomes, probabilities and application policy before using the Zils API.
---

<span id="context-in-probabilities-out"></span>

# How decision models work

A decision model estimates how well each defined answer fits the context you provide. For a support request, the context might be a customer's message and the answers might be billing, technical and account. Zils returns a structured result that your application can use in its workflow.

## From context to a decision

You define the question and its possible answers. The model estimates probabilities for those answers. Your application applies its rules to act, request review or leave the case unresolved. [Fit Zils into your application](/getting-started/ecosystem) follows an example through all three parts.

This works when you can describe the outcomes in advance. Free-form drafting can remain with a language model, and deterministic rules can enforce requirements that must always hold. Zils does not execute application actions or implement permissions.

Making a prediction is called **inference**. It does not train the model or change its weights. **Training** uses labeled examples to create an adapter, which must be evaluated before use. You can make decisions without training an adapter.

## Map the concepts to the API

The API calls your context `state`, your question definitions `questions`, and the returned results `answers`. Matching keys connect each question to its answer. The `model` field selects an inference model available to your account; see the [API quickstart](/getting-started/quickstart).

## Choose a question type

| Type | Define | Read |
| --- | --- | --- |
| `noul` | A yes/no proposition, with optional `true` / `false` descriptions | `noul`: probability of true |
| `choice` | A map of named outcomes to their descriptions | Winning `choice`, `probabilities`, and `confidence` |
| `score` | A list of ordered level descriptions, lowest first | Expected zero-based `score`, `probabilities`, `confidence`, and `legend` |

The shared API accepts 2–255 Choice outcomes and 2–10 Score levels. A score can be fractional because it is an expectation over levels. Instructions may be omitted or null. Give clear instructions when your task needs them.

The model reads scores for answer options without generating a prose answer. Large choice sets require multiple passes. Request, token, and execution bounds still apply; see [API capacity](/api/reference#capacity-usage-and-retention). Customer adapters use their [training-compatible serving limits](/operations/customer-models).

## Rank a short list with the SDK

Use experimental [SDK `rank`](/sdks/ranking) when you need the order of 2–10
options against a criterion. Choice selects one named option; Score rates
against predefined levels; Rank returns an ordered list with relative strengths.

Rank combines existing Choice comparisons. It is an SDK function, not a fourth
API question type, and it does not train a new model. A ranking score of 1 means
strongest in that list, not certainty or absolute quality. Noul, Choice, and Score
keep their existing behavior.

SDK 0.3.0 keeps pairwise ranking as the default and adds
[optional grouped comparisons](/sdks/ranking#optional-grouped-ranking). Grouped
mode uses fewer judgments but can produce worse ordering, especially for later
choices. Evaluate it on your task before changing your application's setting.

## Interpret confidence correctly

Probability, confidence and accuracy describe different things. A probability is the model's estimate for one outcome. API confidence summarizes the distribution using the formulas below. Accuracy measures how often predictions matched correct answers across labeled examples.

The probability distribution is the model's estimate, not a correctness guarantee. For Choice, API confidence measures the winning probability relative to a uniform guess: `(p_max - 1/n) / (1 - 1/n)`, clamped to 0–1. For two options, a winning probability of 0.9 gives confidence 0.8.

Score confidence describes concentration around the most probable level using the API's spread formula. Noul returns the probability of true directly and has no separate confidence field. The [API contract](/api/reference#request-and-credential-contract) links the formulas and compatibility scope.

The upstream Python runtime has a different response contract. Do not apply its raw-confidence interpretation to the Zils gateway.

## Evaluate your task

Measure accuracy, probability error, high-confidence mistakes, and important task groups on labeled data held out from development. Compare with your current approach and the shared model before training an adapter.

The [JevK5 product-matching experiment](/research/commerce) recorded an additional adapter that reduced held-out accuracy and worsened probability error. A completed training run does not establish an improvement.

## Apply your policy

Your application decides when to act or request review. A threshold does not implement a review system, and prompt instructions do not guarantee behavior.

The [training workflow](/training/automatic) evaluates candidates before activation. First versions compare with the calibrated base; explicit upgrades compare with the previous accepted version. [Version selection](/training/versions) keeps rejected or stale candidates from replacing the active model.
