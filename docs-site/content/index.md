---
title: Introduction
description: Use H2O and Imajev adapters, Zils SDKs and the decision API.
---

<div class="docs-status">H2O + Imajev · Decision API</div>

# Build around a better decision.

<p class="intro-lead">Zils turns context and defined outcomes into decisions with probabilities. Use the API or SDK, evaluate decisions on your task, and train a private H2O text adapter or Imajev image adapter when your data supports an improvement.</p>

<div class="decision-example">
<p><strong>One question. Defined outcomes.</strong></p>
<p>“Which team should handle this request?”</p>
<p><code>billing</code> · <code>technical</code> · <code>account</code></p>
<p>Start with the shared model. Measure its decisions. Promote a candidate only when it passes your acceptance criteria.</p>
</div>

## Choose your starting point

<div class="start-links">
<a href="/getting-started/quickstart"><strong>Call the Zils API</strong><span>Create an API key, list available models, and request your first decision.</span></a>
<a href="/training/data"><strong>Train for your task</strong><span>Prepare labeled examples and evaluate a private adapter against the model it would replace.</span></a>
<a href="/operations/miners"><strong>Run H2O and Imajev miners</strong><span>Connect an approved GPU miner to the hosted training queue.</span></a>
<a href="/sdks/overview"><strong>Install the SDK or CLI</strong><span>Use Python, TypeScript, browser sign-in, and terminal training commands.</span></a>
</div>

## What works today

**Zils has a hosted decision API with shared and account-owned models.** It supports API keys, model listing, typed predictions, and bulk jobs. Start with the [API quickstart](/getting-started/quickstart) or read the [full API guide](/api/reference).

**New text adapter jobs use pinned H2O Lightning 4B. Imajev remains the image profile.** Miners execute model workloads and validators evaluate candidates. H2O training does not change the shared inference alias; use the model catalog to select an inference release. The [automatic workflow](/training/automatic) can assign approved work, evaluate candidates, and activate an accepted private adapter after verifying its serving identity. [Version selection](/training/versions) compares upgrades with the customer's previous accepted model and protects the active version from stale runs.

A completed training job can return **no qualifying model**. That leaves the shared model or existing customer version available. Research results and synthetic workflow checks do not establish customer-task quality or production capacity; see the [roadmap and limits](/getting-started/roadmap).

The [repository map](/getting-started/repositories) separates miners, hosted services, SDKs, the website and these docs. [Model profiles](/getting-started/models) explain runtime pins and eligibility. Local and closed testnet fleets have their own setup; older Kev results remain historical evidence in the legacy and [research sections](/research/).

For access or a pilot, [contact Zils](https://zils.ai/contact).
