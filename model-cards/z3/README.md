# z3 publication material

Published on 23 October 2026: [z3-mini v1](https://huggingface.co/zils-ai/z3-mini-v1/tree/c9b7515250c0444192767fc00975402f12421413)
and the [z3 collection](https://huggingface.co/collections/zils-ai/z3-zils-decision-models-6adba7c1282790f3c15805db).
All 26 non-README files match the source revision by Git blob ID and, for LFS
files, SHA-256. Only the model card changed. The original repository is intact.

- `z3-mini-v1.md`: model card for the founding mini baseline.
- `collection.md`: title, description and initial-entry note for the z3 collection.

## Publication checklist

1. Create `zils-ai/z3-mini-v1` from the exact source revision
   `zils-ai/d3-mini-4.5b-v1@b54402a963373cc44713f18c9596c580e31cc68b`.
   Preserve all model/runtime files, LICENSE and NOTICE. Replace only the README
   with the model card here. Keep the existing pinned repository available.
2. Verify every model/runtime file hash against the original pinned revision;
   verify attribution and model-card metadata before making the repository public.
3. Add the verified repository to the z3 collection. Include founding-baseline
   status explicitly. Candidate repositories remain outside the release collection.
4. Update the website and docs weight links to the newly published revision only
   after it resolves and its files are verified. The launch page and model guide now link to the verified z3 revision.

For each elected successor, publish a new immutable revision/version with its
parent, candidate identity, aggregate validation evidence and approved release
record. Never reuse a version for different weights. Hosted availability must
be qualified separately; publication alone does not enable an API model.
