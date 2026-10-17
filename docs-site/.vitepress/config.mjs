import { defineConfig } from 'vitepress';
import { downloads } from '../pages.mjs';
import { codeThemes, codeLabels } from './code-theme.mjs';

const jsonlDownloads = new Set(downloads.filter(file => file.endsWith('.jsonl')).map(file => `/downloads/${file}`));

export default defineConfig({
  srcDir: '.generated',
  title: 'Zils Docs',
  description: 'Understand Zils and integrate decision models. Starting paths for developers, miners, validators and researchers.',
  lang: 'en-US',
  cleanUrls: true,
  // VitePress treats .jsonl as page URLs; check.mjs validates these actual files.
  ignoreDeadLinks: [url => jsonlDownloads.has(url)],
  appearance: true,
  markdown: {
    theme: codeThemes,
    codeCopyButtonTitle: 'Copy code',
    config: codeLabels,
  },
  sitemap: { hostname: 'https://docs.zils.ai' },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'preload', href: '/fonts/grenze-gotisch-zils.woff2', as: 'font', type: 'font/woff2', crossorigin: '' }],
    ['meta', { name: 'theme-color', content: '#5140b9' }],
    ['meta', { property: 'og:site_name', content: 'Zils Docs' }],
    ['meta', { property: 'og:type', content: 'website' }],
  ],
  transformHead({ pageData }) {
    const route = pageData.relativePath.replace(/(?:index)?\.md$/, '');
    return [['link', { rel: 'canonical', href: `https://docs.zils.ai/${route}` }]];
  },
  themeConfig: {
    siteTitle: false,
    nav: [
      { text: 'Start here', link: '/' },
      { text: 'Developers', link: '/getting-started/quickstart' },
      { text: 'Changelog', link: '/changelog' },
      { text: 'Research', link: '/research/' },
      { text: 'zils.ai', link: 'https://zils.ai' },
    ],
    search: { provider: 'local' },
    outline: { level: [2, 3], label: 'On this page' },
    socialLinks: [{ icon: 'github', link: 'https://github.com/ooo-hq/zils-docs' }],
    sidebar: [
      { text: 'Start here', items: [
        { text: 'What is Zils?', link: '/' },
        { text: 'Fit Zils into your application', link: '/getting-started/ecosystem' },
        { text: 'How decision models work', link: '/getting-started/decisions' },
        { text: 'Available today & planned work', link: '/getting-started/roadmap' },
      ] },
      { text: 'Choose your path', items: [
        { text: 'Developers: first decision', link: '/getting-started/quickstart' },
        { text: 'Miners: contribute compute', link: '/operations/miners' },
        { text: 'Validators: evaluate candidates', link: '/operations/validators' },
        { text: 'Learn & research', link: '/research/getting-started' },
      ] },
      { text: 'Build with Zils', items: [
        { text: 'SDKs, CLI and MCP', link: '/sdks/overview' },
        { text: 'Rank options · SDK', link: '/sdks/ranking' },
        { text: 'Image decisions', link: '/api/images' },
        { text: 'API reference & bulk jobs', link: '/api/reference' },
        { text: 'Run JevK5 locally', link: '/getting-started/local-inference' },
      ] },
      { text: 'Models & source', collapsed: true, items: [
        { text: 'H2O, d3-mini and Imajev', link: '/getting-started/models' },
        { text: 'Repositories & contributions', link: '/getting-started/repositories' },
      ] },
      { text: 'Work with your data', items: [
        { text: 'Prepare a dataset', link: '/training/data' },
        { text: 'Understand the result', link: '/training/results' },
        { text: 'Train from the CLI', link: '/training/cli' },
        { text: 'H2O text adapters', link: '/training/h2o' },
        { text: 'Imajev image adapters', link: '/training/imajev' },
        { text: 'Existing JevK5 jobs', link: '/training/jevk5' },
        { text: 'Training workflow', link: '/training/shared-queue' },
        { text: 'Automatic training & activation', link: '/training/automatic' },
        { text: 'Model versions & upgrades', link: '/training/versions' },
      ] },
      { text: 'Miner & validator operations', collapsed: true, items: [
        { text: 'Miner qualification', link: '/operations/miner-qualification' },
        { text: 'Checkpoint evaluation', link: '/evaluation/checkpoints' },
        { text: 'Local and testnet fleets', link: '/operations/fleet-miners' },
        { text: 'Apple silicon (JevK5)', link: '/operations/mac-miners' },
        { text: 'Register on Bittensor', link: '/operations/bittensor-registration' },
        { text: 'Base-model competition', link: '/operations/base-tier' },
      ] },
      { text: 'Platform operations', collapsed: true, items: [
        { text: 'Platform source setup', link: '/operations/platform-setup' },
        { text: 'Deploy H2O adapters', link: '/operations/h2o' },
        { text: 'Deploy the decision API', link: '/operations/decision-api' },
        { text: 'Deploy customer models', link: '/operations/customer-models' },
        { text: 'Deploy the training service', link: '/operations/training-service' },
        { text: 'Local development', link: '/operations/development' },
      ] },
      { text: 'Research record', collapsed: true, items: [
        { text: 'Results & evidence', link: '/research/' },
        { text: 'Tuned open models & B300', link: '/research/open-models' },
        { text: 'Experiment history', link: '/research/experiment-history' },
        { text: 'Public JevBench comparison', link: '/research/jevbench' },
        { text: 'Product matching', link: '/research/commerce' },
        { text: 'Commerce reproduction', link: '/research/commerce-reproduction' },
        { text: 'Queued training pilot', link: '/research/queue-pilot' },
        { text: 'Verified testnet round', link: '/research/testnet-round' },
      ] },
      { text: 'Legacy Kev 0.8B', collapsed: true, items: [
        { text: 'Local fleet setup', link: '/legacy/kev-quickstart' },
        { text: 'Dataset format', link: '/legacy/kev-data' },
        { text: 'Local training jobs', link: '/training/local-jobs' },
        { text: 'Training queue', link: '/legacy/kev-queue' },
        { text: 'Training results', link: '/legacy/kev-results' },
        { text: 'Run a miner', link: '/legacy/kev-miners' },
        { text: 'Bittensor testnet', link: '/operations/testnet' },
        { text: 'Synthetic benchmarks', link: '/evaluation/benchmarks' },
      ] },
    ],
  },
});
