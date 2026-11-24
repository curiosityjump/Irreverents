// The browser page: the player's own character simulated here, the world
// from the server, keyboard and touch, drawn as graybox shapes.
// The network layer is src/net/ (docs/mechanisms/network.md).
import { createNetClient } from '../net/client.ts';
import type { NetClient, Transport, TransportHandlers } from '../net/client.ts';
import type { Input } from '../sim/types.ts';
import { watchKeyboard } from './keyboard.ts';
import { render, VIEW_H, VIEW_W, view } from './render.ts';
import { report } from './report.ts';
import type { Drawn } from './draw/entities.ts';
import { isTouchDevice, setUpShell } from './shell.ts';
import { watchTouch } from './touch.ts';
import { showUsePrompt, usePrompt } from './use-prompt.ts';
import { idleActions, showIdle } from './button-idle.ts';
import { createAudio } from './audio/index.ts'; // audio hook (Step 8)
import { setUpTune, tuneWanted } from './tune.ts';
import { takeWords } from './draw/fx.ts';
import { drawnSignalers } from './draw/outpost.ts';
import { drawnCantina } from './draw/cantina.ts';
import { drawnLevels } from './draw/levels.ts';
import { drawnCompletion, levelPieces } from './draw/completion.ts';
import { drawnBanner } from './draw/banner.ts';
import { drawnHud } from './draw/hud.ts';
import { drawnSight, watchSightEvents } from './draw/sight.ts';
import { drawnHeist, watchHeistEvents } from './draw/heist.ts';
import { drawnAlarms, watchAlarmEvents } from './draw/alarm-banner.ts';
import { drawnCondition, setViewerCopy, watchDefeatEvents } from './draw/condition.ts';
import { drawnHall, watchHallEvents } from './draw/hall.ts';
import { drawnRecruits, noteRecruits } from './draw/recruits.ts';
import { drawnParts, setHeardRooms } from './draw/room-parts.ts';
import { drawnPowers, foundSourceIcons } from './draw/powers.ts';
import { drawnWeapons } from './draw/weapons.ts';
import { drawnBeaten, watchBeatenEvents } from './draw/beaten.ts';
import { levelProgress } from '../sim/levels.ts';
import { stageBest } from '../sim/stage.ts';
import { setUpMenu, showGone, showStart } from './start.ts';
import type { StartRecord } from './start.ts';

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
const player: string = device.get('irreverents.player') || newPlayer();
function newPlayer(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const id = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  device.set('irreverents.player', id);
  return id;
}

const params = new URLSearchParams(location.search);
// Step 17 hardening: read once at load, before the start screen rewrites the address (it keeps `tune`, but play must not depend on that).
const tuneAtLoad = tuneWanted(location.search);
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

/**
 * The debug object: `window.irreverents`, read-only by convention. Scripted
 * checks read `drawn`, which the frame loop fills with what it just put on
 * screen; nothing in the game reads it back (docs/mechanisms/network.md).
 */
