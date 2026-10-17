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

On October 16, 2026, one rented B300 compared d3-mini (`d3-mini-4.5b-v1`) with the stock H2O incumbent on the round-one sealed holdout of the [base tier](/operations/base-tier), through the validator's decision rule. Stock d3-mini scored Brier 0.142 and accuracy 89.8% against 0.184 and 87.7%, which makes it eligible and a pending winner. A d3 adapter trained with the frozen production recipe tied the H2O adapter on the 500-case ABCD test cohort (83.4% vs 83.0%, interval includes zero) and beat it on the historical cohort (86.6% vs 83.6%, interval +0.6 to +5.4); this reproduced across two seeds. A feature probe answered yes/no, score, multi-question, JSON state, one, two and four images and a short video correctly.

These are one card on one day. Nothing above 4,096 input tokens was tested, and the holdout is teacher-authored, not customer data. As of October 17, 2026 the promotion is pending: the first draw cleared, and the confirmation draw and regression suite have not completed. d3-mini is not the default for new jobs.

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

Start with the [API quickstart](/getting-started/quickstart) for hosted decisions, or [local JevK5 inference](/getting-started/local-inference) on your own GPU. The [legacy synthetic benchmark](/evaluation/benchmarks) generates data for the Kev fleet. The [commerce reproduction status](/research/commerce-reproduction) explains which evidence is available and which scripts still need publication. Public aggregate JSON downloads are linked from each report.
