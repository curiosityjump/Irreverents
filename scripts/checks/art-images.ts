// Every art content file fits its image (scripts/lib/art-images.ts), and the
// measure's own two controls are still refused: a file naming an image
// that is not there, and a frame number past the end of a sheet.
// INTENT: the controls are built in memory, not as files, so they can never
// be served or drawn, and they run on every `npm run check` so the measure
// cannot quietly stop measuring (docs/mechanisms/content-validation.md,
// "Controls that stay alive"). Never weaken them to get green.
import type { ArtContent } from '../lib/art-images.ts';
import { artImageProblems, diskSizes } from '../lib/art-images.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';


function controls(): string[] {
  const out: string[] = [];
  const sheet = { w: 64, h: 32 }; // 2×1 cells of 32: frames 0 and 1
  const base = (): ArtContent => ({ sprites: {}, atlases: {}, backdrops: {}, decor: {}, looks: {} });
  const sprite = (image: string, idle: number[]): ArtContent['sprites'][string] => ({
    id: 'control', image, cell: { w: 32, h: 32 }, anchor: { x: 0, y: 0 }, fps: 8,
    frames: { idle, run: [0], air: [1] }, fpsBy: {}, moods: {},
  });
  const sizes = (image: string) => (image === 'control/sheet.png' ? sheet : null);

  const missing = base();
  missing.sprites.control = sprite('control/missing.png', [0]);
  const a = artImageProblems(missing, sizes);
  if (!a.some((p) => p.includes('no image at assets/control/missing.png'))) out.push(`control "missing image" was not refused (got: ${a.join(' | ') || 'nothing'})`);

  const pastEnd = base();
  pastEnd.sprites.control = sprite('control/sheet.png', [0, 1, 2]);
  const b = artImageProblems(pastEnd, sizes);
  if (!b.some((p) => p.includes('frames.idle: frame 2 is past the end of the sheet'))) out.push(`control "frame past the end of a sheet" was not refused (got: ${b.join(' | ') || 'nothing'})`);

  const sound = base();
  sound.sprites.control = sprite('control/sheet.png', [0, 1]);
  const c = artImageProblems(sound, sizes);
  if (c.length) out.push(`control "a sheet that fits" was refused: ${c.join(' | ')}`);
  return out;
}

const check: ScriptCheck = {
  id: 'art-images',
  gate: null,
  proves: 'every file in content/sprites, atlases, backdrops, decor and looks names an image under assets/ that exists, and every cell, rectangle and frame it names is inside that image (controls: a missing image and a frame past the end of a sheet are refused; a sheet that fits is accepted)',
  async run(content): Promise<string[]> {
    return [...controls(), ...artImageProblems(content, diskSizes())];
  },
};
export default check;
