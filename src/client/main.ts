// The browser page: the player's own character simulated here, the world
// from the server, keyboard and touch, drawn as graybox shapes.
// The network layer is src/net/ (docs/mechanisms/network.md).
import { createNetClient } from '../net/client.ts';
import type { Transport, TransportHandlers } from '../net/client.ts';
import { DEFAULT_WORLD } from '../net/protocol.ts';
import type { Input } from '../sim/types.ts';
import { watchKeyboard } from './keyboard.ts';
import { render, VIEW_H, VIEW_W } from './render.ts';
import { report } from './report.ts';
import type { Drawn } from './draw/entities.ts';
import { isTouchDevice, setUpShell } from './shell.ts';
import { watchTouch } from './touch.ts';
import { createAudio } from './audio/index.ts'; // audio hook (Step 8)
import { setUpTune, tuneWanted } from './tune.ts';

const content = __CONTENT__;
const canvas = document.getElementById('game') as HTMLCanvasElement;
canvas.width = VIEW_W;
canvas.height = VIEW_H;
const g = canvas.getContext('2d')!;
g.imageSmoothingEnabled = false;
const statusBox = document.getElementById('status')!;
const statusText = statusBox.querySelector('span')!;

// Storage can be unavailable (private browsing, blocked cookies); the game
// must still run, so every use falls back to memory.
function storage(pick: () => Storage): { get(key: string): string | null; set(key: string, value: string): void } {
  const memory = new Map<string, string>();
  return {
    get(key) {
      try {
        return pick().getItem(key) ?? memory.get(key) ?? null;
      } catch {
        return memory.get(key) ?? null;
      }
    },
    set(key, value) {
      memory.set(key, value);
      try {
        pick().setItem(key, value);
      } catch {
        // remembered for this page only
      }
    },
  };
}
const device = storage(() => localStorage);
const stored = storage(() => sessionStorage);

// INTENT: a reload is still you. Who you are is a random id kept on the
// device (localStorage), sent on joining, so a pull-to-refresh, Safari
// dropping the tab or the page's own reload after a deploy brings the same
// player back. No accounts: it is for friends. DRAFT: two tabs on one device
// are therefore one player; the newer tab takes the character over.
let player = device.get('irreverents.player');
if (!player) {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  player = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  device.set('irreverents.player', player);
}

const worldName = new URLSearchParams(location.search).get('room') || DEFAULT_WORLD;
const builtFrom = document.querySelector('meta[name="build"]')?.getAttribute('content') ?? '';

