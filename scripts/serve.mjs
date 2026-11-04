import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../dist/', import.meta.url)).replace(/[\\/]$/, '');
const port = Number(process.env.PORT || 3000);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.ico': 'image/vnd.microsoft.icon', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.xml': 'application/xml', '.txt': 'text/plain' };
const server = http.createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { 'Content-Type':'application/json', Allow:'GET, HEAD' }).end(JSON.stringify({error:'This website serves static files only. Forms submit directly to their configured form service.'})); return; }
    const url = new URL(request.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
    const info = await stat(file);
    if (!info.isFile()) throw new Error('Not a file');
    const body = request.method === 'HEAD' ? undefined : await readFile(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Content-Length': info.size, 'Cache-Control':'no-cache', 'X-Content-Type-Options':'nosniff' });
    response.end(body);
  } catch {
    const body = request.method === 'HEAD' ? undefined : await readFile(resolve(root, '404.html')).catch(() => 'Page not found');
    response.writeHead(404, { 'Content-Type':'text/html; charset=utf-8' });
    response.end(body);
  }
});
server.listen(port, '0.0.0.0', () => console.log(`PRESSZILA website listening on port ${port}`));
