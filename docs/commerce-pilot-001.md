# Product matching: shared JevK5 versus an additional fine-tune

Measured October 4, 2026. This is a local experiment on public data, not a
customer deployment, official ESCI leaderboard result, or published model release.

The additional fine-tune changed macro F1 from **0.4039 to
0.4572**, a **+5.32-point** change. Accuracy changed
from **347/512 (67.77%)** to
**308/512 (60.16%)**. It corrected **36**
shared-model mistakes and introduced **75** new mistakes.

The paired query-group bootstrap 95% interval for the macro-F1 change is
**-1.98 to +11.92 points**. This interval includes zero; the sample does not establish an improvement.

**Keep shared JevK5 as the experimental baseline.** This adapter reduced accuracy
and worsened probability error. Its zero confident mistakes reflect **zero
predictions above the 90% threshold**, not successful automation. The shared
version also sends 97.3% of cases to review. Neither result establishes readiness
for automated shopping decisions.

For context, predicting Exact for every pair would score 371/512 (72.46%)
accuracy and 0.2101 macro F1. Both models improve on that naive baseline's
class-balanced metric, but trail its accuracy on this Exact-heavy sample.

## Measured comparison

Both versions use independently fitted temperatures from the same separate
256-pair calibration split. No test label participates in calibration.

| Measure | Shared JevK5 | Additional LoRA |
| --- | ---: | ---: |
| Macro F1 (primary) | 0.4039 | 0.4572 |
| Accuracy | 67.77% | 60.16% |
| Correct / 512 | 347 | 308 |
| Brier ↓ | 0.4381 | 0.5634 |
| NLL ↓ | 0.8010 | 1.0694 |
| Wrong with ≥90% confidence | 2 | 0 |
| Predictions with ≥90% confidence | 14 | 0 |
| Review rate at 90% | 97.27% | 100.00% |

Fitted temperatures are 1.414214 (shared) and
1.464086 (fine-tuned). Among predictions at or above 90%,
accuracy is 85.71% and
unavailable, respectively.
Error counts should be read alongside these different coverage levels.

At the published temperature of 1.22, Brier is 0.4381 versus
0.5515, and confident errors number
7 versus 0.
Class predictions, accuracy, and F1 are unchanged by temperature fitting.
The [aggregate JSON](data/commerce-pilot-001.json) retains both complete tables,
confusion matrices, raw timing summaries, and artifact hashes.

| Class | Test support | Shared F1 | Fine-tuned F1 |
| --- | ---: | ---: | ---: |
| E | 371 | 0.8000 | 0.7204 |
| S | 100 | 0.4211 | 0.4535 |
| C | 6 | 0.0000 | 0.1600 |
| I | 35 | 0.3947 | 0.4948 |

Training took **21.36 minutes** including adapter
saving and excluding initial model loading, encoding, and evaluation. Peak
PyTorch GPU allocation was **8.44 GiB**.
Median / p95 inference times were **107.1 / 130.8 ms** for shared
and **70.1 / 75.4 ms** for the unmerged adapter. These measure
one product's synchronized forward/readout **including adapter-state context
management**, excluding tokenization, loading,
retrieval, networking, and queueing. Models ran sequentially; this is not a
throughput, production-latency, or optimized upstream-runtime comparison.
Shared timing also includes entering and exiting PEFT's adapter-disable context;
the two paths have different context-management overhead. These timings do not
demonstrate that the fine-tuned model is faster than a standalone shared model.

## Shopping-agent demonstration

