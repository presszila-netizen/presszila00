// Create portable static files for a GitHub Pages project path or custom domain.
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const input = resolve(root, 'dist');
const output = resolve(root, 'github-pages');
await rm(output, { recursive:true, force:true });
await mkdir(output, { recursive:true });
await cp(input, output, { recursive:true });

async function transform(directory) {
  for (const entry of await readdir(directory, { withFileTypes:true })) {
    const target = join(directory, entry.name);
    if (entry.isDirectory()) { await transform(target); continue; }
    if (!entry.name.endsWith('.html')) continue;
    const path = relative(output, target);
    const depth = path.split(sep).length - 1;
    const prefix = '../'.repeat(depth);
    const html = await readFile(target, 'utf8');
    const portable = html.replace(/\b(href|src)="\/(?!\/)([^"]*)"/g, (_, attribute, destination) => `${attribute}="${prefix + destination || './'}"`);
    await writeFile(target, portable);
  }
}
await transform(output);

const stylesheet = join(output, 'assets/css/style.css');
const css = await readFile(stylesheet, 'utf8');
if (!css.includes('url("/assets/fonts/')) throw new Error('Expected the locally hosted font references in the stylesheet.');
await writeFile(stylesheet, css.replaceAll('url("/assets/fonts/', 'url("../fonts/'));
await writeFile(join(output, '.nojekyll'), '');
await cp(join(root, 'GITHUB-PAGES.md'), join(output, 'GITHUB-PAGES.md'));
console.log('Built portable static GitHub Pages files in github-pages/.');
