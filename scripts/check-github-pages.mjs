// Check that local links stay within a GitHub project path and resolve on disk.
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = resolve('github-pages');
const base = 'https://example.github.io/presszila/';
const issues = [];
async function list(directory) {
  return (await Promise.all((await readdir(directory, { withFileTypes:true })).map(entry => entry.isDirectory() ? list(join(directory,entry.name)) : join(directory,entry.name)))).flat();
}
const files = (await list(root)).filter(file => file.endsWith('.html'));
let links = 0;
for (const file of files) {
  const page = file.slice(root.length + 1).replaceAll('\\','/');
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const value = match[1].replaceAll('&amp;','&');
    if (/^(?:https?:|mailto:|tel:|data:)/.test(value)) continue;
    const url = new URL(value, base + page);
    if (url.origin !== 'https://example.github.io' || !url.pathname.startsWith('/presszila/')) { issues.push(`${page}: link leaves the repository path: ${value}`); continue; }
    let path = decodeURIComponent(url.pathname.slice('/presszila/'.length));
    if (!path || path.endsWith('/')) path += 'index.html';
    const target = join(root, path);
    links++;
    try {
      if (!(await stat(target)).isFile()) throw new Error('not a file');
      if (url.hash && path.endsWith('.html')) {
        const linked = await readFile(target, 'utf8');
        if (!linked.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)) issues.push(`${page}: missing anchor ${value}`);
      }
    } catch { issues.push(`${page}: missing page or asset ${value}`); }
  }
  if (!html.includes('https://presszila.com/')) issues.push(`${page}: missing the intended custom domain`);
}
const css = await readFile(join(root,'assets/css/style.css'),'utf8');
for (const match of css.matchAll(/url\("([^"\)]+)"\)/g)) {
  const url = new URL(match[1], base + 'assets/css/style.css');
  if (!url.pathname.startsWith('/presszila/')) { issues.push(`CSS asset leaves the repository path: ${match[1]}`); continue; }
  try { await stat(join(root,decodeURIComponent(url.pathname.slice('/presszila/'.length)))); }
  catch { issues.push(`Missing CSS asset: ${match[1]}`); }
}
try { await stat(join(root,'.nojekyll')); } catch { issues.push('Missing .nojekyll'); }
if (issues.length) { console.error(issues.join('\n')); process.exitCode = 1; }
else console.log(`Checked ${files.length} GitHub Pages pages and ${links} portable local links/assets under a project path.`);
