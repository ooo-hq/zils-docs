---
title: Pricing and limits
description: What decisions and training cost, how credit works, and the request limits for z3-mini.
---

# Pricing and limits

| Use | Price |
| --- | --- |
| Decisions | $0.06 per million input tokens; output is free |
| Training, private | $0.20 per million training tokens, with a $2 minimum per run |
| Training, open tier | Free, within the [open-tier limits](#open-tier) |

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

## Open tier

Each training run is open tier or private, chosen when you submit it. The difference
is who sees the training data:

- **Private:** only Zils workers train the run. Your training examples are never sent
  to network miners. Charged as above.
- **Open tier:** Zils network miners train the run. They receive the training split
  (not calibration or test) and must delete it within 7 days of the run finishing;
  Zils cannot verify that they do. Free. The trained model is served by Zils and used
  through the API; its files cannot be downloaded.

Open-tier limits:

- 3 open-tier runs per account in any 24 hours. Every run you create counts, including
  one you cancel.
- 5,000,000 training tokens per run. A bigger run fails after validation, before
  training, and its error gives the private price for the same data.
- A daily limit across all accounts.

Past the per-account or daily limit, creating an open-tier run returns HTTP `429`; train it
privately or try again later.

## When credit runs out

New requests return HTTP `402` with code `insufficient_credit`. Add credit and retry.
Requests already admitted are not interrupted.

## Limits

[z3-mini limits](/getting-started/models#z3-mini-limits) lists the token, outcome and
image limits. Oversized inputs are rejected, not truncated. Throughput limits return
HTTP `429` with a `Retry-After` header.
