import type { Content, Problem } from '../content/types.ts';
import { checkRooms } from './check-rooms.ts';
import { systems, verbs } from './registry.ts';
import { TICK_RATE } from './types.ts';
import type { TuningRule } from './types.ts';

/**
 * The checks that need both the content and the simulation's own lists:
 * every verb a character names exists, every tuning number a verb or system
 * reads is present and in range, and no number sits in the file unread.
 * Each message names the exact file and field (docs/verifying-and-finishing.md, rung 2).
 */
export function checkContentAgainstSim(content: Content): Problem[] {
  const problems: Problem[] = [];
  const fail = (file: string, where: string, message: string): void => {
    problems.push({ file, where, message });
  };
  const TUNING = 'content/tuning.json';
  const verbIds = verbs.map((v) => v.id);

  const checkNumbers = (set: Record<string, number>, where: string, rules: Record<string, TuningRule>, reader: string): void => {
    for (const [name, rule] of Object.entries(rules)) {
      const v = set[name];
      if (v === undefined) fail(TUNING, `${where}.${name}`, `missing: ${reader} reads it (${rule.what})`);
      else if (v < rule.min || v > rule.max) {
        fail(TUNING, `${where}.${name}`, `is ${v}, but ${reader} needs it between ${rule.min} and ${rule.max} (${rule.what})`);
      }
    }
  };

  // World numbers, read by systems.
  const worldRules: Record<string, TuningRule> = {};
  for (const s of systems) {
    checkNumbers(content.tuning.world, 'world', s.tuning ?? {}, `system "${s.id}"`);
    Object.assign(worldRules, s.tuning);
  }
  for (const name of Object.keys(content.tuning.world)) {
    if (!(name in worldRules)) fail(TUNING, `world.${name}`, 'no system reads this number (a typo, or a leftover?)');
  }

  // Character numbers, read by verbs.
  const usedSets = new Set<string>();
  for (const c of Object.values(content.characters)) {
    const file = `content/characters/${c.id}.json`;
    usedSets.add(c.tuning);
    const set = content.tuning.characters[c.tuning] ?? {};
    const rules: Record<string, TuningRule> = {};
    c.verbs.forEach((id, i) => {
      const verb = verbs.find((v) => v.id === id);
      if (!verb) {
        fail(file, `verbs[${i}]`, `no verb "${id}" (verbs are files in src/sim/verbs/: ${verbIds.join(', ')})`);
        return;
      }
      checkNumbers(set, `characters.${c.tuning}`, verb.tuning ?? {}, `verb "${id}" of character "${c.id}"`);
      Object.assign(rules, verb.tuning);
    });
    for (const name of Object.keys(set)) {
      if (!(name in rules)) {
        fail(TUNING, `characters.${c.tuning}.${name}`, `no verb of character "${c.id}" reads this number (a typo, or a leftover?)`);
      }
    }
  }
  for (const id of Object.keys(content.tuning.characters)) {
    if (!usedSets.has(id)) fail(TUNING, `characters.${id}`, 'no character uses this tuning set');
  }

  // Actions the verbs read must exist, or no control could ever trigger them.
  for (const verb of verbs) {
    for (const action of verb.actions ?? []) {
      if (!(action in content.actions)) {
        fail(`content/actions/${action}.json`, '(the whole file)', `missing: verb "${verb.id}" reads the action "${action}"`);
      }
    }
  }

  // The physics system looks one tile ahead, so nothing may cross a whole tile in one tick.
  for (const room of Object.values(content.rooms)) {
    const limit = room.tile * TICK_RATE;
    const where = `content/rooms/${room.id}.json`;
    const fall = content.tuning.world.maxFallSpeed;
    if (fall !== undefined && fall >= limit) {
      fail(TUNING, 'world.maxFallSpeed', `is ${fall}, but must be under ${limit} for the ${room.tile} px tiles of ${where}`);
    }
    for (const [id, set] of Object.entries(content.tuning.characters)) {
      for (const name of ['runSpeed', 'jumpSpeed']) {
        const v = set[name];
        if (v !== undefined && v >= limit) {
          fail(TUNING, `characters.${id}.${name}`, `is ${v}, but must be under ${limit} for the ${room.tile} px tiles of ${where}`);
        }
      }
    }
  }
  // Step 3: working parts and (docs/mechanisms/rooms-and-doors.md) that every room has a way out.
  problems.push(...checkRooms(content, systems));
  return problems;
}
