// The browser client. DRAFT until Step 1 Gate 2: one local player, keyboard
// only, no network. It runs the same simulation core as the server and the
// scenario harness, and draws it as graybox rectangles.
import { step } from '../sim/step.ts';
import { DT } from '../sim/types.ts';
import { createWorld, spawnPlayer } from '../sim/world.ts';
import { watchKeyboard } from './keyboard.ts';
import { render, VIEW_H, VIEW_W } from './render.ts';

const content = __CONTENT__;
const canvas = document.getElementById('game') as HTMLCanvasElement;
canvas.width = VIEW_W;
canvas.height = VIEW_H;
const g = canvas.getContext('2d')!;

const LOCAL = 'local';
const world = createWorld();
spawnPlayer(world, content, { player: LOCAL, character: content.game.playerCharacter, room: content.game.startRoom });
const readInput = watchKeyboard(content, window);

// A fixed timestep fed by real time: the simulation always advances in
// whole ticks, however fast the screen refreshes.
let last = performance.now();
let owed = 0;
function frame(now: number): void {
  // INTENT: after a pause (a hidden tab, a locked phone) catch up at most a
  // quarter second, never the whole gap, so the game cannot freeze replaying it.
  owed += Math.min((now - last) / 1000, 0.25);
  last = now;
  while (owed >= DT) {
    step(world, { [LOCAL]: readInput() }, content);
    owed -= DT;
  }
  render(g, world, content, content.game.startRoom);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// For scripted checks and the curious: the live world, read-only by convention.
(window as unknown as { irreverents: unknown }).irreverents = { world, content };
