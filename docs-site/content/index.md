---
title: What is Zils?
description: Understand Zils, see how decisions fit into your application, and get started as a developer, miner, validator or researcher.
---

<div class="docs-status">Decision models for your applications</div>

<span id="build-around-a-better-decision"></span>

# What is Zils?

<p class="intro-lead">Zils helps applications choose between defined outcomes using text or images. You supply the context and possible answers. A decision model returns probabilities, and your application decides what to do with them.</p>

Use Zils at a decision point in an existing product: route a support request, select an agent's next tool, or classify a product photo. These are tasks to evaluate on your own data, not promises of accuracy. Your application keeps control of rules, permissions, actions and human review.

<div class="decision-example">
<p><strong>Example: route a support request</strong></p>
<p><strong>Input:</strong> “Please send the invoice for my last order.”</p>
<p><strong>Question:</strong> Which team should handle this request?</p>
<p><strong>Possible result:</strong> billing 90% · technical 6% · account 4%</p>
<p><strong>Application action:</strong> route to billing if your tested review policy allows it; otherwise ask a person to review.</p>
<p>These probabilities are illustrative. They are not a live model result or a correctness guarantee.</p>
</div>

Read [how Zils fits into your application](/getting-started/ecosystem) for the complete workflow, or [how decision models work](/getting-started/decisions) for the concepts.

## Choose your starting point

<div class="start-links">
<a href="/getting-started/quickstart"><strong>Developers</strong><span>Make your first decision through the API, then connect it to your application with an SDK.</span></a>
<a href="/operations/soup"><strong>Miners</strong><span>Commit model bodies to a soup pool, or train customers' models, and earn when the work is used.</span></a>
<a href="/operations/validators"><strong>Validators</strong><span>Score committed bodies, build each pool's soup and set weights on chain.</span></a>
<a href="/research/getting-started"><strong>Learn and research</strong><span>Understand decision models, design a first experiment, and read the evidence.</span></a>
</div>

## How the pieces fit together

Developers call decision models and supply examples when they want a model tuned to their task. On the Bittensor network, miners build better base models: each size of the [z3 line](/getting-started/models) is a soup pool, and miners commit model bodies that validators average into the pool's next release. Miners also [train customers' open-tier models](/operations/customer-jobs). The platform runs accounts, billing, training jobs and hosted decisions.

You can start with an available model without training anything. An **adapter** is a set of trained changes that specializes a base model for your task. New text and image adapters use **z3-mini**, whose founding baseline is the unchanged d3-mini checkpoint adopted on 17 October 2026. Training produces a candidate to evaluate, and may end with no qualifying model. The [model guide](/getting-started/models) explains selection and compatibility.

## What works today

| Start with | How |
| --- | --- |
| An account | [Get started](https://zils.ai/sign-in) with Google or an email link; anyone can sign up |
| Hosted decisions | An API key; see the [quickstart](/getting-started/quickstart) |
| Training | On the website, the CLI, a coding agent over MCP, or `zils fit train`; open tier free, private $0.20 per million tokens. See the [training workflow](/training/shared-queue) |
| Price | $0.06 per million input tokens, output free. Prepaid top-ups start at $5. See [pricing and limits](/getting-started/pricing) |
| SDKs and CLI | `npm install -g @zils/cli` and `npm install @zils/sdk` (TypeScript, 0.4.18); the Python SDK is available from source. See [SDKs and CLI](/sdks/overview) |
| Find where Zils fits | `npx -y @zils/cli fit agent` in your project, or `zils fit` |
| Mining | Commit a model body to a [soup pool](/operations/soup) with `zils-miner`, installed by `curl -fsSL https://zils.ai/install.sh \| sh`, or [train customer jobs](/operations/customer-jobs) |
| Validating | See [Run a validator](/operations/validators) |

Hosted decisions run on platform GPUs today; serving from miners is not live yet.
Read [what's available](/getting-started/roadmap) for the boundary between current
features and planned work.

For questions or a pilot, [contact Zils](https://zils.ai/contact). To contribute code or documentation, use the [repository map](/getting-started/repositories).
