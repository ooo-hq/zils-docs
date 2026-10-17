---
title: Results and evidence
---

# Results and evidence

New to decision models? Start with [learn about decision models](/research/getting-started) for concepts and a first evaluation. This page is the record of completed studies.

Experiments answer specific questions under recorded conditions. They are not model releases or guarantees of customer-task performance. Unfavorable comparisons remain part of the record.

## Tuned open models can compete

Task-specific adapters on open-weight JevK5 4B outperformed **TypeSafe's official hosted Jev 1.13.0** on our recorded support-action and mate-in-one tests. Specialization can make an open model competitive on a defined task; this does not establish a general model ranking.

| Direct comparison | Tuned open model | Official Jev 1.13.0 |
| --- | ---: | ---: |
| ABCD support actions, 500 conversations | 79.2% | 70.6% |
| Mate in one, 512 positions | 50.78% | 43.55% |

The support comparison measured an accuracy gain of 8.6 percentage points (paired 95% interval +4.8 to +12.2). Official Jev retained a calibration advantage. A deterministic chess-rules baseline scored 100%, above both learned systems. Read the [full research guide](/research/open-models) for methods, intervals, and evidence.

## B300 follow-up: practical models for miners

The October 10 study compared local H2O and JevK5 models. H2O 4B had 2.99× lower median latency than the selected JevK5 4B adapter on B300; JevK5 2B used 54% less peak CUDA allocation. Neither established an accuracy advantage over the selected 4B adapter on the two reused 500-conversation cohorts. Selected 9B showed no clear accuracy gain, and the fixed full-weight recipe trailed matched LoRA.

These are B300 measurements, not a new hosted Jev comparison or a guarantee for miner hardware. Earlier H2O tests support RTX 4090 feasibility, but the new checkpoints have not been rerun there. See [B300 results and hardware limits](/research/open-models#b300-models-practical-for-miners) and the [website study](https://zils.ai/model/b300-study).

The [flight-risk study](https://zils.ai/model#flight-study) and earlier experiments remain available with their original baselines and limitations.

## d3-mini: a multimodal base candidate

On the night of October 16–17, 2026, one rented B300 (6.75 hours) compared d3-mini (`d3-mini-4.5b-v1`) with the stock H2O incumbent under the rules of the [base tier](/operations/base-tier). **Stock d3-mini is not promotable today.**

On the round-one sealed holdout, through the validator's decision rule, stock d3-mini scored Brier 0.142 and accuracy 89.8% against 0.184 and 87.7%, which made it eligible. That result was reproduced exactly on the node through the validator path, so it is real for that set. It did not carry over to the confirmation draw, a second, disjoint, teacher-authored sealed set (291 calibration and 1,156 test cases, same six families) scored 12 hours later through the deployed validator path: d3-mini scored Brier 0.1790 and accuracy 88.6% against 0.1794 and 88.5% for H2O. The improvement of 0.0004 has a paired-bootstrap 95% interval of [−0.022, +0.023], and the rule needs at least 0.01 with a positive lower bound, so no winner is confirmed. By family, d3-mini won all six on the first draw and split three and three, narrowly, on the second. H2O improved between draws (0.184 to 0.179) while d3-mini fell (0.142 to 0.179), so the second set is not simply harder.

The adapter regression suite passed, on one reference job (ABCD) where the rule asks for three or four: adapters trained on d3-mini scored calibrated Brier 0.2515 against 0.2801 for adapters trained on H2O (84.0% vs 81.6%). A d3 adapter trained with the frozen production recipe also tied the H2O adapter on the 500-case ABCD test cohort (83.4% vs 83.0%, interval includes zero) and beat it on the historical cohort (86.6% vs 83.6%, interval +0.6 to +5.4); this reproduced across two seeds. A feature probe answered yes/no, score, multi-question, JSON state, one, two and four images and a short video correctly.

The merged d3 code ran end to end on a GPU for the first time (qualification parity 5.3e-7). A d3 training job on the ABCD dataset was accepted (84.0% test accuracy, Brier 0.244, against stock d3-mini's 48.0%), and its release answered a text call and a one-image call. An existing H2O task was upgraded to a d3 adapter with `base_change`: previous H2O release Brier 0.1805, d3 candidate 0.1667, improvement 0.0138 against a threshold of 0.01.

These are one card on one night. Nothing above 4,096 input tokens was tested, and the holdouts are teacher-authored, not customer data. As of October 17, 2026 `latest` is not set; `stable` and the default for new jobs remain H2O Lightning 4B v1.2.3, and H2O remains the base-tier incumbent. d3-mini is a merged, available profile but is not the default and is not promoted.

**Decision, October 17, 2026.** Zils is adopting d3-mini as its base anyway, by the owner's decision and recorded as an override of the promotion rule rather than a win under it. The grounds are capability: adapters trained on d3-mini beat adapters trained on H2O on the reference job and on ABCD, and d3-mini takes images and video, which H2O does not serve. `latest` moves to d3-mini once a permanent d3 fleet is running (a qualified d3 miner, a processor with the d3 reference, an always-warm d3 adapter runtime behind the gateway, and gateway and workflow on code that knows the profile), and `stable` follows after one real customer job has trained and served on it. Existing H2O jobs and releases keep their frozen profile and move only through `base_change` upgrade jobs. From the moment `latest` moves, stock d3-mini is the base-tier incumbent that future candidates must beat under the unchanged rule.

## Repository experiments

| Study | What was observed | Read the record |
| --- | --- | --- |
| Product matching | Additional JevK5 training reduced held-out accuracy; macro-F1 improvement was uncertain | [Method and results](/research/commerce) |
| Public JevBench | Trained candidate and published Kev tied at 147/231 correct; probability quality regressed | [Comparison](/research/jevbench) |
| Shared queue pilot | Training and evaluation completed; the candidate missed the frozen accuracy threshold | [Pilot report](/research/queue-pilot) |
| Bittensor testnet | A closed training-to-chain round completed with verified revealed weights | [Recorded round](/research/testnet-round) |

The [experiment history](/research/experiment-history) includes earlier training runs and model provenance.

## Read comparisons within their scope

Compare models on the same data, rubric, and timing conditions. Scores from unrelated datasets do not establish a ranking. A synthetic pipeline check can establish that training and delivery gates work; it cannot establish quality on real customer data.

Reports identify relevant hardware, frozen source revisions, aggregate measurements, and limits on reproduction. Private checkpoints and raw training data are not included in a fresh checkout.

## Reproduce a workflow

Start with the [API quickstart](/getting-started/quickstart) for hosted decisions, or the historical [local JevK5 inference](/getting-started/local-inference) guide for the retired upstream runtime. The [legacy synthetic benchmark](/evaluation/benchmarks) generates data for the Kev fleet. The [commerce reproduction status](/research/commerce-reproduction) explains which evidence is available and which scripts still need publication. Public aggregate JSON downloads are linked from each report.
