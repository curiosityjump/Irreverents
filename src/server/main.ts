// The one server process: serves the built client (dist/public), answers
// /healthz, and holds the WebSocket endpoint at /ws.
// Layout and rules: docs/architecture.md.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { WebSocketServer } from 'ws';

// INTENT: /healthz keeps exactly these three field names (ok, commit,
// startedAt). docs/measures.md M1 reads them to tell which push is live;
// nobody can read Railway's logs, so this is the only deploy evidence.
const commit = process.env.RAILWAY_GIT_COMMIT_SHA || 'unknown';
const startedAt = new Date().toISOString();

// The bundle is dist/server.cjs and the client is dist/public, so the public
// directory is found relative to the running file, never the working directory.
const publicDir = path.join(path.dirname(path.resolve(process.argv[1] ?? '.')), 'public');

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.map': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
};

function send(res: http.ServerResponse, status: number, type: string, body: string | Buffer): void {
  // DRAFT: nothing is cached, so a deploy is visible on the next reload.
  // Reconsider (hashed file names + long cache) when assets get heavy.
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://x');
  if (url.pathname === '/healthz') {
    send(res, 200, 'application/json', JSON.stringify({ ok: true, commit, startedAt }));
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, 'text/plain; charset=utf-8', 'method not allowed');
    return;
  }
  let rel: string;
  try {
    rel = decodeURIComponent(url.pathname);
  } catch {
    send(res, 400, 'text/plain; charset=utf-8', 'bad request');
    return;
  }
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(publicDir, rel);
  if (file !== publicDir && !file.startsWith(publicDir + path.sep)) {
    send(res, 404, 'text/plain; charset=utf-8', 'not found');
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      send(res, 404, 'text/plain; charset=utf-8', 'not found');
      return;
    }
    send(res, 200, MIME[path.extname(file)] ?? 'application/octet-stream', data);
  });
});

// DRAFT: a hello and an echo only. Step 1 Gate 2 owns the real protocol;
// the echo is what the lead's live WebSocket measurement used.
const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (sock) => {
  sock.send(JSON.stringify({ type: 'hello', commit, startedAt }));
  sock.on('message', (data) => sock.send(`echo:${data.toString()}`));
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`irreverents listening on 0.0.0.0:${port} commit=${commit}`);
});
