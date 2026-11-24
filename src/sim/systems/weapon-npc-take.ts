import { canAct } from '../body-state.ts';
import { emitEffect } from '../effects.ts';
import { isOut, npcKind } from '../npc/state.ts';
import type { Entity, System } from '../types.ts';
import { removeEntity } from '../world.ts';
import { canHold, looseBox, weaponWorld } from '../weapons.ts';

/**
 * A bad guy takes a weapon lying where he stands (Step 23, its
 * `takenByBadGuys`; the step file: "A bad guy with empty hands who walks over
 * a loose weapon takes it"; docs/mechanisms/weapons.md). A body nobody plays,
 * a person of side `bad` (content/npcs/), with hands (it lists `attack`),
 * empty-handed, on its feet and able to act (not flying, held, beaten down or
 * out cold), whose box overlaps a loose weapon at rest (not flying, lit or
 * ending, past its `until`) whose file says `takenByBadGuys`, takes it: the
 * effect puts it in his hand (with its source and uses), `weapon-taken`
 * with player null. From then on his own swing is the weapon's
 * (numbersOf), and a hard hit knocks it loose again.
 * INTENT: a rule by touch only. It writes no `c.input` and moves nobody: NPC
 * response logic stays scripted (CLAUDE.md, "NPCs are scripted, never AI");
 * a bad guy never goes to fetch one (out of scope, the step file's "Open").
 * The server's world and a scenario's only (weaponWorld).
 * Runs after weapon-sources (546), which stands fresh weapons, and before
 * weapon-burst's removals have any say: a weapon ending is never taken.
 */
const system: System = {
  id: 'weapon-npc-take',
  order: 548,
  run(ctx) {
    const { world, content } = ctx;
    if (!weaponWorld(world)) return;
    const weapons = content.weapons ?? {};
    if (!Object.values(weapons).some((w) => w.takenByBadGuys)) return;
    const taken = new Set<string>();
    const takes: [Entity, Entity][] = [];
    for (const e of world.entities) {
      if (e.player !== null || e.c.loose || e.c.weapon || !e.onGround || !canAct(e) || isOut(e)) continue;
      if (npcKind(content, e)?.side !== 'bad' || !canHold(content, e)) continue;
      const box = content.characters[e.kind]?.box;
      if (!box) continue;
      let best: Entity | undefined;
      for (const o of world.entities) {
        const l = o.c.loose;
        if (!l || taken.has(o.id) || o.room !== e.room || l.flying || l.lit || l.ending || world.tick < l.until) continue;
        if (!weapons[l.weapon]?.takenByBadGuys) continue;
        const b = looseBox(content, o);
        if (o.x < e.x + box.w && o.x + b.w > e.x && o.y < e.y + box.h && o.y + b.h > e.y) {
          best = o;
          break;
        }
      }
      if (!best) continue;
      taken.add(best.id);
      takes.push([e, best]);
    }
    // Applied after the look, so no removal shifts the list being walked.
    for (const [e, best] of takes) {
      const l = best.c.loose!;
      emitEffect(ctx, e, { kind: 'weapon', weapon: l.weapon, by: e.kind, ...(l.src ? { src: l.src } : {}), ...(l.uses !== undefined ? { uses: l.uses } : {}) });
      ctx.emit('weapon-taken', { entity: e.id, player: null, weapon: l.weapon, loose: best.id, ...(l.src ? { src: l.src } : {}) });
      removeEntity(world, best.id);
    }
  },
};
export default system;
