import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { pages } from '../src/pages.mjs';
import { SITE_ORIGIN } from '../src/seo.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
await rm(`${root}dist`, { recursive: true, force: true });
await mkdir(`${root}dist`, { recursive: true });
await cp(`${root}public`, `${root}dist`, { recursive: true });
for (const [path, content] of Object.entries(pages)) {
  const target = `${root}dist/${path}`;
  await mkdir(target.slice(0, target.lastIndexOf('/')), { recursive: true });
  await writeFile(target, content);
}
const urls = Object.keys(pages).filter(path => path !== '404.html').map(path => `${SITE_ORIGIN}/${path === 'index.html' ? '' : path}`);
await writeFile(`${root}dist/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${url}</loc></url>`).join('')}</urlset>\n`);
const robots = await readFile(`${root}public/robots.txt`, 'utf8');
await writeFile(`${root}dist/robots.txt`, `${robots.trim()}\n\nSitemap: ${SITE_ORIGIN}/sitemap.xml\n`);
console.log(`Built ${Object.keys(pages).length} static pages in dist/.`);
