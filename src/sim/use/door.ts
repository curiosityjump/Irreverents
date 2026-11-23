import type { UseEntry } from '../use.ts';
import { enterDoorwayAt } from '../systems/room-doors.ts';

/**
 * Use in an enter doorway goes through it (systems/room-doors.ts acts).
 * INTENT: order 0, the door wins the press (src/sim/use.ts).
 */
const entry: UseEntry = {
  id: 'door',
  order: 0,
  find(_world, content, e) {
    const door = enterDoorwayAt(content, e);
    if (!door) return undefined;
    const T = content.rooms[e.room]!.tile;
    return { entry: 'door', word: 'go-in', at: { x: (door.tx + door.w / 2) * T, y: door.ty * T } };
  },
};
export default entry;
