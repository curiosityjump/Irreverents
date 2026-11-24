# Scenario bots (Step 15)

**Reference.** The scratch tools the Step 15 builder recorded the `step15-*`
scenarios with; not part of any check. `DRAFT:`

- `walkbot.ts`: a waypoint walker. `node tools/scenario-bots/walkbot.ts plan.json`
  plays the real `step()` one tick at a time and prints a scenario's `inputs`,
  `ticks` and `marks` (where the body was at each `{"mark": name}` leg). Legs:
  `{room, toCol, dir?}` walk (jumping walls and gaps), `{climb: n}` jump on the
  spot n times, `{up: true}`, `{grab: true}`, `{attack: true}`, `{face: ±1}`,
  `{hold: ±1, n, jump?}`, `{wait: n}`. Plan keys: `hero`, `room`, `spawn`,
  `power?`, `entities?`, `placements?`, `max?`. It loads content without the
  way-out check, so it runs in half a second.
- `mk_cross.py`, `mk_insides.py`: re-record the crossing and the insides
  scenarios (`SCRATCH=<dir> python3 tools/scenario-bots/mk_insides.py [regex]`).
  Re-record after any change to the forest's rows; then watch each control fail.
- `shots.mjs`: phone screenshots of named spots (`node tools/scenario-bots/shots.mjs
  <base url> <out dir> '[{"name","room","col","row"}]'`), standing the page's
  own hero there.
- The five `found` facts (gap-infiltrator, canopy-flyer, hatch-grappler, later-boost, shortcut-opened) were appended after recording; mk_insides.py does not write them, so re-add them after a re-record.
