import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root = resolve('dist');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json' };
createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end('Forms are available on the Netlify deployment.'); return; }
  try {
    const path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (path !== root && !path.startsWith(root + '/')) throw new Error('Invalid path');
    const file = (await stat(path)).isDirectory() ? resolve(path, 'index.html') : path;
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(req.method === 'HEAD' ? '' : body);
  } catch { res.writeHead(404, { 'Content-Type': 'text/html' }); res.end(await readFile(resolve(root, '404.html')).catch(() => 'Not found')); }
}).listen(4173, '127.0.0.1', () => console.log('MooseTVs preview: http://127.0.0.1:4173'));
