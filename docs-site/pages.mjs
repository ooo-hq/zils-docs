// Only these reviewed repository documents are published by the docs build.
// The fourth field names the owning repository; null marks a page maintained here.
export const guides = [
  ['docs/image-training.md', 'training/images', 'Train on images', 'zils-platform'],
  ['docs/image-decisions.md', 'api/images', 'Send images with a decision', 'zils-platform'],
  ['docs/developer-tools.md', 'sdks/overview', 'SDKs, CLI and MCP', 'zils-sdk'],
  ['docs/training-cli.md', 'training/cli', 'Train from the CLI', 'zils-sdk'],
  ['docs/model-research.md', 'research/open-models', 'Tuned open models and B300', 'zils'],
  ['docs/decision-api.md', 'api/reference', 'Decision API reference', null],
  ['docs/version-selection.md', 'training/versions', 'Customer model versions', 'zils-platform'],
  ['docs/training-workflow.md', 'training/shared-queue', 'Training workflow', null],
  ['docs/mining.md', 'operations/fleet-miners', 'Run a fleet miner', 'zils'],
  ['docs/miner-tuning.md', 'operations/miner-tuning', 'Train a soup body', 'zils'],
  ['docs/mining-terms.md', 'operations/miner-terms', 'Miner terms', 'zils'],
  ['docs/testnet.md', 'operations/testnet', 'Bittensor testnet', 'zils'],
  ['docs/bittensor-registration.md', 'operations/bittensor-registration', 'Register on Bittensor', 'zils'],
  ['docs/validators.md', 'operations/validators', 'Run a validator', 'zils'],
  ['docs/experiments.md', 'research/experiment-history', 'Experiment history', 'zils'],
  ['docs/jevbench-public.md', 'research/jevbench', 'Public JevBench comparison', 'zils'],
  ['docs/queued-training-pilot-001.md', 'research/queue-pilot', 'Queued training pilot', null],
  ['docs/commerce-pilot-001.md', 'research/commerce', 'Product-matching experiment', null],
  ['docs/testnet-round-001.md', 'research/testnet-round', 'Verified testnet round', 'zils'],
];


// Retired pages: their sources are deleted, so links to them resolve to the last revision
// that published them; vercel.json redirects their old site URLs.
export const retiredRevision = 'https://github.com/ooo-hq/zils-docs/blob/5770c6a';
export const retiredGuides = [
  'docs/h2o-queue.md',
  'docs/h2o-rollout.md',
  'docs/jevk5-queue.md',
  'docs/kev-training-queue.md',
  'docs/benchmark.md',
  'docs/roadmap.md',
  'docs/d3-rollout.md',
  'docs/decision-api-deployment.md',
  'docs/customer-adapter-serving.md',
  'docs/supabase-training.md',
  'docs/development.md',
  'docs/base-candidates.md',
  'docs/evaluation.md',
  'docs/queue-miners.md',
  'docs/queue-validator.md',
  'docs/miner-admission.md',
  'docs/miner-grading.md',
  'docs/customer-jobs.md',
  'docs/automatic-training.md',
];

export const downloads = [
  'examples/training/train.jsonl',
  'examples/training/calibration.jsonl',
  'examples/training/test.jsonl',
  'examples/zils-api/request.json',
  'docs/data/jevbench-public-001.json',
  'docs/data/testnet-round-001.json',
  'docs/data/queued-training-pilot-001.json',
  'docs/data/commerce-pilot-001.json',
  'experiments/commerce-001/protocol.json',
  'experiments/commerce-001/evidence/dataset-manifest.json',
  'experiments/commerce-001/evidence/environment.json',
  'experiments/commerce-001/evidence/predictions.jsonl',
  'experiments/commerce-001/licenses/SemIf-MIT.txt',
  'experiments/commerce-001/licenses/JevK5-Apache-2.0.txt',
  'experiments/commerce-001/licenses/ESCI-Apache-2.0.txt',
  'examples/diagnostics.jsonl',
  'examples/severity-explicit.jsonl',
];
