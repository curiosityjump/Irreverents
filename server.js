// DRAFT: deploy probe, written by the orchestrator on its first run to measure
// one thing: does a push to main reach https://irreverents-production.up.railway.app ?
// It is not the game and not the architecture. Plan Step 1 replaces this file;
// keep only the two things it proves are needed: listen on process.env.PORT on
// 0.0.0.0, and answer /healthz with the deployed commit so a session can tell
// which push is live without Railway's logs.
const http = require('node:http');

const commit = process.env.RAILWAY_GIT_COMMIT_SHA || 'unknown';
const startedAt = new Date().toISOString();

const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Irreverents</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#1b1b2f;color:#f4f1de;font:16px/1.5 system-ui,sans-serif;text-align:center;padding:16px}small{opacity:.6}</style>
</head><body><main><h1>Irreverents</h1>
<p>The build crew is working through the night.<br>This page is a deploy check and will become the game.</p>
<small>commit ${commit.slice(0, 7)} &middot; up since ${startedAt}</small></main></body></html>`;

http
  .createServer((req, res) => {
    if (req.url === '/healthz') {
      res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
      res.end(JSON.stringify({ ok: true, commit, startedAt }));
      return;
    }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    res.end(page);
  })
  .listen(Number(process.env.PORT) || 3000, '0.0.0.0');
