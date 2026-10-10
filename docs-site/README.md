# Documentation build

This site is maintained in `ooo-hq/zils-docs`. See the [repository README](../README.md) for setup, checks and deployment. Introductory pages live in `content/`; `pages.mjs` maps the technical guides in `../docs/` and allowlists public downloads. `prepare.mjs` copies only these inputs into ignored `.generated/`. The standalone checkout includes every required input.

Preserve historical evidence, model identities and existing URLs. Check examples against their owning implementation repository. Never copy an entire backend checkout into the publication tree.
