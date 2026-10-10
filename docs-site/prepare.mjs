import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { guides, downloads, legacyGuides } from './pages.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const repo = path.dirname(root);
const output = path.join(root, '.generated');
const routes = new Map(guides.map(([source, route]) => [source, `/${route}`]));
routes.set('docs/README.md', '/');
routes.set('README.md', '/legacy/kev-quickstart');
routes.set('experiments/commerce-001/licenses/', '/research/attribution');
routes.set('experiments/commerce-001/README.md', '/research/commerce-reproduction');
const publicFiles = new Map(downloads.map(source => [source, `/downloads/${source}`]));

function rewriteLink(href, source) {
  if (/^(?:[a-z]+:|#|\/)/i.test(href)) {
    if (['https://github.com/ooo-hq/fez#setup', 'https://github.com/ooo-hq/zils#setup'].includes(href)) return '/legacy/kev-quickstart#repository-setup';
    if (href === 'https://fez.chat/model') return 'https://zils.ai/model';
    return href.replace('https://github.com/ooo-hq/fez', 'https://github.com/ooo-hq/zils');
  }
  const [filename, fragment] = href.split('#');
  const target = path.posix.normalize(path.posix.join(path.posix.dirname(source), filename));
  let hash = fragment ? `#${fragment}` : '';
  if (target === 'README.md' && fragment === 'setup') hash = '#repository-setup';
  if (target === 'experiments/commerce-001/README.md') hash = '';
  if (routes.has(target)) return routes.get(target) + hash;
  if (publicFiles.has(target)) return publicFiles.get(target) + hash;
  throw new Error(`Unmapped publication link in ${source}: ${href}`);
}

await rm(output, { recursive: true, force: true });
await cp(path.join(root, 'content'), output, { recursive: true });
await cp(path.join(root, 'public'), path.join(output, 'public'), { recursive: true });

for (const [source, route, title] of guides) {
  const original = await readFile(path.join(repo, source), 'utf8');
  // Preserve historical names, measurements, commands, and limitations verbatim.
  // Rebase Markdown links because the published information architecture differs.
  let markdown = original.replace(/\[([^\]]*)\]\(([^\s)]+)\)/g,
    (_, label, href) => `[${label}](${rewriteLink(href, source)})`);
  if (legacyGuides.has(source)) {
    markdown = markdown.replace(/^(# .+)$/m, '$1\n\n::: warning Legacy Kev 0.8B workflow\nThis historical guide uses the Kev 0.8B checkpoint contract. For current profiles, see [H2O and Imajev](/getting-started/models) and the [queue miner guide](/operations/miners). Use the recorded source revision when reproducing this older workflow.\n:::');
  }
  const target = path.join(output, `${route}.md`);
  await mkdir(path.dirname(target), { recursive: true });
  const pageTitle = legacyGuides.has(source) ? `${title} · Legacy Kev 0.8B` : title;
  await writeFile(target, `---\ntitle: ${JSON.stringify(pageTitle)}\n---\n\n${markdown}`);
}
for (const [source, url] of publicFiles) {
  const target = path.join(output, 'public', url);
  await mkdir(path.dirname(target), { recursive: true });
  await cp(path.join(repo, source), target);
}
console.log(`Prepared ${guides.length} technical guides and ${downloads.length} public evidence files.`);
