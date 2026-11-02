---
title: Pricing and limits
description: What decisions and training cost, how credit works, and the request limits for z3-mini.
---

# Pricing and limits

| Use | Price |
| --- | --- |
| Decisions | $0.06 per million input tokens; output is free |
| Training | $0.20 per million training tokens, with a $2 minimum per run |

Billing is prepaid. Top up with **$5, $20, $50 or $100**; all API keys on an account
share its balance. The first paid top-up includes one training run: it covers the
$2 minimum without using purchased credit, and tokens above that are charged. There
are no subscriptions or automatic recharges.

## What counts as an input token

A decision request is charged for its logical input: the shared `state` once, plus
each question once. Usage records show the billed input tokens for every request.

A training job reserves the $2 minimum when it leaves uploading. Validation then
measures the job's workload, and the reservation rises to the full price before
training starts. If your credit cannot cover it, the job fails with the price in its
error and nothing is charged. Image training jobs stay at the minimum. Infrastructure
or validation failures release the reservation.

## When credit runs out

New requests return HTTP `402` with code `insufficient_credit`. Add credit and retry.
Requests already admitted are not interrupted.

## Limits

[z3-mini limits](/getting-started/models#z3-mini-limits) lists the token, outcome and
image limits. Oversized inputs are rejected, not truncated. Throughput limits return
HTTP `429` with a `Retry-After` header.
