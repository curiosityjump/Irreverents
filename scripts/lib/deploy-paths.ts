// Which changed files do NOT restart the live game.
//
// INTENT: this mirrors the negated watch patterns in railway.json (docs/**,
// handoff-prompts/**, tools/**, any *.md). The team pushes documents every
// few minutes; without this every one of them restarted the server and
// dropped whoever was playing (docs/plan/step-1.md, "What's decided").
// Change both together, and re-prove it: docs/mechanisms/deploy.md.
export function restartsTheGame(file: string): boolean {
  if (file.endsWith('.md')) return false;
  return !['docs/', 'handoff-prompts/', 'tools/'].some((dir) => file.startsWith(dir));
}
