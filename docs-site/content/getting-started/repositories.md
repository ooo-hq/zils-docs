---
title: Repositories
description: Find the source repository for miners, hosted services, SDKs, the website and docs.
---

# Find the right repository

Applications use the hosted API and the npm clients; there is nothing to clone.
Clone source to mine, validate or contribute.

| Repository | Owns | Source access |
| --- | --- | --- |
| [ooo-hq/zils](https://github.com/ooo-hq/zils) | Miners, validators, model pins, training, evaluation and signed protocols | Public |
| [ooo-hq/zils-platform](https://github.com/ooo-hq/zils-platform) | API, queue orchestration, billing, storage, model serving and migrations | Organization access |
| [ooo-hq/zils-sdk](https://github.com/ooo-hq/zils-sdk) | Python/TypeScript SDKs, CLI and MCP server | Organization access; npm packages are public |
| [ooo-hq/zils-web](https://github.com/ooo-hq/zils-web) | Website, account UI and customer training flows | Public |
| [ooo-hq/zils-docs](https://github.com/ooo-hq/zils-docs) | This manual, navigation, public examples and documentation builds | Public |
| [ooo-hq/zils-brand](https://github.com/ooo-hq/zils-brand) | Logos, colors, type and design tokens | Public |

## Start with your role

- **Application developer:** install [the SDK or CLI](/sdks/overview). No GPU,
  model download or backend source is required.
- **Miner:** install with `curl -fsSL https://zils.ai/install.sh | sh` and follow the
  [soup pool guide](/operations/soup).
- **Validator:** follow [Run a validator](/operations/validators).
- **Docs contributor:** clone `zils-docs`, run `npm --prefix docs-site ci`, then
  `npm --prefix docs-site run dev`. No sibling repository is needed.
