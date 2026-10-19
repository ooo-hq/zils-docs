# Documentation standards

This repository owns the public documentation website. Keep model execution,
hosted services, application code and SDK implementations in their owning repos.

- Verify commands, package availability and model pins against current source.
- Distinguish training profiles from inference aliases, implementation from live
  availability, and historical measurements from current guarantees.
- d3-mini is the only served base, for text and image jobs (`stable` and `latest`
  since 17 October 2026); existing H2O jobs keep their frozen profile and H2O is
  retiring; JevK5 and Imajev are retired.
  Miners execute model workloads. Development hardware is only for bootstrapping
  and testing, not the permanent execution architecture.
- Preserve existing public URLs, evidence bytes and third-party license notices.
- Never publish credentials, private host details, customer data or local paths.
  Keep operational notes in ignored `.private/` directories.
- Run `npm --prefix docs-site run check` before publishing. Review new examples
  against the relevant SDK/API without creating paid jobs or exposing credentials.
