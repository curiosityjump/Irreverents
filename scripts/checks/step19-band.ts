// Step 19 push 3 (docs/mechanisms/heists.md, "Sight you can see"): the band
// a page draws for a watcher is exactly what canSee tests. For every placed
// person in every room, facing each way, every lit cell's middle is seen by
// canSee, every unlit cell's middle inside the box is not, and a middle a
// pixel past the box's far edge, behind the eye or over its height is not.
// Run by `npm run check`.
// Control (by hand, watched to fail): sightBox's x1 widened by one cell, or
// bandCells skipping lineClear; both fail here.
import { bandCells, CELL } from '../../src/client/draw/band-cells.ts';
import type { Content } from '../../src/content/types.ts';
import { canSee, sightBox } from '../../src/sim/npc/sight.ts';
import type { Entity } from '../../src/sim/types.ts';
import { createWorld, spawnBody } from '../../src/sim/world.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

/** A body of `kind` whose middle is at (x, y). */
function at(content: Content, room: string, kind: string, x: number, y: number): Entity {
  const box = content.characters[kind]!.box;
  return { id: 'probe', kind, player: 'probe', room, x: x - box.w / 2, y: y - box.h / 2, vx: 0, vy: 0, facing: 1, onGround: true, c: {} };
}

const check: ScriptCheck = {
  id: 'step19-band',
  gate: null,
  proves: "the sight band a page draws for each placed person, facing either way, is exactly canSee's test: every lit cell's middle is seen, every dark cell's middle in the box is not, and no point past the box's edges is",
  async run(content: Content): Promise<string[]> {
    const problems: string[] = [];
    let watchers = 0;
    let lit = 0;
    for (const [roomId, file] of Object.entries(content.placements)) {
      const world = createWorld();
      for (const p of file.place) {
        if (p.npc === undefined) continue;
        const w = spawnBody(world, content, { id: p.id, character: p.character, room: roomId, tile: p.tile });
        const probeKind = 'infiltrator' in content.characters ? 'infiltrator' : p.character;
        for (const facing of [1, -1] as const) {
          w.facing = facing;
          watchers++;
          const box = sightBox(content, w);
          if (!box) {
            problems.push(`${roomId}/${p.id}: no sight box`);
            continue;
          }
          const cells = bandCells(content, w);
          lit += cells.length;
          const litAt = new Set(cells.map((c) => `${c.mx},${c.my}`));
          for (const c of cells) {
            if (!canSee(content, w, at(content, roomId, probeKind, c.mx, c.my))) problems.push(`${roomId}/${p.id} facing ${facing}: the band lights (${c.mx}, ${c.my}) but canSee does not see a body there`);
          }
          // Every grid cell of the box that is not lit must not be seen at its middle.
          const room = content.rooms[roomId]!;
          const x0 = Math.max(0, box.x0);
          const x1 = Math.min(room.w * room.tile, box.x1);
          const y0 = Math.max(0, box.y0);
          const y1 = Math.min(room.h * room.tile, box.y1);
          for (let gy = Math.floor(y0 / CELL) * CELL; gy < y1; gy += CELL) {
            for (let gx = Math.floor(x0 / CELL) * CELL; gx < x1; gx += CELL) {
              const cx = Math.max(gx, x0);
              const cy = Math.max(gy, y0);
              const mx = cx + (Math.min(gx + CELL, x1) - cx) / 2;
              const my = cy + (Math.min(gy + CELL, y1) - cy) / 2;
              if (litAt.has(`${mx},${my}`)) continue;
              if (canSee(content, w, at(content, roomId, probeKind, mx, my))) problems.push(`${roomId}/${p.id} facing ${facing}: canSee sees a body at (${mx}, ${my}) where the band is dark`);
            }
          }
          // Just outside the box: past the far edge, behind the eye, over and under it.
          const far = facing > 0 ? box.x1 + 1 : box.x0 - 1;
          const behind = box.eye.x - facing * 1;
          for (const [px, py, what] of [
            [far, box.eye.y, 'past the far edge'],
            [behind, box.eye.y, 'behind the eye'],
            [box.eye.x + facing * 8, box.y0 - 1, 'over the box'],
            [box.eye.x + facing * 8, box.y1 + 1, 'under the box'],
          ] as const) {
            if (canSee(content, w, at(content, roomId, probeKind, px, py))) problems.push(`${roomId}/${p.id} facing ${facing}: canSee sees a body ${what} (${px}, ${py}), outside the band's box`);
          }
        }
      }
    }
    if (watchers === 0) problems.push('no placed person to test');
    if (lit === 0) problems.push('no band lit a single cell');
    return problems.slice(0, 20);
  },
};
export default check;
