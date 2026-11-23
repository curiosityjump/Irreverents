# Example brief: "every email can be turned off"

**Reference.** Open when writing a brief, alongside `docs/briefs.md`.

**This is an illustrative brief for an imaginary project**: a small team
task-tracker web app with email notifications. Every file name, line number,
count and decision below is invented to show the shape of a good brief. It
exists because `handoff-prompts/` is **empty by design** (every brief is
deleted when its slice ships), so a lead that has never written one has no
example to look at. Now it does.

**Do not act on anything in it.** Read it for **shape**:

- **the measurement that decides the design**, done by the brief writer, with
  the number, not left for the executing session;
- **the honest headline**: this one says plainly that the check it asks for
  finds *zero* bugs today, and argues for building it anyway;
- **traps** that would each cost a real hour, including the one that would
  make the check vacuous;
- **out of scope**, naming the adjacent things a session will notice and must
  leave alone;
- **decided vs. open**, so nothing settled gets relitigated and nothing that is
  the owner's gets decided by a session;
- **verification with a failing control**: build the defect, watch the check
  catch it, then watch it go quiet when fixed.

**Replace this file with a real brief from your own project once a good one
ships.** One example, kept current, not an archive of briefs.

---

## Two things, in this order. The first is small.

### 1. Tasks assigned to a deleted account (owner-decided)

`deleteAccount()` (`src/accounts/delete.ts:84`) removes the user row and
their sessions, but leaves every task assigned to them pointing at a user id
that no longer exists. The task list then renders "Assigned to: (unknown)".

**The owner was asked and chose: the task becomes unassigned and its creator
gets a notification.** *"Unassign it and tell whoever made it."*

**The primitive already exists; do not build a new one.**
`unassignTask(db, taskId, reason)` (`src/tasks/assign.ts:212`) clears the
assignee, writes an activity-log line, and, when `reason` is
`"assignee-removed"`, already enqueues the `task-unassigned` email to the
creator (`src/notifications/queue.ts:61`). That template already exists and
already renders. So deletion needs to find this user's open tasks and call it.

Finding them: `tasks` has no `user_id` column; it references users as
`assignee_id` (measured), so match on that with `status <> 'done'`. Done tasks
keep their historical assignee: the owner wants the record intact.

**Its own commit, before the main work.** Small, decided, unrelated.

---

### 2. The main work: every notification can be turned off, checkably

`CLAUDE.md`'s **first design principle** is *"Nobody receives email they
can't stop."* The codebase defends it in prose in four places: the shared
email footer, the settings page's per-type toggles, a 9-line comment in
`src/notifications/send.ts` explaining why digests check preferences twice,
and the onboarding copy.

**Nothing checks any of it.** Every one of those is a person remembering.

{{STATIC_CHECKS}} includes a templates check (`scripts/check-templates.ts`)
that, at line 40, confirms *"every template referenced in code exists."*
There is no counterpart confirming that every template **sent** can be
**turned off** by the person receiving it, and that is the direction the
principle is about.

**Build it.**

**Measure-table row: none directly.** Say this at phase 5 rather than "moves
nothing": the template-to-preference map this produces is the same map the
owner's requested *"one page showing every email we send and who can turn it
off"* would render. Building it as a reusable function rather than a one-off
inside the check script is what makes that true, and is the reason to prefer
that shape.

---

## The derivation, already done

**Do not re-derive this. Do check it: the numbers below came from a crude
model, and the refinements are where the meaning is.**

### What counts as "can be turned off"

Measured against `src/notifications/` and `templates/email/`, in the order
each had to be added after the previous model produced a false positive:

| Mechanism | Notes |
|---|---|
| a `preferenceKey` in the template's front-matter | the obvious one. Careful: `weekly-digest` has `preferenceKey: ""`, an *explicitly empty* string, so test for a non-empty value, not the key's presence |
| a send call passing `{ preference: "<key>" }` | templates can be gated either in front-matter or at the call site. Check both or you will miss half |
| `transactional: true` in front-matter | password reset, email change confirmation. **Legally and deliberately not turn-off-able: 4 templates.** Not optional to handle |
| a template sent only from an admin-triggered job | goes to the admin who triggered it, not a recipient who opted in |
| **the global "unsubscribe from all" link** | in the shared footer of every template. The universal backstop, and **destructive**: it turns off everything, including things the user wants |

That last row is the whole subtlety. **Because the global unsubscribe is in
every footer, no email literally lacks a way to stop it, and a naive check
finds nothing.** The check worth having is narrower:

> **Can the recipient stop *this kind* of email without stopping all of them?**

### What that finds today: one template, and it is deliberate

Modelling the above, then filtering to templates that are actually *sent*
(referenced by a send call reachable from a route, a job, or an event
handler):

- **6 templates** have no preference key and are not transactional:
  `admin-export-ready`, `beta-invite`, `legacy-welcome`, `team-archived`,
  `test-render`, `trial-ending`.
- **5 of the 6 are never sent to an opted-in recipient.** `test-render` is
  used only by the template preview page; `legacy-welcome` has no remaining
  send call; the other three are admin-triggered. **A template nobody receives
  unasked needs no preference**; without this filter the check is 6/6 noise.
