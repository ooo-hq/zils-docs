# Zils documentation

Source for [docs.zils.ai](https://docs.zils.ai): model profiles, miner operations,
hosted APIs, SDKs, CLI and research evidence.

## Develop

Use Git and Node.js 22 or newer. No model, GPU, service credentials or sibling
repository is needed to build this site.

```sh
git clone https://github.com/ooo-hq/zils-docs.git
cd zils-docs
npm --prefix docs-site ci
npm --prefix docs-site run dev
```

## Check and contribute

Edit introductory pages in `docs-site/content/` and technical guides in `docs/`.
`docs-site/pages.mjs` maps technical guides to stable URLs and explicitly lists
public downloads. Add navigation in `docs-site/.vitepress/config.mjs`.

```sh
npm --prefix docs-site run check
```

The check builds the site, checks internal links and anchors, rejects private
paths, and compares evidence downloads with their source bytes. Open a pull
request with the affected contract, source revision and verification. Check
commands against their owning code repository; `sources.json` records the
source revisions used for this update. Historical measurements are not current
capacity or quality promises. Preserve their datasets, hashes and licenses.

## Deploy

The existing Vercel project serves `docs.zils.ai`. `vercel.json` defines the
standalone build; publish only `docs-site/.vitepress/dist/`. Pull requests use
preview deployments; `main` is the production source once Git is connected.
No environment variables are required for this static build.

## Repository ownership

| Repository | Responsibility |
| --- | --- |
| [zils](https://github.com/ooo-hq/zils) | Miners, validators, shared model and evaluation contracts |
| [zils-platform](https://github.com/ooo-hq/zils-platform) | Hosted APIs, orchestration, billing, storage and serving integration |
| [zils-sdk](https://github.com/ooo-hq/zils-sdk) | Python/TypeScript clients, CLI and MCP |
| [zils-web](https://github.com/ooo-hq/zils-web) | Website and customer application |
| [zils-docs](https://github.com/ooo-hq/zils-docs) | This public manual and site |

Platform and SDK source currently require organization access. The published
npm packages and hosted API do not require access to those repositories.
