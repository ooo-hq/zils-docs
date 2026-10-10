import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { guides, downloads } from './pages.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, '.vitepress/dist');
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory()
    ? walk(path.join(dir, entry.name)) : path.join(dir, entry.name)))).flat();
}
const files = await walk(dist);
const pages = new Map(await Promise.all(files.filter(file => file.endsWith('.html')).map(async file => [file, await readFile(file, 'utf8')])));
let links = 0;
for (const [file, html] of pages) {
  const pageUrl = new URL(path.relative(dist, file), 'https://docs.zils.ai/');
  assert(!html.includes('/Users/'), `Workstation path published in ${file}`);
  for (const match of html.matchAll(/(?:href|src)="([^"<>]+)"/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    if (/^(?:[a-z]+:|\/\/)/i.test(href)) continue;
    const url = new URL(href, pageUrl);
    let target = path.join(dist, decodeURIComponent(url.pathname));
    if (url.pathname.endsWith('/')) target = path.join(target, 'index.html');
    else if (!path.extname(target)) target += '.html';
    assert(target.startsWith(`${dist}/`), `Link escapes site: ${href}`);
    assert((await stat(target).catch(() => null))?.isFile(), `Missing ${href} linked from ${path.relative(dist, file)}`);
    if (url.hash && pages.has(target)) {
      const id = decodeURIComponent(url.hash.slice(1));
      assert(pages.get(target).includes(`id="${id}"`), `Missing #${id} in ${path.relative(dist, target)} (from ${path.relative(dist, file)})`);
    }
    links++;
  }
}
for (const [, route] of guides) assert(pages.has(path.join(dist, `${route}.html`)), `Missing guide: ${route}`);
for (const source of downloads) {
  assert.deepEqual(await readFile(path.join(dist, 'downloads', source)), await readFile(path.join(root, '..', source)), `Evidence changed: ${source}`);
}
const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
assert(sitemap.includes('https://docs.zils.ai/'), 'Sitemap must use the docs domain');
assert(!files.some(file => /\/(?:\.env|\.git|\.private|node_modules)(?:\/|$)/.test(path.relative(dist, file))), 'Unexpected private build output');
console.log(`Verified ${pages.size} pages, ${links} internal links/assets, and ${downloads.length} unchanged evidence downloads.`);
