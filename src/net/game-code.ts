// Step 17 (docs/mechanisms/saves.md): what a kept game's code is. Pure, so
// the page (src/client/start.ts) and the server (src/server/saves.ts) use
// the one definition.

/**
 * The letters a game code is made of: no I, L or O, which are misread for 1
 * and 0. INTENT: an id contract (CLAUDE.md, "Don't rename or remove ids once
 * deployed"): every saved game on the volume is filed under its code
 * (`save-<code>`) and every shared link carries one (`?game=CODE`), so a
 * letter taken out orphans games and breaks links. Adding letters (or a
 * longer code for new games only) is the additive way to change it.
 */
export const GAME_LETTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ';
/** How many letters a code has (23^4, about 280,000 codes). INTENT: as GAME_LETTERS: saved games and shared links depend on it. */
export const GAME_CODE_LENGTH = 4;
/** A game's world name is this followed by its code (`game-ABCD`). INTENT: an id once deployed; never rename it. */
export const GAME_PREFIX = 'game-';

const CODE = new RegExp(`^[${GAME_LETTERS}]{${GAME_CODE_LENGTH}}$`);

/** Whether a string is a well-formed game code (upper case). */
export function isGameCode(code: string): boolean {
  return CODE.test(code);
}

/** The code of a game's world name, or null when the name is not a game's (`main`, `?room=` worlds). */
export function gameCode(worldName: string): string | null {
  if (!worldName.startsWith(GAME_PREFIX)) return null;
  const code = worldName.slice(GAME_PREFIX.length);
  return isGameCode(code) ? code : null;
}

/** A new code; `random` gives numbers in [0, 1) (the page passes its own). */
export function makeGameCode(random: () => number): string {
  let code = '';
  for (let i = 0; i < GAME_CODE_LENGTH; i++) code += GAME_LETTERS[Math.floor(random() * GAME_LETTERS.length) % GAME_LETTERS.length];
  return code;
}

/** What a typed code becomes: upper case, only the code's letters, at most GAME_CODE_LENGTH. */
export function cleanGameCode(typed: string): string {
  return [...typed.toUpperCase()].filter((ch) => GAME_LETTERS.includes(ch)).join('').slice(0, GAME_CODE_LENGTH);
}

/**
 * The code in whatever was typed or pasted into the code field: a shared
 * link's `game=XXXX`; else, in text with spaces or punctuation (the share
 * message "Join my game: ABCD"), its last word that is a whole code; else
 * the letters as typed (cleanGameCode), so "ab cd" is ABCD.
 */
export function codeFromText(text: string): string {
  const linked = /[?&]game=([A-Za-z]+)/.exec(text);
  if (linked) return cleanGameCode(linked[1]!);
  if (/[^A-Za-z]/.test(text.trim())) {
    const words = text.split(/[^A-Za-z]+/).map((w) => w.toUpperCase()).filter((w) => w.length === GAME_CODE_LENGTH && isGameCode(w));
    if (words.length > 0) return words[words.length - 1]!;
  }
  return cleanGameCode(text);
}
