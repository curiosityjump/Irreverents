// Scratch (Step 15 push 5): node tools/scenario-bots/events.ts <scenario-id> [type,type...]
// Replays one scenario as the check does and prints its events as JSON lines (all, or only the named types),
// so a recorder can write claims from what the run really did. Not a check. DRAFT.
const R = new URL('../..', import.meta.url).pathname.replace(/\/$/, '');
const { generateRegistries } = await import(R + '/scripts/lib/registries.ts');
generateRegistries();
const { loadContent, loadScenarios } = await import(R + '/scripts/lib/content-files.ts');
const { simulate } = await import(R + '/src/scenarios/run.ts');
const [id, types] = process.argv.slice(2);
const loaded = loadContent();
const s = loadScenarios(loaded.content).scenarios.find((x: { id: string }) => x.id === id);
if (!s) throw new Error(`no scenario ${id}`);
const want = types ? new Set(types.split(',')) : undefined;
for (const ev of simulate(s, loaded.content).events) if (!want || want.has(ev.type)) console.log(JSON.stringify(ev));
