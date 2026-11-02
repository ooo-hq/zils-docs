# Train on images

Train a z3-mini model on your own labelled photos. Image jobs use the
`d3-mini-4.5b-v1` profile. Every job freezes its model profile, task, answer order,
canonical image hashes, item groups, split membership and acceptance policy.

## Create an image job

An image job is a d3 profile job with frozen `image_intake`: `POST /v1/jobs` with
`model: d3-mini-4.5b-v1`, the text acceptance policy (`min_accuracy`, `min_brier_improvement`,
optionally `previous_job_id`), `allow_training_data_export` and `image_intake`. Photos are
uploaded through `POST /v1/image-assets` with `purpose: training` and finalized with
`/complete`; `GET /v1/jobs/{id}/image-assets` lists them while the draft is open. Each
example is one canonical PNG and one choice question of up to 255 declared outcomes; the
processed prompt (photo tokens included) must fit 4,096 tokens (image training keeps the 4,096 limit; decisions take 8,192). `GET /v1/image-models`
reports this profile and its limits under `training_profile`.


Up to 1,024 training, 256 calibration and 512 test photos may be submitted, with a
1 GiB canonical-image total. Workers receive training-only image grants bound to the
current lease; calibration and test labels and photos remain validator-only. The validator
fits one temperature on calibration predictions, then freezes it for test scoring, and
checks accuracy, positive skill and the required Brier improvement, exactly as for a text
job. Incumbents are compared without re-training or re-calibrating them. A late upgrade
cannot replace a newer accepted version. A `previous_job_id` must name another d3 job.

An accepted model then takes up to four images per decision ([send images with a decision](image-decisions.md)).

## Accounts and credit

Image training uses your Zils account and its prepaid balance.

Image jobs cost the $2 training minimum ([pricing](/getting-started/pricing)); the included run from your first top-up covers one. Submitting a draft reserves it.
The reservation and immutable image references commit together: insufficient credit
leaves the draft and photos available to retry. A completed evaluation consumes the
run even if no candidate qualifies. Failed processing or cancellation before work
begins releases the reservation; cancelling after a worker has started consumes it.
Repeated submissions and settlement events do not create another charge.
