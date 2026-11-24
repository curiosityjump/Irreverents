import { npcKind } from '../npc/state.ts';
import { outposts, postOf } from '../outpost/state.ts';
import type { Content } from '../../content/types.ts';
import type { Entity, System, World } from '../types.ts';

/**
 * DRAFT (`ownSpared`, docs/decisions-log.md "The camp's own blows leave its horn whole"): the
 * doer is one of the outpost's own side: a person no player plays, of the NPC side of the
 * outpost's first caller. A doer gone from the world, or with none, is not.
 */
function ownSide(world: World, content: Content, callers: string[], by: string | null): boolean {
  if (by === null) return false;
  const doer = world.entities.find((x) => x.id === by);
  if (!doer || doer.player !== null) return false;
  const caller = world.entities.find((x) => x.id === callers[0]);
  const side = caller ? npcKind(content, caller)?.side : undefined;
  return side !== undefined && npcKind(content, doer)?.side === side;
}

/** Who struck with this impact: whoever sent the striking body flying, else the body itself. */
function impactDoer(world: World, post: Entity, striker: string): string {
  const s = world.entities.find((x) => x.id === striker);
  return s?.c.flying?.by ?? post.c.flying?.by ?? striker;
}

/**
 * The post breaks when hit, or when something is thrown into it hard.
 *
 * INTENT (D-093): no new button. A hero's hit or a throw is the only way
 * to break it. Order 540: after physics (500) and impact-bodies (520), so
 * this tick's `hit` and `impact` events are all in ctx.events.
 * DRAFT: how much it takes (the outpost's breakHits, breakSpeed), and that
 * it stays broken until the world restarts. Nothing is saved. People
 * already called stay (doc 24).
 */
const system: System = {
  id: 'outpost-signaler',
  order: 540,
  run(ctx) {
    for (const op of outposts(ctx.content)) {
      const post = postOf(ctx.world, op);
      if (!post) continue;
      const sig = post.c.signaler!;
      if (sig.broken) continue;
      let by: string | null = null;
      let smash = false;
      for (const ev of ctx.events) {
        if (ev.type === 'hit' && ev.target === post.id) {
          if (op.ownSpared && ownSide(ctx.world, ctx.content, op.callers, ev.by)) continue;
          sig.hits++;
          by = ev.by;
        } else if (ev.type === 'impact' && ev.other === post.id && ev.speed >= op.breakSpeed) {
          // `impact` fires once per body; only the striking body's event names the post as `other`, so this counts once.
          const doer = op.ownSpared ? impactDoer(ctx.world, post, ev.entity) : (post.c.flying?.by ?? ev.entity);
          if (op.ownSpared && ownSide(ctx.world, ctx.content, op.callers, doer)) continue;
          smash = true;
          by = doer;
        }
      }
      if (sig.hits < op.breakHits && !smash) continue;
      sig.broken = true;
      sig.sounding = 0;
      ctx.emit('signaler-broken', { outpost: op.id, signaler: post.id, by });
    }
  },
};
export default system;
