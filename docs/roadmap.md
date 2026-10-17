# Capabilities and remaining work

## Available workflows

New text adapter jobs use [H2O Lightning 4B](/training/h2o). [Imajev](/training/imajev)
remains the image-and-text profile; existing JevK5 and Kev jobs retain their pins.
The [model guide](/getting-started/models) separates training defaults from
inference aliases and describes model-specific runtime qualification.

The [decision API](/api/reference) provides account-scoped model listing,
typed predictions and text bulk jobs. [Image decisions](/api/images) use their
own upload and request contract. [SDKs and CLI](/sdks/overview) provide published
npm installation, browser sign-in and text training; Python/MCP is source-only.
The CLI does not yet submit image training jobs.

Qualified miners train candidates, validators evaluate independent calibration
and test splits, and [activation](/training/automatic) verifies accepted releases
before registering an account-owned inference model. A completed job can return
`no_qualifying_model`. Only `ready` confirms that an accepted model is available
through the API. [Version selection](/training/versions) protects the active
version from rejected or stale upgrades.

The [repository map](/getting-started/repositories) separates model execution,
hosted services, clients, the website and documentation. Miners are the execution
architecture; bootstrap GPUs are for testing and qualification. Local and guarded
Bittensor fleets use separate setup and do not establish open network availability.

## What still needs evidence or implementation

| Area | Remaining work |
| --- | --- |
| Customer quality | Representative held-out evaluation for every task; synthetic checks do not establish improvement |
| Capacity | Sustained reliability and concurrency measurements on qualified workers |
| Public network | Open discovery, a public base-tier round, public health and chain reporting, and independently verified serving health; see the status list below |
| Clients | Python package publication; image training and bulk workflows beyond the current CLI/SDK surface |
| Model promotion | Retain exact profiles, evidence and rollback support; qualify new runtimes before assigning work |

## Open competition status

As of 17 October 2026:

1. Admission rules: chain-derived admission is implemented and off by default.
2. Isolated evaluation: the sandboxed evaluation subprocess is merged.
3. Refreshed held-out benchmarks: the round-one sealed holdout is authored
   (1,458 cases in six families), and a confirmation draw is required before
   any promotion.
4. Promotion and rollback: two channels and the adapter regression suite are
   decided and implemented. The channel is platform configuration today; a
   registry alias and automatic follow-stable upgrades remain.
5. Public health and chain reporting: remaining.

### Base tier

Miners can submit a full-weight replacement for the pinned base of a text
profile. The [base-model competition](/operations/base-tier) page describes
scoring, the confirmation draw, the regression suite and the `latest` and
`stable` channels. Candidate loading, round decisions, sandboxed evaluation,
the regression suite, chain-derived admission and the dry-run promotion script
are merged. No public round has been run.

### d3-mini

The profile `d3-mini-4.5b-v1` (vendor model `vllm-sr/d3-mini`, mirrored as
`zils-ai/d3-mini-4.5b-v1`) was merged on 16–17 October 2026: the profile and
pins, the runtime module, node provisioning and qualification, images and video
through the runtime, platform routing, a `latest` channel that can point at d3
when configured, and cross-profile upgrades with `base_change`
(see [version selection](/training/versions#changing-the-base-profile)).

Not yet: d3 is not the default for new jobs, the platform migrations are not
applied in production, and no d3 serving process runs. Its promotion under the
base-tier rules is pending: the first draw cleared, and the confirmation draw
and the regression suite had not completed as of 17 October. The recorded
evidence is in [model research](/research/open-models#d3-mini-evidence-16-october-2026).

Approved miners can read and retain exported training data. Export consent does
not provide confidential compute or recall downloaded copies. Data retention
rules depend on the workflow; see the [image policy](/api/images#limits-and-retention)
and [bulk policy](/api/reference#capacity-usage-and-retention).

## Read research within its scope

The [product-matching experiment](/research/commerce) recorded an additional
JevK5 adapter that reduced held-out accuracy and worsened probability error.
It was not promoted. The [queue pilot](/research/queue-pilot) missed its frozen
acceptance threshold and delivered no accepted model.

H2O's current-runtime training/reload check is compatibility evidence, not a
matched quality or speed comparison. Earlier speed ratios use different runtime
conditions and cannot promise current-stack performance. Preserve unfavorable
results and compare models on the same cohort and stack.
