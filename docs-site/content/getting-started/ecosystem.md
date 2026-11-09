---
title: Fit Zils into your application
description: Choose a decision point, connect probabilities to an application policy, and measure whether Zils helps your workflow.
---

# Fit Zils into your application

Start with one recurring decision in your product. Zils takes the relevant context and the outcomes you define, then estimates their probabilities. Your application uses that result within its existing workflow.

## Choose a decision worth testing

Look for a task with clear outcomes and examples you can label. These are possible integrations to evaluate, not measured customer results:

| Your ecosystem | Decision to test | What to measure |
| --- | --- | --- |
| Support software | Which team should receive a request? | Correct routing and unnecessary transfers |
| Agent workflows | Which allowed tool should handle the next step? | Correct tool selection and failed actions |
| Product catalogs | Which category matches an image and description? | Category accuracy and review workload |

Keep deterministic rules for decisions they already solve correctly. A language model can gather context or draft a response; Zils can handle a defined choice within that process. Tool permissions and other hard constraints remain in application code.

## Follow a decision from input to action

For a support-routing task, define three outcomes: billing, technical and account. Give each a description so the model can distinguish them.

1. **Collect context.** Your application receives “Please send the invoice for my last order.”
2. **Request a decision.** Send that text and the three outcomes to an available model through the API.
3. **Read probabilities.** An illustrative result is billing 0.90, technical 0.06 and account 0.04. These numbers are not a live prediction.
4. **Apply your policy.** Route to billing only when your measured policy permits it. Send ambiguous cases to review, and handle API failures explicitly.
5. **Measure the outcome.** Compare the decision with the correct team and record whether routing helped the workflow.

The API returns a decision; it does not move the ticket or create a review queue. Your integration performs those actions. A high probability can still accompany a wrong answer, so select review thresholds using representative labeled examples.

Use the [API quickstart](/getting-started/quickstart) to make this request. [How decisions work](/getting-started/decisions) explains probability and confidence, which are different fields.

## Evaluate before adding training

Compare an available model with your current rules, model or manual process on the same examples. Set aside evaluation data before changing prompts or training. Measure decision quality, review workload, latency and cost for your application; a benchmark from another task cannot establish these for you.

If the base model misses patterns your labeled data can teach, consider an **adapter**: trained changes that specialize the base model. z3-mini is the base for new text and image adapters. [Prepare a dataset](/training/data) before starting a training job.

Training does not guarantee improvement. Independent evaluation can reject a candidate, and only an accepted model that reaches `ready` is available for inference. The [model guide](/getting-started/models) explains why a training profile and a callable model ID are different.

## Understand who runs the work

| Participant | Responsibility |
| --- | --- |
| Developer | Define the task, integrate predictions, measure outcomes and control application actions |
| Miner | Improve the base models in soup pools, and train open-tier customer models |
| Validator | Score soup bodies, build each pool's soup and set weights on chain |
| Platform | Run accounts, training jobs, evaluation on data withheld from miners, and hosted decisions |

Each training run is open tier or private. Open-tier runs are free and trained by network miners; any miner registered on the subnet can qualify for them. Private runs are paid and trained on Zils workers only. Evaluation and hosted decisions run on Zils; serving from miners is [not available yet](/getting-started/roadmap).

An account-owned model does not imply confidential training: on the open tier, the miner that trains your run can read its training split. Use a private run for data that must not leave Zils, and see the [training workflow](/training/shared-queue) before submitting work.

**Next:** [make your first decision](/getting-started/quickstart), using one task you can evaluate.
