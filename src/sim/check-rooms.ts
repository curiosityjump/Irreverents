import type { Content, Problem } from '../content/types.ts';
import type { PartRule, System } from './types.ts';

/**
 * The room checks that need the simulation as well as the content
 * (docs/mechanisms/rooms-and-doors.md). Called from check-content.ts.
 * `systems` is a parameter so the controls can pass their own.
 */
export function checkRooms(content: Content, systems: System[]): Problem[] {
  const problems: Problem[] = [];
  checkParts(content, systems, problems);
  return problems;
}

/** Every placed part names a kind some system drives, and that system accepts how it was placed. */
function checkParts(content: Content, systems: System[], problems: Problem[]): void {
  const kinds: Record<string, PartRule> = {};
  for (const s of systems) Object.assign(kinds, s.parts);
  const names = Object.keys(kinds).sort();
  for (const room of Object.values(content.rooms)) {
    const file = `content/rooms/${room.id}.json`;
    room.parts.forEach((part, i) => {
      const where = `parts[${i}] ("${part.id}")`;
      const rule = kinds[part.kind];
      if (!rule) {
        problems.push({
          file,
          where: `${where}.kind`,
          message: `no kind of part "${part.kind}" (a kind is declared in the "parts" of the system that drives it, src/sim/systems/; kinds: ${names.join(', ') || '(none yet)'})`,
        });
        return;
      }
      rule.check?.(part, room, (message) => problems.push({ file, where, message }));
    });
  }
}
