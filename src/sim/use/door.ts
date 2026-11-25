import type { UseEntry } from '../use.ts';
import { enterDoorwayAt } from '../systems/room-doors.ts';
import { machineOf } from '../machines.ts';

/**
 * Use in an enter doorway goes through it (systems/room-doors.ts acts).
 * INTENT: order 0, the door wins the press (src/sim/use.ts).
 * DRAFT (guard vehicle push 2b, the orchestrator's look at the trike's shots):
 * a machine's body (a hero riding one) is not offered the doorway: Use never
 * reads GO IN under a rider, and a rider's press of Use takes no doorway
 * (measured before this: it took nobody through anyway). Jump is how a rider
 * gets out (machine-seat); the stick up still asks a doorway as for any body.
 */
const entry: UseEntry = {
  id: 'door',
  order: 0,
  find(_world, content, e) {
    if (machineOf(content, e.kind)) return undefined;
    const door = enterDoorwayAt(content, e);
    if (!door) return undefined;
    const T = content.rooms[e.room]!.tile;
    return { entry: 'door', word: 'go-in', at: { x: (door.tx + door.w / 2) * T, y: door.ty * T } };
  },
};
export default entry;