const debug = {
  content,
  /** Set when play starts (Step 17: after the start screen). */
  world: null as unknown as NetClient['world'],
  player,
  worldName: '',
  builtFrom,
  net: null as unknown as NetClient['stats'],
  /** Step 17: what the start screen shows (src/client/start.ts); absent in a `?room=` world. */
  start: undefined as StartRecord | undefined,
  /** The view (render.ts): scripted checks read it, and the clearance fact's control sets `reserve` to 0 to watch it fail. */
  view,
  /** The switch gap: this page's own refused switches so far, and the last reason ("none-free", "no-fit"), from its local step's `switch-refused` events. */
  switchRefused: { count: 0, reason: '' },
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
    /** Step 12: the outposts' horn posts this frame drew, and in which state (src/client/draw/outpost.ts). */
    signalers: [] as ReturnType<typeof drawnSignalers>,
    /** Step 2, signal 6: every string drawn into the game picture this frame (draw/fx.ts, takeWords); the tuning panel and the page shell are HTML, not in it. */
    words: [] as string[],
    /** Step 5: the impacts drawn this frame (dust, star, shake read them): which body, its tick and age on this page's clock, whether in its held beat, whether the page predicted it. */
    impacts: [] as { id: string; tick: number; age: number; beat: boolean; predicted: boolean }[],
    /** Step 11: the open party row's chips and the brawl's counter, as drawn (src/client/draw/cantina.ts); the row in CSS pixels of the page, so a check can tap it. */
    /** Step 14 slice A: the level entrances this frame drew (art, name or none, pie) and the banner's name, if one is up (src/client/draw/levels.ts). */
    levels: { entrances: [], banner: null } as ReturnType<typeof drawnLevels>,
    /** Step 14 slice B: the pieces' glints this frame drew, the found row while it shows, and pieces popping (src/client/draw/completion.ts). */
    completion: { glints: [], row: null, pops: [], place: null } as ReturnType<typeof drawnCompletion>,
    /** Step 19: the party plate (faces, the viewer's slots) and the banner up, if any (src/client/draw/hud.ts, banner.ts). */
    hud: null as ReturnType<typeof drawnHud>,
    /** Step 9: the carriers drawn with their orb, the loose orbs and the glowing holders this frame (src/client/draw/powers.ts). */
    powers: { carriers: [], orbs: [], holders: [], sources: [] } as ReturnType<typeof drawnPowers>,
    /** Step 23: the loose weapons (and which glows) and the weapons in hand this frame (src/client/draw/weapons.ts). */
    weapons: { loose: [], held: [] } as ReturnType<typeof drawnWeapons>,
    /** Step 5: defeated bad guys' poofs this frame, every one this page was told went, and who is drawn dazed (src/client/draw/beaten.ts). */
    beaten: { poofs: [], gone: [], dazed: [] } as ReturnType<typeof drawnBeaten>,
    banner: null as ReturnType<typeof drawnBanner>,
    /** Step 19: each person's sight band this frame drew (facing, box, lit cells) and the unseen marks up (src/client/draw/sight.ts). */
    sight: null as ReturnType<typeof drawnSight> | null,
    /** Step 19: the clean getaways this page announced (src/client/draw/heist.ts). */
    heist: null as ReturnType<typeof drawnHeist> | null,
    /** The alarm banners this page queued (src/client/draw/alarm-banner.ts). */
    alarms: [] as string[],
    condition: null as ReturnType<typeof drawnCondition> | null,
    /** Step 7: the legends this page has announced by banner (src/client/draw/hall.ts). */
    hall: null as ReturnType<typeof drawnHall> | null,
    /** Step 13: the cages this frame drew in this room and the captives' calls (src/client/draw/recruits.ts). */
    recruits: { cages: [], calls: [], flash: null } as ReturnType<typeof drawnRecruits>,
    /** Step 3 (the stone plate): the plates and gates this frame drew in this room, down/open and how far a weighted plate sank (src/client/draw/room-parts.ts). */
    parts: [] as ReturnType<typeof drawnParts>,
    cantina: null as { row: { kind: string; slot: number; x: number; y: number; w: number; h: number; taken: boolean }[] | null; counter: { player: string; ko: number; falls: number }[] | null } | null,
  },
};
(window as unknown as { irreverents: unknown }).irreverents = debug;
const audio = createAudio(content, player); // audio hook (Step 8)

