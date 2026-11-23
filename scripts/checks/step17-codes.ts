// Step 17 hardening, item 14 (docs/mechanisms/saves.md, "The start
// screen"): what the code field makes of pasted text. Run by `npm run check`.
import { codeFromText } from '../../src/net/game-code.ts';
import type { ScriptCheck } from '../lib/script-checks.ts';

const CASES: [string, string][] = [
  ['https://irreverents-production.up.railway.app/?game=HJKR', 'HJKR'],
  ['https://irreverents-production.up.railway.app/?game=hjkr&tune', 'HJKR'],
  ['Join my game: MNPB', 'MNPB'],
  ['ab cd', 'ABCD'],
  ['qwzx', 'QWZX'],
  ['q', 'Q'],
  ['WXYZW', 'WXYZ'],
];

const check: ScriptCheck = {
  id: 'step17-codes',
  gate: null,
  proves: 'the code field takes the code out of a pasted shared link or share message, joins letters typed with a space, and cuts anything longer to four letters',
  async run(): Promise<string[]> {
    return CASES.filter(([text, want]) => codeFromText(text) !== want).map(([text, want]) => `"${text}" gives "${codeFromText(text)}", expected "${want}"`);
  },
};
export default check;
