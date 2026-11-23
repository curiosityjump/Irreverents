# Debugging: order of operations

**Standing.** Run per `docs/sop.md`.

A general-purpose checklist for investigating *any* nontrivial bug in this
codebase (not specific to one subsystem). The underlying principle is Occam's
razor applied to causes, not just designs: prefer the explanation that
accounts for **all** the symptoms while assuming the **least** — and prove or
kill that explanation with the cheapest possible test before spending effort
on a more elaborate one. This mirrors the "scientific method" loop
professional developers report actually using (observe → hypothesize →
predict → test → repeat — see Zeller's *Why Programs Fail*), combined with the
practical rules in David Agans' *Debugging: The 9 Indispensable Rules*.

Before concluding anything is a bug at all, read `docs/deliberate-designs.md`.
Strangeness is often intent.

## The order

1. **Reproduce it, minimally and cheaply, before theorizing.** The cheapest
   test that can falsify a whole class of explanations comes first — e.g. a
   fresh private browser window (rules out *all* client-cache/cookie/session
   theories in one shot), a raw `curl` against the API (rules out *all*
   frontend-vs-backend ambiguity in one shot), a single isolated test, a fresh
   `git clone`. Don't open the editor and start reading code until you've run
   whatever five-second check would rule out the largest chunk of hypothesis
   space.
2. **Check what changed recently.** Most bugs are regressions. `git log -p` /
   `git diff` / `git bisect` against the last known-good state beats reasoning
   about the system from scratch — especially before reaching for an
   explanation that requires the system to have been subtly broken all along.
3. **Prefer the boring explanation.** Typo, off-by-one, stale cache, wrong
   environment variable, a style rule, a missing await, a loose equality — in
   roughly that order of how often they're the cause vs. how often they're
   suspected last. Reach for "race condition," "multi-instance cache
   divergence," "the framework has a bug," or similar only after the boring
   ones are ruled out by evidence, not just deemed "probably not it."
4. **Isolate one variable at a time.** If you change two things and the bug
   goes away, you don't know which one fixed it (or whether both were needed,
   or neither, and something else moved). This matters as much when
   *diagnosing* as when fixing — toggle one factor, observe, then the next.
5. **Look at the data, don't just think about the code.** Add a log line, run
   the actual query, hit the actual endpoint, print the actual value. A theory
   that hasn't been checked against a real observed value is still a guess, no
   matter how plausible the code reading made it seem.
6. **Once you have a fix, verify it actually closes the loop.** Re-run the
   exact repro from step 1, not just a build. "The code now looks correct" and
   "the bug is gone" are different claims — confirm the second, ideally via
   the same cheap repro that first revealed the symptom. Then run the
   verification ladder in `docs/verifying-and-finishing.md`.
7. **Write down the actual root cause, not just the fix.** Future debugging of
   the same symptom should start from "here's what it turned out to be last
   time," not from zero. A non-obvious cause gets a paragraph in the relevant
   `docs/mechanisms/` writeup (indexed in `docs/mechanisms/README.md`), or a
   trap bullet in `docs/verifying-and-finishing.md` if it will fool the next
   verifier.

## Anti-patterns to watch for in yourself

- Jumping straight to an architecturally interesting explanation
  (distributed-systems race, framework bug, cosmic ray) because it's a more
  satisfying story than "a style rule had higher specificity than expected" —
  interesting and correct are not the same thing.
- Proposing a fix for a hypothesis you haven't tested yet, then treating "the
  fix seems reasonable" as if it were "the bug is confirmed diagnosed."
- Skipping the cheap clean-room repro (private window, fresh clone, fresh
  session) because the more complex theory already "feels right" — it's
  always worth the thirty seconds, because it's the one test that can
  invalidate an entire branch of reasoning at once.
