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
| Public network | Open discovery, admission, isolated hostile-checkpoint evaluation and independently verified serving health |
| Clients | Python package publication; image training and bulk workflows beyond the current CLI/SDK surface |
| Model promotion | Retain exact profiles, evidence and rollback support; qualify new runtimes before assigning work |

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
