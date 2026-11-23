import { describe } from '../reader.ts';
import type { ContentKind } from '../types.ts';

/**
 * content/prompts.json (Step 19): the word the phone's Use button shows for
 * what a press would do here, by Use entry (src/sim/use/<entry>.ts) then
 * the answer's word key (src/sim/use.ts, `UseAnswer.word`): a thing's deed,
 * "go-in", "ring". Read by src/client/use-prompt.ts.
 * DRAFT: the words (decisions-log "Step 19"); a later Use entry adds a row.
 */
export interface Prompts {
  words: Record<string, Record<string, string>>;
}

declare module '../types.ts' {
  interface Content {
    prompts: Prompts;
  }
}

/** DRAFT: the longest word that fits the thumb-sized button at its smallest. */
export const MAX_PROMPT = 8;

const kind: ContentKind = {
  id: 'prompts',
  source: { file: 'prompts.json' },
  parse(raw, read) {
    const out: Prompts = { words: {} };
    const o = read.object(raw, '');
    if (!o) return out;
    read.only(o, ['words'], '');
    const words = read.object(o.words, 'words');
    if (!words) return out;
    for (const [entry, row] of Object.entries(words)) {
      if (entry === '//') continue;
      const r = read.object(row, `words.${entry}`);
      if (!r) continue;
      out.words[entry] = {};
      for (const [key, word] of Object.entries(r)) {
        if (key === '//') continue;
        const w = `words.${entry}.${key}`;
        if (typeof word !== 'string' || word.trim() === '') read.fail(w, `must be non-empty text, but is ${describe(word)}`);
        else if (word.length > MAX_PROMPT) read.fail(w, `"${word}" is longer than ${MAX_PROMPT} letters: it must fit the Use button`);
        // INTENT: t-no-numbers (Step 2): no digit is shown to a player.
        else if (/\d/.test(word)) read.fail(w, `"${word}" has a digit: the game shows no numbers`);
        else out.words[entry]![key] = word;
      }
    }
    return out;
  },
  check(content, fail) {
    // Every deed a placed thing does has a word, so the button never goes blank beside one.
    for (const [room, file] of Object.entries(content.placements)) {
      for (const t of file.things ?? []) {
        if (content.prompts.words.thing?.[t.deed] === undefined) fail('content/prompts.json', 'words.thing', `no word for the deed "${t.deed}" (thing "${t.id}" in content/placements/${room}.json)`);
      }
    }
    for (const [entry, key] of [['door', 'go-in'], ['bell', 'ring']] as const) {
      if (content.prompts.words[entry]?.[key] === undefined) fail('content/prompts.json', `words.${entry}`, `no word for "${key}"`);
    }
  },
};
export default kind;
