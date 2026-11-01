---
title: Zils Current
description: "Zils Current turns public events into decision questions labelled by what actually happened, and a soup pool can draw its round items from them."
---

# Zils Current

Real-world decisions, labelled by what actually happened.

Zils Current (`python -m zils.current`, in the `zils` repository) turns public events into decision questions and labels each one with what really happened later. A Wikipedia edit is saved; within days it is reverted or it stays. A Stack Exchange question is asked; a week later it is closed or still open. The text available when the event happened is the question, and the outcome is the label. Nothing is decided by a language model.

Because every item describes an event that happened after a model was trained, no model can have seen it at training time. Any validator or miner can run the tool on a machine with network access and rebuild the same items from the same public sources. It writes local files only and never uploads anything.

## Streams

| Stream | Question | Type | Label from | Category |
| --- | --- | --- | --- | --- |
| `wikipedia-revert`, `wikipedia-revert-<lang>` | Will this article edit be reverted? | yes/no | the edit's `mw-reverted` tag after a waiting period | language |
| `wikidata-revert` | Will this Wikidata item edit be reverted? | yes/no | as for Wikipedia | retrieval |
| `wikipedia-afd` | How did this deletion discussion close? | choice (keep, delete, merge or redirect, no consensus) | the closing result of an English Wikipedia Articles for deletion discussion | reasoning |
| `stackexchange-closed-<group>` | Will this new question be closed? | yes/no | the question's close date a week or more after asking | the group |
| `stackexchange-score-<group>` | What score will this new question have? | score (4 levels) | the question's score a week or more after asking | the group |
| `stackexchange-accepted-<group>` | Which of these answers did the asker accept? | choice (2 to 4 answers) | the accepted answer | the group |
| `github-issue-type`, `github-issue-close`, `github-pr-merge` | Bug or feature request? Closed as completed? Will this pull request be merged? | choice, yes/no | the issue's labels, close reason or merge flag | language, reasoning |

The Wikipedia streams cover English plus German, French, Spanish, Japanese, Italian, Portuguese, Russian and Chinese, one stream per language so labels balance per language. Stack Exchange sites are grouped by subject into the five exam categories (tools, reasoning, language, retrieval, arts), so every category gets yes/no, choice and score items. With the default blocks the streams reach all ten cells of the base score (five categories by two blocks).

The question shows only what was known when the event happened: an edit's summary, size change, editor kind and diff; a question's site, title, tags and body; a discussion up to its close, without the closing statement. Scores, votes, view counts and user names are never shown.

The GitHub streams are local-only: their text cannot be republished, so they never enter a publishable export.

## Run it

```bash
python -m zils.current collect --source recentchanges
python -m zils.current collect --source stackexchange
python -m zils.current collect --source afd --day 2026-10-04
python -m zils.current resolve
python -m zils.current export --bank BANK --reference EXAMS/
python -m zils.current nightly --state STATE --bank BANK --reference EXAMS/
python -m zils.current grade --items BANK/<date>/items.jsonl --model CHECKPOINT
```

`collect` gathers events, `resolve` labels the ones whose outcome is now known, and `export --bank` writes one dated folder per UTC day of resolutions: `items.jsonl` in the exam format and a `manifest.json` recording the settings, per-stream counts and hashes. `nightly` runs one collect, resolve and export pass and is meant for a daily timer. `grade` scores one export with one z3 checkpoint through the same path soup rounds use. The full command reference is `docs/current.md` in the `zils` repository.

## How labels are kept honest

- **Leak filters.** An item is dropped when its text was read after the outcome, or when its text states the outcome ("reverted", "was merged", "possible duplicate", "the result was" and their equivalents in the other languages). Stack Exchange questions edited more than an hour after asking are dropped at collection, because later edits can reflect the outcome.
- **Proof and cross-check.** Every item must carry its source link, source ids and an outcome time later than its question time. For a random sample of each stream the label is derived again by a different method (the page history for reverts, whether the article still exists for deletion discussions, a second fetch for Stack Exchange). A stream below 97% agreement is removed from the export, and a stream that fails in the nightly job is paused until a person re-enables it.
- **Overlap check.** Each export is compared with reference sets (exam draws, the round bank, benchmark items, training pools) by prompt fingerprint, content hash, normalized text and shared passages of about 50 words. Matching items are dropped. Without references the export stops unless the check is explicitly skipped, and the manifest records that.

The overlap check catches copies, not paraphrases or translations, and the outcome phrase list is short, so paraphrased outcomes can slip through. Many streams resolve only tens of items in a freshness window, which is why soup rounds merge or drop small streams (below).

## Soup rounds on Current items

By default a soup round draws its items from the validator's fixed round bank. A validator can point a pool at its Zils Current exports instead:

```json
"exam": {
  "source": "current",
  "current_bank": "/var/lib/zils-current/bank",
  "current_share": 0.33,
  "min_family_items": 100,
  "exclude_streams": ["stackexchange-score-*"]
}
```

This is a **blend**: the fixed round bank keeps its families in every cell of the base score, and Current families are added next to them, up to `current_share` of the subset. With only `source` and `current_bank`, Current streams replace the bank's families in the cells they cover.

Each round then takes up to 1,000 items (by default) from dated folders whose manifest checks out: items resolved in the last 14 days, drawn at most 3 times across rounds, fitting the pool's input cap, with yes/no labels balanced, at least 3 streams contributing and no stream holding more than 40% of the Current part. Within a day, items are ranked under the validator's private seed. The fixed round bank fills any cell the Current part does not cover; without a blend, when Current streams cover every cell, the whole subset can come from Current.

Every cell of the base score has a fixed weight and the families in a cell count equally, so a stream with a few dozen items could move the whole score. Three quality settings guard against that; setting any of them applies the defaults shown above to the others:

- **`min_family_items`** (default 100): small streams of the same cell and question type are merged into one family, and only families that reach the minimum are drawn. Families of equal size are rotated between rounds by the validator's private seed.
- **`exclude_streams`** (default `["stackexchange-score-*"]`): streams that are never drawn. Stack Exchange score items show close to zero skill for every model measured, so they are left out by default.
- **`current_share`** (default 1): below 1, the round blends as described above. If the rules cannot be met, the round uses the fixed round bank as usual, and its record says so.

Pooled decisions over the last three rounds work the same way on Current items. See [Soup pool](/operations/soup).

Every resolved item is public and can be rebuilt by anyone, labels included. A body committed after an item resolved could have been trained on it. The short freshness window narrows that gap but does not close it.
