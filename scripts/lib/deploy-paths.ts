// Which changed files restart the live game.
//
// INTENT: this mirrors build.watchPatterns in railway.json. The team pushes
// documents every few minutes; without the patterns every one of them
// restarted the server and dropped whoever was playing (docs/plan/step-1.md,
// "What's decided"). Change both together, and re-prove it:
// docs/mechanisms/deploy.md.
const WATCHED_DIRS = ['src/', 'content/', 'scripts/', 'assets/'];
const WATCHED_FILES = ['package.json', 'package-lock.json', 'tsconfig.json', 'tsconfig.pure.json', 'railway.json'];

export function restartsTheGame(file: string): boolean {
  return WATCHED_FILES.includes(file) || WATCHED_DIRS.some((dir) => file.startsWith(dir));
}
