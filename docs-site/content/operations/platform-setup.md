---
title: Platform source installation
---

# Install the hosted platform

This guide is for operators with access to `ooo-hq/zils-platform`.
Application developers only need the [hosted API or SDK](/sdks/overview).
Miner operators use the public [miner guide](/operations/miners).

## Source installation

Use Git and Python 3.13. Clone both repositories beside each other, then install
the exact shared-code revision required by the platform:

```sh
git clone https://github.com/ooo-hq/zils.git
git clone https://github.com/ooo-hq/zils-platform.git
cd zils-platform
git -C ../zils checkout "$(cat subnet-ref.txt)"
python3.13 -m venv .venv-platform
.venv-platform/bin/python -m pip install -e ../zils -e .
```

Run hosted service commands from `zils-platform`. Run model download/reference
commands from the sibling `zils` checkout. Keep private environment files, model
caches and job state outside version control. Miners do not receive backend
service-role credentials.

H2O and Imajev each require their own GPU runtime. Installing the Python 3.13
control environment does not install or qualify those runtimes. Follow
[H2O setup](/operations/h2o) and [Imajev setup](/training/imajev).

## Existing deployments

Update working directories and hosted module names together. Keep database
migration history, model references, signing identities and active job state.
Retain runtimes needed by older jobs. Do not recreate databases or relabel
adapters to make the new checkout work.

The repository split alone requires no database reset. Model feature migrations
remain additive and must be applied through the existing ledger. Review each
feature's deployment guide before enabling admissions.
