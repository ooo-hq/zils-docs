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
<a href="/operations/miners"><strong>Miners</strong><span>Check access and hardware requirements, then run approved text or image training workloads.</span></a>
<a href="/operations/validators"><strong>Validators</strong><span>Understand independent evaluation and the access needed to operate a validator.</span></a>
<a href="/research/getting-started"><strong>Learn and research</strong><span>Understand decision models, design a first experiment, and read the evidence.</span></a>
</div>

## How the pieces fit together

Developers integrate decisions and supply examples when they want to improve a task. Miners execute model workloads. Validators independently evaluate trained candidates before acceptance. The platform coordinates accounts, jobs and access to accepted models.

You can start with an available model without training anything. An **adapter** is a set of trained changes that specializes a base model for your task. New text adapters use **H2O**; **Imajev** handles image-and-text tasks. Training produces a candidate to evaluate, and may end with no qualifying model. The [model guide](/getting-started/models) explains selection and compatibility.

## What works today

| Start with | Access today |
| --- | --- |
| Hosted decisions | A Zils account with API access; use the models listed for your account |
| SDKs and command-line tools | [JavaScript/TypeScript SDK and CLI](/sdks/overview) on npm; Python and the Model Context Protocol (MCP) server currently require source access |
| Miner training work | Operator approval and qualification for each model |
| Validator operation | Operator coordination and protected access; public permissionless onboarding is not available |

Miners are the model execution architecture. Development GPUs are used for bootstrapping and testing. The current approved-worker queue does not establish an open network that discovers and routes inference to arbitrary public miners. Read [capabilities and remaining work](/getting-started/roadmap) for the boundary between available workflows and planned network capabilities.

For access or a pilot, [contact Zils](https://zils.ai/contact). To contribute code or documentation, use the [repository map](/getting-started/repositories).
