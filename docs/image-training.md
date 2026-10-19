# Image training

Before running service commands, complete the [source installation](../README.md#source-installation).
Run from the zils-platform checkout with the pinned sibling zils checkout available,
unless a section explicitly says to use the subnet checkout.

Image training jobs freeze the `d3-mini-4.5b-v1` profile (since 17 October 2026). The
earlier Imajev profile is retired: it takes no new jobs, has no runtime in this repository
and no registered release; its historical evidence stays in
[image rollout evidence](image-rollout.md). Every job freezes its model profile, task,
answer order, canonical image hashes, item groups, split membership and acceptance
policy. A worker may train only profiles explicitly qualified by an operator.
Self-reported hardware or a worker's list of supported profiles is not authorization.

## d3 image jobs

An image job is a d3 profile job with frozen `image_intake`: `POST /v1/jobs` with
`model: d3-mini-4.5b-v1`, the text acceptance policy (`min_accuracy`, `min_brier_improvement`,
optionally `previous_job_id`), `allow_training_data_export` and `image_intake`. Photos are
uploaded through `POST /v1/image-assets` with `purpose: training` and finalized with
`/complete`; `GET /v1/jobs/{id}/image-assets` lists them while the draft is open. Each
example is one canonical PNG and one choice question of up to 255 declared outcomes; the
processed prompt (photo tokens included) must fit 4,096 tokens. `GET /v1/image-models`
reports this profile and its limits under `training_profile`.

```text
POST /v1/jobs {model: d3, image_intake, text acceptance}   → zils_create_image_job
POST /v1/image-assets purpose=training, …/complete          → canonical RGB PNG in the asset store
POST /v1/jobs/{id}/submit             reads the splits, binds every asset → zils_submit_image_job
processor validating                  zils.image_jobs.build: manifest.model = d3, asset catalog,
                                      training export of {asset_id, sha256} references
workflow (d3 section)                 legacy approval: a qualified d3 worker, no graded workload
d3 worker                             /v1/workers/image-downloads → images/<sha256>.png → zils.d3 train
processor evaluating                  verified photo cache beside the benchmark → d3 runner with paths
accepted                              text adapter release, served by the d3 adapter server
```

Up to 1,024 training, 256 calibration and 512 test photos may be submitted, with a
1 GiB canonical-image total. Workers receive training-only image grants bound to the
current lease; calibration and test labels and photos remain validator-only. The validator
fits one temperature on calibration predictions, then freezes it for test scoring, and
checks accuracy, positive skill and the required Brier improvement, exactly as for a text
job. Incumbents are compared without re-training or re-calibrating them. A late upgrade
cannot replace a newer accepted version. A `previous_job_id` must name another d3 job.

An accepted candidate activates on the d3 adapter server, which takes up to four `images`
per request when started with `--image-store-origin` ([image decisions](image-decisions.md)).

## Accounts and credit

Image training uses the existing Google/email Supabase accounts and prepaid balance.
The separate early-access email signup remains unchanged. No additional invitation
or API-key system is introduced.

Submitting a draft reserves one included training run when eligible, otherwise $2.
The reservation and immutable image references commit together: insufficient credit
leaves the draft and photos available to retry. A completed evaluation consumes the
run even if no candidate qualifies. Failed processing or cancellation before work
begins releases the reservation; cancelling after a worker has started consumes it.
Repeated submissions and settlement events do not create another charge.

## Worker and service setup

1. Apply the image migrations in order: `202610080003` through `202610080007` (asset
   store, image jobs, worker profiles, processing, finalize recovery), then
   `202610170002_d3_image_assets.sql` and `202610170003_d3_image_submit.sql`, which let
   d3 jobs take and submit photos. Install `requirements/api.txt` on the gateway and
   `requirements/images.txt` (Pillow) wherever assets are canonicalized.
2. Qualify each d3 worker as for text ([d3 rollout](d3-rollout.md)); image jobs add no
   separate qualification. The d3 input cap of 4,096 tokens includes photo tokens.
3. The processor needs its d3 reference and runtime only; it downloads the frozen photos
   it evaluates. Keep `python -m zils_platform.image_cleanup` running: it retires expired
   drafts and prediction uploads and never touches a submitted job's photos.
4. Start the d3 adapter server with `--image-store-origin` so accepted releases answer
   image requests; without it image requests return 503 while text requests work.
5. Enable `ZILS_IMAGES_ENABLED=1` for image decisions and `ZILS_IMAGE_TRAINING_ENABLED=1`
   for training uploads. Creating a d3 job with `image_intake` is not gated by these flags;
   uploading training photos is.

## Evidence

The fixture HTTP flow in `tests/image_flow_fixture.py` runs the production coordinator,
signed worker protocol, validator and publisher against isolated account and storage
doubles with a d3 runtime stand-in: create, upload photos, submit, prepare (frozen d3
manifest), approve, miner training on cached photos, evaluation with absolute photo paths,
delivery and download, for an accepted and a rejected candidate. Disposable PostgreSQL
checks (`make check-queue-db`) cover the asset store, quotas, d3 and legacy submits and
retention. Fixture scores prove contracts, not accuracy; the first real d3 image training
is the owner's run.

## Deployment and rollback

Deploy the gateway, processor and workflow together with the website's image intake
(it must send the d3 profile). Rollback is a redeploy of the previous packages; the two
d3 image migrations only widen profile literals and need no SQL reversal.

To stop new image work, disable the image training flag and then the image prediction
flag as needed. Preserve artifacts, private records, ongoing lease recovery and cleanup;
leave all text entries and services running. Do not roll back by dropping shared tables
or replacing text model identities.
