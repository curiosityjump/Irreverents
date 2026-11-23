import type { Content } from '../content/types.ts';
import type { Entity, World } from '../sim/types.ts';
import { useHere, type UseAnswer } from '../sim/use.ts';
import { showUseWord } from './touch.ts';

/**
 * What the Use button says this frame (Step 19, docs/mechanisms/heists.md):
 * the Use arbiter's answer for this page's own character, asked of the
 * composed world (its own character and everyone else's as received: the
 * things, keepers and doorways of its room), and its word from
 * content/prompts.json. The same answer the simulation acts on, so the
 * button names what a press will do. Returned for the bobbing mark
 * (draw/use-hint.ts) and the page's drawn record.
 * DRAFT: Step 19 push 2 (decisions-log "Step 19").
 */
export function usePrompt(content: Content, world: World, me: Entity): { answer: UseAnswer; word: string } | null {
  const answer = useHere(world, content, me);
  if (!answer) return null;
  const word = content.prompts?.words[answer.entry]?.[answer.word];
  // A word the data does not have shows the plain button rather than a blank one (the check refuses that content).
  return word === undefined ? null : { answer, word };
}

/** Shows the answer on the touch Use button: `data-state` is the word key ("go-in", "take", "buy", "break", "ring"). */
export function showUsePrompt(host: HTMLElement, prompt: { answer: UseAnswer; word: string } | null): void {
  showUseWord(host, prompt ? prompt.answer.word : null, prompt?.word ?? '');
}