Run the [local demo](../experiments/commerce-001/README.md#open-the-recorded-demo)
to inspect every held-out query and both sets of decisions. Eight featured
queries were fixed before predictions. Live mode accepts new requests, retrieves
up to six keyword candidates from the frozen sample catalog, and runs both
versions on the GPU. Recorded evaluations and new live predictions have distinct
labels. Neither mode checks live stock or prices or makes purchases.

The shortlist admits Exact predictions at ≥90% probability; potential Exact or
Substitute matches below that policy go to review. No buying decision is
executed. This illustrates how a decision model fits into an agent workflow.
It does not validate that workflow's business outcomes. The new adapter remains
experimental and is not promoted as the shared default or connected to the
hosted customer training queue.

## Frozen method

This is ESCI Task 2: classify the relationship between a shopping query and a
candidate product as **Exact, Substitute, Complement, or Irrelevant**. It does not
measure retrieval recall, full-catalog ranking, conversion, or agent task success.
The demo's shortlist policy is illustrative and was not an acceptance criterion.

The [protocol](../experiments/commerce-001/protocol.json) was fixed before training
and test inference. Both versions use the identical JevK5 v0.3 4B checkpoint,
BF16 forward passes, prompt, bounded product text, and four-option readout on one
RTX 4090. Shared inference disables the additional adapter; fine-tuned inference
enables it. There is no quantization comparison.

| Split | Pairs | Query groups | E / S / C / I |
| --- | ---: | ---: | --- |
| Additional training | 2,048 | 1,991 | 512 / 512 / 512 / 512 |
| Calibration | 256 | 32 | 166 / 54 / 16 / 20 |
| Final test | 512 | 64 | 371 / 100 / 6 / 35 |

Data comes from the US English portion of Amazon ESCI's larger release. Test
queries come only from its official test split; calibration and additional
training come from official train. Seeded SHA-256 ordering selects queries and
up to eight products per evaluation query. This run has exactly eight per query.
All normalized official test queries are excluded from the training pool.
Training is class-balanced; evaluation is not. Normalized queries and exact
query-product pairs do not cross the three splits. **Four product identities
appear in both training and test under different queries.** This is a holdout
of queries, not a holdout of every product.

HTML is removed and input lengths are bounded to 256 query characters, 512 title
characters, 80 brand characters, 80 color characters, and 384 bullet-point
characters. Full product descriptions are omitted. No row was dropped for missing
metadata or the 768-token cap. Maximum input lengths were 543 training, 438
calibration, and 461 test tokens. Reference labels and split metadata are never
included in the model prompt.

The single training recipe uses one epoch, seed 1004, 256 optimizer steps,
batch size 1 with accumulation 8, LoRA rank 16 / alpha 32 / dropout 0.05,
learning rate 3e-5, zero weight decay, 16 warmup steps, cosine decay, and gradient
clipping at 1.0. Cross entropy is applied to the four option-letter logits. The
base and output head remain frozen; 14,376,960 attention-adapter parameters are
trainable. The adapter is saved separately, without merging. No checkpoint or
hyperparameter selection uses test outcomes.

Each version gets a separate absolute softmax temperature selected by minimum
calibration NLL over 81 logarithmically spaced values from 0.25 to 4. The public
checkpoint's original temperature is 1.22. Temperature cannot change the chosen
class; it changes reported probabilities. Both original-temperature and fitted
scores are retained in the aggregate JSON.

Macro F1 averages the four class F1 scores equally and was the primary metric.
Accuracy weights every product pair equally. Brier is the mean sum of squared
errors across the four probabilities (range 0–2; lower is better). Confidence
errors count wrong predictions with maximum probability at least 90%; review
rate is the fraction below that threshold. The threshold is not validated for
customer automation. The 95% interval uses 2,000 paired resamples of the 64 query
groups, with seed 1004. It describes uncertainty within this small sample and
one training run, not variation across seeds or future customers.

## Provenance and limitations

[JevK5's model card](https://huggingface.co/alibiserikbay/JevK5) declares that its
shared checkpoint already trained on **1,186 ESCI examples** and used no official
test or validation splits for that release. This comparison therefore measures
additional specialization on an already-exposed domain. That is an upstream
statement, not an independent contamination audit; pretraining and exact overlap
with upstream training cannot be ruled out.

Only six test examples are Complements. Their class F1 and the resulting macro
average are sensitive to a few decisions. The official reference labels may
rely on product information omitted from the bounded input, and some visible
labels are debatable. One seed, one recipe, English queries, class-balanced
training, and this selected candidate set do not establish a general winner.
The models' robustness to malicious catalog text, tenant isolation, serving
throughput, and real shopping outcomes were not evaluated.

| Input | Pinned revision |
| --- | --- |
| [JevK5 checkpoint](https://huggingface.co/alibiserikbay/JevK5/tree/c4f7fdb3aeab5582336406e78d3bef11bf98833d) | `c4f7fdb3aeab5582336406e78d3bef11bf98833d` |
| [JevK5 source recipe](https://github.com/allebee/jevk5/tree/f26426d16f59e8bbe1470e5b162cc89329e29b29) | `f26426d16f59e8bbe1470e5b162cc89329e29b29` |
| [Amazon ESCI](https://github.com/amazon-science/esci-data/tree/7916cdf6ab75a462e77f20ab40428a10923998d5) | `7916cdf6ab75a462e77f20ab40428a10923998d5` |
| [SemIf-OpenJev pattern](https://github.com/TheoLeeCJ/SemIf-OpenJev/tree/23cf1f39fc9534fe81437200959b6dfc7106e45a) | `23cf1f39fc9534fe81437200959b6dfc7106e45a` |

The source checkpoint SHA-256 is
`13824e47f2e40fe052f06943976cf742cb366ba305741a111e75a8ebae907a9c`.
The [manifest](../experiments/commerce-001/evidence/dataset-manifest.json) records
source-file and frozen-split hashes. The [environment record](../experiments/commerce-001/evidence/environment.json)
records executed source hashes and package versions. Public training scripts
have formatting and unused-import cleanup; the training algorithm is unchanged.
The [reproduction guide](../experiments/commerce-001/README.md) creates all
required inputs from a fresh clone. Upstream licenses and attribution accompany
the experimental code and modified dataset excerpts.


## Verification

The public data-preparation scripts reproduced all three split files and the
manifest byte-for-byte using cached pinned inputs. An independent NumPy and
scikit-learn calculation matched accuracy, macro F1, Brier, NLL, confusion
matrices, confidence-error counts, and fitted temperatures to 1e-12.
The saved base and adapter hashes were verified, and reloading the saved adapter
reproduced 32 recorded forwards within a 1e-4 absolute-logit tolerance.
Verification evidence is included in the aggregate JSON. Lightweight tests cover
split leakage, label exclusion from prompts, scoring, review thresholds, and
local-server boundaries. The existing repository checks also pass.
