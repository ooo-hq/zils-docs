---
title: Repositories
description: Find the source repository for miners, hosted services, SDKs, the website and docs.
---

# Find the right repository

Applications can use the hosted API and published clients without cloning the
model or platform repositories. Clone source when contributing or operating
your own deployment.

| Repository | Owns | Source access |
| --- | --- | --- |
| [ooo-hq/zils](https://github.com/ooo-hq/zils) | Miners, validators, model pins, training, evaluation and signed protocols | Public |
| [ooo-hq/zils-platform](https://github.com/ooo-hq/zils-platform) | API, queue orchestration, billing, storage, model serving and migrations | Organization access |
| [ooo-hq/zils-sdk](https://github.com/ooo-hq/zils-sdk) | Python/TypeScript SDKs, CLI and MCP server | Organization access; npm packages are public |
| [ooo-hq/zils-web](https://github.com/ooo-hq/zils-web) | Website, account UI and customer training flows | Public |
| [ooo-hq/zils-docs](https://github.com/ooo-hq/zils-docs) | This manual, navigation, public examples and documentation builds | Public |

## Start with your role

- **Application developer:** install [the SDK or CLI](/sdks/overview). No GPU,
  model download or backend source is required.
- **Miner operator:** clone `zils` and follow [miner setup](/operations/miners).
  Keep platform service credentials off miner hosts.
- **Platform operator:** install the platform and its exact subnet dependency
  using [platform setup](/operations/platform-setup).
- **Docs contributor:** clone `zils-docs`, run `npm --prefix docs-site ci`, then
  `npm --prefix docs-site run dev`. No sibling repository is needed.

## Commands after the split

Hosted modules now use `zils_platform`: for example,
`python -m zils_platform.coordinator` and `python -m zils_platform.api`.
`miner.queue`, `zils.fleet`, model setup and core evaluation remain in `zils`.
The platform pins its shared dependency in `subnet-ref.txt`; SDKs use HTTP and
do not import platform or miner internals.

The split preserves model IDs, HTTP routes, signed payloads and migration
history. Moving source does not migrate a running service, and merging an SDK
change does not publish a package. Follow each repository's release process.
Historical research pages retain the commands and measurements from their
recorded revisions.