/** Joins `worldName` and plays: everything that needs the world (Step 17: called once the world is chosen). */
function play(worldName: string): void {
  debug.worldName = worldName;
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
    // Step 17: the server set this world aside; say why and offer the way back.
    onGone: (why) => showGone({ content, why, tab: stored }),
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
  if (tuneAtLoad) setUpTune({ content, net, canvas, touchHost });

  // Step 11 (docs/mechanisms/cantina.md): a tap on the game view itself, not
  // on the pad or a button (they sit over it and take their own touches). It
  // rides in every input for TAP_MS, numbered, so the server acts on it once
  // however many ticks carry it. Room pixels; or the party slot when it lands
  // on the open party row's chip (draw/cantina.ts says where it drew them).
  // DRAFT: TAP_MS; the count starts anywhere, so a reloaded page's first tap
  // is never mistaken for the last one the server saw.
  const TAP_MS = 300;
  let tapN = Math.floor(Math.random() * 1e6);
  let tap: { at: number; tap: NonNullable<Input['tap']> } | null = null;
  let lastCamera = { x: 0, y: 0 };
  canvas.addEventListener('pointerdown', (e) => {
    const r = canvas.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    const gx = ((e.clientX - r.left) * canvas.width) / r.width;
    const gy = ((e.clientY - r.top) * canvas.height) / r.height;
    const chip = drawnCantina().row?.find((c) => gx >= c.x && gx < c.x + c.w && gy >= c.y && gy < c.y + c.h);
    tapN++;
    tap = { at: performance.now(), tap: chip ? { x: 0, y: 0, n: tapN, slot: chip.slot } : { x: gx + lastCamera.x, y: gy + lastCamera.y, n: tapN } };
  });

  function readInput(): Input {
    const k = keys();
    const t = touch();
    const input: Input = {
      x: Math.max(-1, Math.min(1, k.x + t.x)),
      y: Math.max(-1, Math.min(1, k.y + t.y)),
      held: [...new Set([...k.held, ...t.held])].sort(),
    };
    if (tap && performance.now() - tap.at > TAP_MS) tap = null;
    if (tap) input.tap = tap.tap;
    return input;
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

  debug.world = net.world;
  debug.net = net.stats;

  /** DRAFT: how long without a connection before the page reports it. */
  const SOCKET_REPORT_MS = 20000;
  let offlineSince: number | null = null;
  let offlineReported = false;
  let frameNo = 0;
  function frame(): void {
    const simEvents = net.update(readInput()); // audio hook (Step 8)
    for (const ev of simEvents) if (ev.type === 'switch-refused') debug.switchRefused = { count: debug.switchRefused.count + 1, reason: ev.reason };
    const me = net.me();
    // What this player sees: everyone else as received, their own character
    // last (drawn on top), on this page's clock.
    const seen: Drawn[] = [];
    const drawnBodies = [...net.others(), me];
    const shown = { ...net.world, entities: drawnBodies };
    watchSightEvents(net.latest(), frameNo); // Step 19: an unseen deed's mark (draw/sight.ts)
    watchHeistEvents(net.latest()); // Step 19: a clean getaway's banner (draw/heist.ts)
    watchAlarmEvents(content, net.latest(), me.room); // the owner's 2026-11-24 report: a finished horn and what it brings are announced (draw/alarm-banner.ts)
    setViewerCopy(net.serverMe(), net.latest().tick); // Step 21: the condition slot reads the server's copy (draw/condition.ts)
    watchDefeatEvents(content, me.id, net.latest()); // Step 21: thrown out, a prize back (draw/condition.ts)
    watchBeatenEvents(net.latest(), frameNo); // Step 5: a defeated bad guy's poof (draw/beaten.ts)
    watchHallEvents(net.latest()); // Step 7: a new legend's banner, wherever this page is (draw/hall.ts)
    setHeardRooms(net.heardRooms()); // Step 3: plates drawn from the server's copy too (draw/room-parts.ts, plateAsDrawn)
    const camera = render(g, shown, content, me.room, { me: me.id, frame: frameNo, drawn: seen });
    const result = { camera, drawn: seen };
    lastCamera = camera;
    const usePrompted = usePrompt(content, shown, me);
    showUsePrompt(touchHost, usePrompted); // Step 19: the Use button names what a press does here (use-prompt.ts)
    showIdle(touchHost, idleActions(content, shown, me, usePrompted !== null)); // a button that would do nothing is dimmed (button-idle.ts)
    audio.frame(simEvents, net.latest(), me, net.others()); // audio hook (Step 8)
    noteRecruits(content, net.latest().events, frameNo); // Step 13: a rescue anywhere in this world: a banner and the new face

    const status = net.status();
    // DRAFT: the words. Shown only while not connected; the player can still move.
    const text = status === 'online' || status === 'gone' ? '' : status === 'reconnecting' ? 'Reconnecting…' : 'Connecting…';
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
    d.signalers = drawnSignalers();
    d.levels = drawnLevels();
    d.completion = drawnCompletion();
    d.hud = drawnHud();
    d.powers = drawnPowers();
    d.weapons = drawnWeapons();
    d.beaten = drawnBeaten();
    d.banner = drawnBanner();
    d.sight = drawnSight();
    d.heist = drawnHeist();
    d.alarms = drawnAlarms();
    d.condition = drawnCondition();
    d.hall = drawnHall();
    d.recruits = drawnRecruits();
    d.parts = drawnParts();
    d.words = takeWords();
    // Step 5 (docs/mechanisms/network.md, "Predicted hits"): each impact this frame drew from, on this page's clock.
    d.impacts = drawnBodies.filter((e) => e.c.impact && e.room === me.room).map((e) => ({ id: e.id, tick: e.c.impact!.tick, age: net.world.tick - e.c.impact!.tick, beat: !!e.c.beat, predicted: !!e.c.predicted }));
    {
      const c = drawnCantina();
      const r = canvas.getBoundingClientRect();
      const sx = r.width / canvas.width;
      const sy = r.height / canvas.height;
      d.cantina = c.row || c.counter ? { row: c.row?.map((ch) => ({ ...ch, x: r.left + ch.x * sx, y: r.top + ch.y * sy, w: ch.w * sx, h: ch.h * sy })) ?? null, counter: c.counter } : null;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  // Step 17: the way back to the start screen (and a game's code and Share).
  setUpMenu({
    content,
    worldName,
    tab: stored,
    leave: () => net.leave(),
    // Step 14 slice A: a row per discovered level in the menu (src/client/start.ts).
    levels: () => Object.values(content.levels ?? {}).flatMap((l) => {
      const p = levelProgress(net.world, content, l.id);
      // Step 14 slice B: and its pieces, grey with the found ones gold.
      const pieces = levelPieces(net.world, content, l.id);
      // Step 9: a lit mark (the power's icon) per power source found in this level (world.sources).
      const sources = foundSourceIcons(net.world, content, l.rooms);
      // Step 22 push 3: a stage's best clear (stars and time), once there is one.
      const best = stageBest(net.world, content, l.id);
      return p.discovered ? [{ id: l.id, name: l.name, quarters: p.quarters, ...(pieces ? { pieces } : {}), ...(sources.length ? { sources } : {}), ...(best ? { best } : {}) }] : [];
    }),
  });
}

// INTENT: `?room=<name>` skips the start screen entirely and joins at once,
// exactly as before Step 17: `npm run e2e`, `check:live` and every scripted
// check join `?room=check-…` and must never see a start screen.
const room = params.get('room');
if (room) play(room);
else debug.start = showStart({ content, params, device, tab: stored, play });