- **`trial-ending` is the only template that is sent, not transactional, and
  has no per-type off switch.** It is in `docs/deliberate-designs.md` ("Trial
  warnings always send"), and not being able to mute it is plausibly the
  point.

**So this check finds zero accidental gaps today, and you should say so
plainly.** That is not a reason to skip it; it is the reason to build it
*now*, while the answer is known-good. Its value is the next template, and
especially the next one created **through the template editor by someone not
thinking about preferences at all**. `POST /admin/templates` already creates
templates live; nothing stops one being created with no preference.

**`trial-ending` needs a deliberate marker, not a fix.** Read
`docs/deliberate-designs.md` and `docs/sop.md` phase 3 before deciding how,
and if you conclude it *should* be fixed, that is a question for the owner,
not a change. Whatever mechanism you use must be visible in the template or in
the check's output, not a silently hardcoded name.

---

## Traps

1. **The global unsubscribe makes a naive check vacuous.** If your check
   passes trivially, you have written the check that says "the footer
   exists." Re-read the sharpened question above.
2. **A template nobody receives unasked is not a bug.** Skipping the "actually
   sent to a recipient" filter turns one real signal into six false ones
   (measured). And "sent" includes event handlers and scheduled jobs, not just
   routes.
3. **Transactional templates look ungated and are correct.** Four of them.
   Treat `transactional: true` as satisfying the check, and say why in a
   comment.
4. **The check must stay database-free.** The templates check runs in CI on a
   bare checkout with no database, and that is load-bearing. The user
   preferences table is therefore off limits; work from code and front-matter
   only. If the shared function needs a home, `src/notifications/model/` is the
   only directory that imports nothing outside itself; verify with
   `grep -hoE '^import .* from "[^"]+"' src/notifications/model/*.ts` that you
   added no outward import.
5. **Do not "fix" the templates this flags.** Phase 3. Five are fine, one is
   deliberate. The deliverable is the check, not a template edit.
6. **{{BUILD_COMMAND}} writes its output even when it fails.** Check the exit
   code, not the presence of the build directory.

---

## Out of scope

- **Making the template editor refuse a template with no preference.** The
  obvious follow-up, and a *different* slice: it needs a decision about
  whether an admin may deliberately create a non-mutable email. Raise it;
  don't build it.
- **The digest double-check** in `src/notifications/send.ts`. Measured, it is
  redundant but harmless; insurance, not a repair. See `docs/plan.md`.
- **Email deliverability and bounce handling.** Separate.
- **Anything about the settings page beyond reading its toggle list.** Worth
  knowing while you are in here: the page's toggles are a hand-written list
  of 11 keys, while front-matter declares 13 distinct `preferenceKey` values,
  so two preferences exist that no user can reach. That is the next real
  piece of work. Not this slice: put it in `docs/for-the-lead.md`.

---

## Decided vs. open

**Decided: do not relitigate.**

- **Deleting an account unassigns that user's open tasks, and each task's
  creator is told** (owner). Item 1.
- One branch, main, deployed to {{DEPLOY_TARGET}}
  (`docs/git-workflow.md`, `docs/sop.md` phase 7).
- Transactional emails are never mutable: decided and marked `INTENT:` in an
  earlier slice.

**Open: ask, don't decide.**

- **Nothing blocking.** If your reading says `trial-ending` should be mutable,
  that is a question for the owner in their terms ("right now the only way to
  stop the trial-ending warning is to unsubscribe from every email we send;
  is that intended, or should it get its own switch in settings?"), with your
  recommendation. Do not change it either way on your own authority.

---

## How it gets verified

**Rung 2 of `docs/verifying-and-finishing.md`'s ladder, plus a failing
control.** This is a static-check change, so the check *is* the test, which
means the only thing that matters is whether it can fail.

1. Run {{STATIC_CHECKS}} on the unmodified tree: passes, with `trial-ending`
   either marked deliberate or reported as a known note, and **no other
   template flagged.** If you flag more, your model is missing a mechanism
   from the table above; find it rather than adding an exception.
2. **The failing control, and it is the point.** Add a throwaway template
   with no preference key and a send call from a real route, and confirm the
   check **fails and names it**. Then delete it. Without this you have shipped
   a check nobody has seen work.
3. **A second control:** give the same throwaway template a `preferenceKey`
   and confirm the check now passes. That proves it tests the off switch, not
   the template's newness.
4. **Item 1:** two accounts on one team. Assign a task from A to B, delete B,
   and confirm from A's view that the task shows as unassigned and that A's
   notification arrived (check the inbox in the local mail catcher, not the
   database row).
5. {{BUILD_COMMAND}} (exit code) and {{STATIC_CHECKS}}.

---

## Definition of done

`docs/verifying-and-finishing.md`'s checklist, in full. Plus the SOP phase 6
rows this triggers:

- **A new mechanism** → one line in `docs/mechanisms/README.md` **and** the
  writeup. The preference check is genuinely new.
- **A mechanism that changed** → run `grep -rl "check-templates" docs/mechanisms/`
  and `grep -rl "delete.ts" docs/mechanisms/` at phase 1 and use what they
  return.
- **Owner confirmed something is intentional** → if `trial-ending` stays as it
  is, `docs/deliberate-designs.md` **and** an `INTENT:` at the site. It already
  has a row; extend it rather than adding a second.
- **A decision the owner made that isn't "this is intentional"** → the
  account-deletion behaviour, in the doc that governs account deletion.
- **A measured number** → whatever your model flags, in the doc that claims
  it.
- **The plan** → `docs/plan.md`: record both, and that the preference check
  exists.
- **The brief whose slice shipped** → delete this file.

---

## Where your questions go

**Blocking** (you cannot finish without an answer): ask the owner directly, in
the moment, in their terms and with your recommendation, and also add it to
`docs/questions-inbox.md`. **Non-blocking questions** go to
`docs/questions-inbox.md` (its header says how); **flags and
findings** that are not questions go to `docs/for-the-lead.md`. Not into this
file, and not into `docs/plan.md`. Your final message is a short confirmation:
done or blocked, the commit, and whether you wrote to `docs/for-the-lead.md`.
