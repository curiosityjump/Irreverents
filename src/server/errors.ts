// What goes wrong in a player's browser, kept where a session can read it.
// Nobody here can run Safari on an iPhone, so the page reports its own
// trouble (src/client/index.html, the first script) and GET /debug/errors
// lists the newest reports (docs/mechanisms/network.md, "What goes wrong on
// a real iPhone").
//
// INTENT: no personal data. A report is the error, the page's build, the
// screen and the browser's user-agent string, and nothing else: no player
// id, no name, no room, no address. Only the fields named here are kept,
// whatever a page sends, and the sender's address is never read.
// INTENT: in memory only, never on the volume: it is a debugging aid that a
// restart may empty.

export interface ErrorReport {
  /** When the server received it. */
  at: string;
  /** error, rejection, load (a script or image that failed to load) or socket. */
  kind: string;
  message: string;
  stack: string;
  /** The commit that served the page (`<meta name="build">`). */
  build: string;
  screen: { w: number; h: number; dpr: number };
  upright: boolean;
  ua: string;
}

/** DRAFT: how many are kept, how large a body may be, and how many are taken per minute from everyone together. */
export const ERRORS_KEPT = 200;
export const ERROR_BODY_MAX = 4096;
const PER_MINUTE = 120;

const text = (v: unknown, max: number): string => (typeof v === 'string' ? v.slice(0, max) : '');
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v * 100) / 100 : 0);

export interface ErrorLog {
  /** Takes one report body as sent; false when it was not kept. */
  add(body: string): boolean;
  list(): ErrorReport[];
  /** How many were received since the server started (the list holds the newest ERRORS_KEPT). */
  count(): number;
}

export function createErrorLog(now: () => number = Date.now): ErrorLog {
  const kept: ErrorReport[] = [];
  let total = 0;
  let windowStart = 0;
  let inWindow = 0;
  return {
    add(body) {
      const t = now();
      if (t - windowStart >= 60000) {
        windowStart = t;
        inWindow = 0;
      }
      // A page in a loop, or anyone posting junk, cannot flood it.
      if (++inWindow > PER_MINUTE) return false;
      let raw: unknown;
      try {
        raw = JSON.parse(body.slice(0, ERROR_BODY_MAX));
      } catch {
        return false;
      }
      if (typeof raw !== 'object' || raw === null) return false;
      const o = raw as Record<string, unknown>;
      const s = (typeof o.screen === 'object' && o.screen !== null ? o.screen : {}) as Record<string, unknown>;
      const message = text(o.message, 500);
      if (!message) return false;
      kept.push({
        at: new Date(t).toISOString(),
        kind: text(o.kind, 20),
        message,
        stack: text(o.stack, 1500),
        build: text(o.build, 64),
        screen: { w: num(s.w), h: num(s.h), dpr: num(s.dpr) },
        upright: o.upright === true,
        ua: text(o.ua, 300),
      });
      if (kept.length > ERRORS_KEPT) kept.shift();
      total++;
      return true;
    },
    list: () => kept.slice(),
    count: () => total,
  };
}
