---
title: What's available
description: What works on Zils today and what is still planned.
---

# What's available

## Available today

- **Hosted decisions** on z3-mini: yes/no, choice and score questions over text, with
  up to four images, through the [API](/api/reference), the TypeScript SDK and the
  `zils` CLI. Prepaid, $0.06 per million input tokens ([pricing](/getting-started/pricing)).
- **Open sign-up** with Google or an email link at [zils.ai](https://zils.ai/sign-in).
- **Hosted training** of z3-mini on your own text or photo examples, with an
  independent evaluation before any model is activated. Each run is open tier
  (free, trained by network miners, used through the API only) or private (paid,
  Zils workers only, downloadable). Start it on the website's table page, from the
  CLI, from a coding agent over MCP, or with `zils fit train`
  ([training workflow](/training/shared-queue)).
- **`zils fit`** to find where Zils fits in your code, and **`zils merge`** to blend
  models on your machine ([SDKs and CLI](/sdks/overview)).
- **Mining and validating** on Bittensor mainnet subnet 127: each z3 size is a
  [soup pool](/operations/soup) that miners improve by committing model bodies.
  Lite and mini are open; flash and z3 open later.
- **Customer-job mining.** Any hotkey registered on the subnet can qualify its
  host and train open-tier customer models ([train customer jobs](/operations/customer-jobs)).

## Not available yet

- **Serving from miners.** Hosted decisions run on platform GPUs; miners do not yet
  serve inference to customers.
- **Customer models on other sizes.** Hosted training and decisions use z3-mini only.
- **Video** in hosted decisions, and image requests in bulk jobs.
- **A published Python SDK.** The Python SDK needs access to the private SDK
  repository; the npm CLI (which also runs the MCP server) and TypeScript SDK are public.
- **Downloading open-tier models.** They are served by Zils and used through the API;
  train privately to download the files.
- **Automatic upgrades.** A trained model stays on its base until you request an
  [upgrade](/training/versions).
