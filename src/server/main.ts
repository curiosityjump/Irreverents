// The one server process: serves the built client (dist/public), answers
// /healthz, and holds the WebSocket endpoint at /ws.
// Layout and rules: docs/architecture.md.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createErrorLog, ERROR_BODY_MAX, ERRORS_KEPT } from './errors.ts';
import { attachGame } from './game.ts';
import type { Game } from './game.ts';
import { isGameCode } from './saves.ts';
import { openStore } from './store.ts';

// INTENT: /healthz keeps exactly these three field names (ok, commit,
// startedAt). docs/measures.md M1 reads them to tell which push is live;
// nobody can read Railway's logs, so this is the only deploy evidence.
const commit = process.env.RAILWAY_GIT_COMMIT_SHA || 'unknown';
const startedAt = new Date().toISOString();

/**
 * Whether Railway has mounted lasting storage (a volume), and whether the
 * server can write to it. Reported in /healthz so no session has to ask the
 * owner whether they added one (docs/plan/step-1.md, "What's decided").
 *
 * INTENT: `mounted` is true only for a real attached volume: Railway sets
 * both RAILWAY_VOLUME_MOUNT_PATH and RAILWAY_VOLUME_NAME itself, and the
 * path sits on a different device than "/". A variable typed in by hand
 * (`variableSet` true, `mounted` false) must not read as storage: files
 * written there would vanish on the next deploy.
 * The raw facts are each their own field too (variableSet + path, nameSet +
 * name, writable, differentDevice), so a reader can judge for themselves.
 * Step 17: the store (below) keeps saved games there; Step 7's Hall
 * records will be its second user.
 */
function storageStatus(): {
  mounted: boolean;
  writable: boolean;
  variableSet: boolean;
  path: string | null;
  nameSet: boolean;
  name: string | null;
  differentDevice: boolean;
} {
  const dir = process.env.RAILWAY_VOLUME_MOUNT_PATH || null;
  const name = process.env.RAILWAY_VOLUME_NAME || null;
  const status = { mounted: false, writable: false, variableSet: dir !== null, path: dir, nameSet: name !== null, name, differentDevice: false };
  if (!dir) return status;
  try {
    status.differentDevice = fs.statSync(dir).dev !== fs.statSync('/').dev;
  } catch {
    status.differentDevice = false;
  }
  status.mounted = status.nameSet && status.differentDevice;
  try {
    const probe = path.join(dir, `.write-check-${process.pid}`);
    fs.writeFileSync(probe, startedAt);
    fs.rmSync(probe);
    status.writable = true;
  } catch {
    status.writable = false;
  }
  return status;
}
// Checked once at start: Railway mounts a volume when the server starts.
const storage = storageStatus();
// INTENT: the directory is Railway's own mount path, and only when it is
// a real attached volume. Never a hard-coded "/data". (Step 7 adds the
// Hall's collection to this same store: src/server/store.ts, the comment at the top.)
const store = openStore(storage.mounted ? storage.path : null);
const storeSummary = (): { lasting: boolean; dir: string | null; problems: string[]; saves: number } => {
  const s = store.status();
  return { lasting: s.lasting, dir: s.dir, problems: s.problems, saves: game?.savedGames() ?? 0 };
};

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

let game: Game | null = null;
const errorLog = createErrorLog();
const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://x');
  if (url.pathname === '/healthz') {
    // `errors`: how many lines /debug/errors received since the start: pages' reports and, since Step 17, the server's own (kind `server`).
    // `store` (Step 17): whether records last, where, any problem, and how many games are saved;
    // INTENT: counts only, never the game codes (a code is how anyone joins a game).
    // `store` (Step 17, additive): what the store keeps and anything that went wrong with it.
    send(res, 200, 'application/json', JSON.stringify({ ok: true, commit, startedAt, storage, store: storeSummary(), ...game?.counts(), errors: errorLog.count() }));
    return;
  }
  // Step 17: "does game CODE exist?", for the start screen's Join a friend.
  // DRAFT: answers only that; anyone may ask (friends, no accounts).
  if (url.pathname.startsWith('/game/') && req.method === 'GET') {
    const code = url.pathname.slice('/game/'.length).toUpperCase();
    send(res, 200, 'application/json', JSON.stringify({ code, valid: isGameCode(code), exists: !!game?.gameExists(code), savedAt: game?.gameSavedAt(code) ?? null }));
    return;
  }
  if (url.pathname === '/debug/errors') {
    // What went wrong in players' browsers (src/server/errors.ts): a page
    // POSTs a report, anyone GETs the newest ones. No personal data in them.
    if (req.method === 'POST') {
      let body = '';
      let over = false;
      req.setEncoding('utf8');
      req.on('data', (chunk: string) => {
        // Bodies are cut, never buffered without limit.
        if (body.length + chunk.length > ERROR_BODY_MAX) over = true;
        if (!over) body += chunk;
      });
      req.on('end', () => {
        const kept = !over && errorLog.add(body);
        send(res, kept ? 204 : 400, 'text/plain; charset=utf-8', '');
      });
      req.on('error', () => {});
      return;
    }
    send(res, 200, 'application/json', JSON.stringify({ commit, startedAt, received: errorLog.count(), kept: ERRORS_KEPT, errors: errorLog.list() }, null, 1));
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
    // The page learns which commit served it, so that after a deploy it can
    // tell it is talking to a newer server and reload once (src/client/main.ts).
    if (path.basename(file) === 'index.html') {
      send(res, 200, MIME['.html']!, data.toString('utf8').replace('%COMMIT%', commit));
      return;
    }
    send(res, 200, MIME[path.extname(file)] ?? 'application/octet-stream', data);
  });
});

// The network layer (docs/mechanisms/network.md). /healthz adds its counts
// (worlds, players) beside the fields above; additive.
// Step 22 (additive): IRREVERENTS_CHECK_HOOKS is set only by scripts/e2e.ts's own server, never on Railway (GameOptions.checkHooks).
game = attachGame(server, { content: __CONTENT__, commit, startedAt, store, problem: (m) => errorLog.note(m), checkHooks: process.env.IRREVERENTS_CHECK_HOOKS === '1' });

// Step 17: a deploy stops this process (SIGTERM) before the new one starts:
// every game being played is saved first, so nothing since the last
// 30-second save is lost. Then the process ends as it would have.
// INTENT: the signal must reach THIS process: package.json's start script
// `exec`s node, so `npm start` -> sh -> node becomes npm -> node, and npm
// passes SIGTERM on. Without `exec` the shell kept it and nothing was
// saved (scripts/checks/step17-stop-save.ts proves it, and reads the line below).
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => {
    try {
      const n = game?.saveAll() ?? 0;
      console.log(`irreverents stopping on ${signal}: saved ${n} kept game(s)`);
    } finally {
      process.exit(0);
    }
  });
}

const port = Number(process.env.PORT) || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`irreverents listening on 0.0.0.0:${port} commit=${commit}`);
});
