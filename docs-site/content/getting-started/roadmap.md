---
title: What's available
description: What works on Zils today and what is still planned.
---

# What's available

## Available today

- **Hosted decisions** on z3-mini: yes/no, choice and score questions over text, with
  up to four images, through the [API](/api/reference), the TypeScript SDK and the
  `zils` CLI. Prepaid, $0.06 per million input tokens ([pricing](/getting-started/pricing)).
- **Hosted training** of z3-mini on your own text or photo examples, with an
  independent evaluation before any model is activated ([prepare a dataset](/training/data)).
- **`zils fit`** to find where Zils fits in your code, and **`zils merge`** to blend
  models on your machine ([SDKs and CLI](/sdks/overview)).
- **Mining and validating** on the Bittensor network: each z3 size is a
  [soup pool](/operations/soup) that miners improve by committing model bodies.

## Not available yet

- **Serving from miners.** Hosted decisions run on platform GPUs; miners do not yet
  serve inference to customers.
- **Customer models on other sizes.** Hosted training and decisions use z3-mini only.
- **Video** in hosted decisions, and image requests in bulk jobs.
- **A published Python SDK.** The Python SDK and MCP server need access to the
  private SDK repository; the npm CLI and TypeScript SDK are public.
- **Automatic upgrades.** A trained model stays on its base until you request an
  [upgrade](/training/versions).
- **Outside queue miners.** Hosted customer training runs on approved workers only.