function connect(handlers: TransportHandlers): Transport {
  const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`);
  ws.onopen = () => handlers.open();
  ws.onmessage = (e) => handlers.message(String(e.data));
  ws.onclose = () => handlers.close();
  ws.onerror = () => handlers.close();
  return {
    send: (text) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(text);
    },
    close: () => ws.close(),
  };
}

const net = createNetClient({
  content,
  player,
  world: worldName,
  now: () => performance.now(),
  connect,
  onWelcome(commit) {
    // INTENT: a deploy restarts the server while people play. When the
    // server we rejoined runs a different commit than the one that served
    // this page, reload ONCE to pick up the new build; the commit we
    // reloaded for is remembered, so a mismatch that will not go away can
    // never become a reload loop.
    if (!builtFrom || builtFrom.startsWith('%') || commit === builtFrom) return;
    if (stored.get('irreverents.reloadedFor') === commit) return;
    // Only once the page itself can be fetched: during a deploy the address
    // answers errors for about a minute, and reloading into one would leave
    // a dead page. If this fails, the next rejoin tries again.
    fetch(location.href, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) return;
        stored.set('irreverents.reloadedFor', commit);
        location.reload();
      })
      .catch(() => {});
  },
});

const keys = watchKeyboard(content, window);
const touchHost = document.getElementById('touch')!;
const touch = watchTouch(content, touchHost);
const hint = document.getElementById('hint')!;
const shell = setUpShell(canvas, touchHost, hint);
// The touch controls appear on a touch screen, or at the first touch on anything else.
if (isTouchDevice()) touchHost.hidden = false;
window.addEventListener('touchstart', () => (touchHost.hidden = false), { passive: true });
// Step 2: the feel dials, only with ?tune in the address (src/client/tune.ts).
if (tuneWanted(location.search)) setUpTune({ content, net, canvas, touchHost });

function readInput(): Input {
  const k = keys();
  const t = touch();
  return {
    x: Math.max(-1, Math.min(1, k.x + t.x)),
    y: Math.max(-1, Math.min(1, k.y + t.y)),
    held: [...new Set([...k.held, ...t.held])].sort(),
  };
}

// INTENT (coming back): a phone that slept, a tab that was hidden, a network
// that changed: each ends with the player back in the world with no reload.
// The socket is dropped and retried at once rather than waiting to notice.
let hiddenAt: number | null = null;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) hiddenAt = performance.now();
  else {
    if (hiddenAt !== null && performance.now() - hiddenAt > content.net.silenceMs) net.kick();
    hiddenAt = null;
  }
});
window.addEventListener('online', () => net.kick());
window.addEventListener('pageshow', (e) => {
  if (e.persisted) net.kick();
});
// A closed or reloaded tab takes its character with it at once.
window.addEventListener('pagehide', () => net.leave());

/**
 * The debug object: `window.irreverents`, read-only by convention. Scripted
 * checks read `drawn`, which the frame loop fills with what it just put on
 * screen; nothing in the game reads it back (docs/mechanisms/network.md).
 */
const debug = {
  content,
  world: net.world,
  player,
  worldName,
  builtFrom,
  net: net.stats,
  drawn: {
    frame: 0,
    room: '',
    camera: { x: 0, y: 0 },
    scale: 1,
    status: '' as string,
    statusText: '',
    touchControls: false,
    upright: false,
    hint: '',
    me: null as Drawn | null,
    entities: [] as Drawn[],
  },
};
(window as unknown as { irreverents: unknown }).irreverents = debug;
const audio = createAudio(content, player); // audio hook (Step 8)

/** DRAFT: how long without a connection before the page reports it. */
const SOCKET_REPORT_MS = 20000;
let offlineSince: number | null = null;
let offlineReported = false;
let frameNo = 0;
function frame(): void {
  const simEvents = net.update(readInput()); // audio hook (Step 8)
  const me = net.me();
  // What this player sees: everyone else as received, their own character
  // last (drawn on top), on this page's clock.
  const seen: Drawn[] = [];
  const camera = render(g, { ...net.world, entities: [...net.others(), me] }, content, me.room, { me: me.id, frame: frameNo, drawn: seen });
  const result = { camera, drawn: seen };
  audio.frame(simEvents, net.latest(), me, net.others()); // audio hook (Step 8)

  const status = net.status();
  // DRAFT: the words. Shown only while not connected; the player can still move.
  const text = status === 'online' ? '' : status === 'reconnecting' ? 'Reconnecting…' : 'Connecting…';
  if (statusText.textContent !== text) statusText.textContent = text;
  statusBox.hidden = text === '';

  // A socket that will not open: after SOCKET_REPORT_MS without one, with
  // the page in view, say so once per outage (it reaches the server only
  // if plain requests still get through, which is the case worth knowing).
  if (status === 'online' || document.hidden) offlineSince = null;
  else if (offlineSince === null) {
    offlineSince = performance.now();
    offlineReported = false;
  } else if (!offlineReported && performance.now() - offlineSince > SOCKET_REPORT_MS) {
    offlineReported = true;
    report('socket', `no connection for ${SOCKET_REPORT_MS / 1000} s: ${status}, after ${net.stats.connects} connection(s), navigator.onLine ${navigator.onLine}`);
  }

  const d = debug.drawn;
  d.frame = ++frameNo;
  d.room = me.room;
  d.camera = result.camera;
  d.scale = shell.layout().scale;
  d.upright = shell.layout().upright;
  d.hint = hint.hidden ? '' : (hint.querySelector('span')?.textContent ?? '');
  d.status = status;
  d.statusText = text;
  d.touchControls = !touchHost.hidden;
  d.entities = result.drawn;
  d.me = result.drawn.find((e) => e.mine) ?? null;
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
