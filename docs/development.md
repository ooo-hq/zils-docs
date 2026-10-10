# Local development

Choose the [owning repository](/getting-started/repositories) before editing.
Applications use the HTTP API and SDK; miner code does not import hosted services.

## Repository setup

Clone `ooo-hq/zils` for miners and shared model/evaluation code. Follow its
[development guide](https://github.com/ooo-hq/zils/blob/main/docs/development.md)
for dependencies and checks. CUDA model checks use their pinned environments;
H2O, Imajev and the control process have different runtime requirements.

For hosted services, follow [platform source installation](/operations/platform-setup#source-installation).
The platform pins its sibling subnet source in `subnet-ref.txt`. Preserve HTTP
contracts, model identities, signatures and migration history during changes.

Client development belongs in `zils-sdk`; see [SDK checks](/sdks/overview#development-checks-and-packaging).
Its normal tests use local HTTP fixtures. Integration checks need a local platform
checkout and do not require production credentials or paid requests.

## Documentation checks

From a fresh docs checkout:

```sh
git clone https://github.com/ooo-hq/zils-docs.git
cd zils-docs
npm --prefix docs-site ci
npm --prefix docs-site run check
```

Use Node.js 22 or newer. The docs build uses only files in this repository.
Keep operational notes and machine-specific inputs in ignored `.private/` storage.
Run examples against fixtures before any explicit hardware or deployment check.

## Historical smoke-test candidate {#train-a-smoke-test-candidate}

The linked Kev benchmark is a historical workflow. Reproduce it with its recorded source revision and [original training command](https://github.com/ooo-hq/zils/blob/a3fc93cb0866f4c780f12a0548660e5a1b210dda/docs/development.md#train-a-smoke-test-candidate). Current miner setup is in the [H2O and Imajev guide](/operations/miners).
