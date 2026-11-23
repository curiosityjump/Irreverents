import { outposts, postOf } from '../outpost/state.ts';
import type { System } from '../types.ts';

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
          sig.hits++;
          by = ev.by;
        } else if (ev.type === 'impact' && ev.other === post.id && ev.speed >= op.breakSpeed) {
          // `impact` fires once per body; only the striking body's event names the post as `other`, so this counts once.
          smash = true;
          by = post.c.flying?.by ?? ev.entity;
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
