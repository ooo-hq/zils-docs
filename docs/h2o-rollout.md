# H2O as the default miner adapter base

New text jobs pin `h2o-lightning-4b-v1.2.3`. Existing jobs retain their frozen
profiles. This is a training-base change; the shared Jev inference endpoint and
ImaJev image profile retain their identities.

## Install and qualify

1. Install the subnet source pinned by `subnet-ref.txt` and complete its
   [H2O miner setup](https://github.com/ooo-hq/zils/blob/main/docs/queue-miners.md).
   Keep the Python 3.13 platform environment and install H2O's separate Python
   3.12 GPU environment. Set `ZILS_H2O_RUNTIME_PYTHON` on miners and processors.
2. Rehearse `202610100001_h2o_training_profile.sql` with `make check-queue-db`, then
   apply it through the existing migration ledger. It adds H2O and updates profile
   routing; it does not rewrite jobs, releases, leases, or historical evidence.
3. Qualify each H2O worker on its actual hardware, including training and adapter
   reload at the 2,048-token boundary. Register its exact profile/runtime hashes
   in `zils_worker_profiles` with the measured memory guard and evidence. H2O
   approval is explicit: the migration does not copy JevK5 qualifications.
4. Start processors with the H2O reference plus references needed by existing
   jobs. Start miners with the same references. Then set
   `ZILS_TRAINING_MODEL=h2o-lightning-4b-v1.2.3` on the training API and processor.
   Verify `/v1/config` and a newly created job both expose the H2O profile.

From the subnet checkout, the hashes for operator registration are:

```bash
.venv-kev/bin/python -c 'import json; from zils import models; from zils.miner_grading import trainer_identity; print(json.dumps({**models.profile_identity(models.H2O), "trainer_sha256": trainer_identity(models.H2O)}))'
```

The processor uses the existing platform command with the new primary reference:

```bash
export ZILS_H2O_RUNTIME_PYTHON=/absolute/path/to/zils/.venv-h2o/bin/python
.venv-platform/bin/python -m zils_platform.coordinator process \
  --state .private/processor --reference /absolute/path/to/zils/models/h2o-reference \
  --additional-reference /absolute/path/to/zils/models/jevk5-reference \
  --device cuda
```

Load the existing server environment before running this command. Only include
references installed and retained by the operator. Keep the same protected
`ZILS_COMPUTE_LOCK` across all processes sharing a GPU. A runtime upgrade changes
trainer fingerprints; graded routing needs fresh H2O benchmark contexts and
qualification reports. JevK5 scores cannot qualify H2O jobs.

Add a separate `h2o` section to the existing workflow configuration. It uses the
same fields as the existing text section: `hotkey`, `min_free_mib`, `releases`,
`runtime_url`, `token_env`, and either `registry` or `register_command`. Retain the
original section for legacy jobs. The H2O release directory must differ from the
legacy directory, and its measured `min_free_mib` must be at least 12,288. Optional
`training_services`, `nvidia_smi`, `gateway_runtime_url`, and `release_group` retain
their existing meanings. Missing H2O configuration leaves its jobs waiting rather
than assigning them to a legacy runtime.

## Serving accepted adapters

Each adapter runtime loads one pinned base. Keep H2O and JevK5 releases in
separate private release directories and route their registry entries to the
corresponding runtime. A runtime rejects mixed-base catalogs and never loads a
JevK5 adapter into H2O. The existing `--shared-model-dir` mode remains JevK5-only.

Run H2O adapter serving with the H2O interpreter, the subnet and platform source
checkouts on `PYTHONPATH`, and the platform's `requirements/api.txt` plus the
subnet's `requirements/rehearsal.txt` installed in that isolated environment.
Do not install the platform package itself into the
Python 3.12 environment; its control-plane package requires Python 3.13. Keep
runtime credentials server-side and preserve the existing loopback HTTP contract.
Publish and activate only adapters that passed the independent evaluator.

For example, with a privately provisioned `ZILS_H2O_ADAPTER_RUNTIME_TOKEN`:

```bash
export ZILS_SUBNET_DIR=/absolute/path/to/zils
export ZILS_PLATFORM_DIR=/absolute/path/to/zils-platform
uv pip install --python "$ZILS_SUBNET_DIR/.venv-h2o/bin/python" \
  -r "$ZILS_PLATFORM_DIR/requirements/api.txt" -r "$ZILS_SUBNET_DIR/requirements/rehearsal.txt"
mkdir -p .private/h2o-releases
PYTHONPATH="$ZILS_SUBNET_DIR:$ZILS_PLATFORM_DIR" "$ZILS_SUBNET_DIR/.venv-h2o/bin/python" \
  -m zils_platform.adapter_server --releases .private/h2o-releases \
  --reference "$ZILS_SUBNET_DIR/models/h2o-reference" --port 8932 \
  --token-env ZILS_H2O_ADAPTER_RUNTIME_TOKEN
```

`--reference` starts an empty H2O adapter slot before the first release exists.
Only verified accepted releases are exposed through the runtime health catalog.

## Rollback

Restore `ZILS_TRAINING_MODEL=jevk5-4b-v0.3` to change subsequent jobs. Keep H2O
references, workers and serving processes available for H2O jobs and releases
already created. Do not delete the additive migration or mutate frozen profiles.
Retain the previous code/runtime installations until the replacement passes its
hardware checks. Source changes alone do not update a running service.
