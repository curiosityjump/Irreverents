**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *02 Gameplay Systems/08 — Combat Impact, Destruction and Vehicles* (https://docs.google.com/document/d/1Px-MPxRc2dTP-yyxCJcSCGRg5Y-TY6AuLA62ovOcn1c/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

Combat Impact, Destruction and Vehicles

Status: High-priority feel and simulation goals \| 22 November 2026

# Core feeling

Every powerful strike should invite an involuntary “OHHHH!” Impact is the collision of anticipation, contact, force and significant consequence. The target is not damage numbers or screen clutter. The target is unmistakable mass, velocity, resistance, launch, slam, breakage and cascading reactions.

User references: Kirby Suplex, Smash Bros. Home-Run Bat, Street Fighter's powerful hits, Neo vs many Agent Smiths in The Matrix Reloaded, Need for Speed/GTA at full-speed roadblocks.

# Combat asymmetry

The heroes are typically much stronger than ordinary enemies. Defeating groups should be joyful, readable and varied. Ordinary enemies may be flung away, outmaneuvered or tossed into each other. The game also allows genuinely difficult enemies, titanic foes, rare powers and escalating swarms. A last stand against 50 opponents may be unwinnable and still fantastically fun.

Avoid making enemies into homogeneous damage sponges; distinctions in movement, weight, armor, range, hazards and powers create variety.

# The impact grammar

Anticipation: a believable wind-up, charge, grip, speed build-up or positioning.

Contact: readable collision pose, appropriate effects and optionally brief hit-stop or frame freeze; audio weight; selective shake.

Consequence: knockback, throw trajectory, wall crack, debris, bounce, pushed bystanders, enemy-to-enemy chain reaction, vehicle deformation or crash, environmental change.

Recovery: enemy regains footing, staggers, falls, counterattacks, loses armor or is defeated; player can pursue another interaction. The exact technical combination is underdetermined.

# Weight and resistance

Light enemies should fly from heavy blows. Heavy enemies may barely shift from small strikes, but a sufficiently powerful suplex, vehicle crash or chained explosion can topple them. This contrast makes massive impact meaningful. Encourage throws into walls, into other enemies, across platforms and through vulnerable structures.

# Shared physical rule language

Momentum changes collision strength; objects have effective mass; projectiles, debris and enemies can transmit force; explosions can launch things; heat, cold, wind and electricity produce consistent system effects where defined. This must be scoped: deliberately choose expressive, high-value interactions rather than promise a full universal physics simulation.

# The combat systems and acquired powers

Weapons and copied powers can be an opportunity to express different kinds of impact: grabs/suplexes, hammer slams, knockback bat, fire blast, electric chain, ice formations, giant projectiles, wall-breaking charge, aerial dive. Acquiring a power from a special enemy may turn a desperate pursuit into an opportunity.

Distinct powers can also create stealth, traversal or puzzle affordances. Avoid one-dimensional “combat-only pickups” where richer reuse is feasible.

# Vehicles, including unsolicited hijacks

Players should be able to commandeer vehicles as part of play, including enemy-operated machines deployed to suppress them. Possibilities: carts, cars, trains, aircraft-like machines, armored transport, giant mechanical enforcers. Final setting and vehicle list are open. Being able to steal the very machine meant to stop you, then run over its former operators, is a signature payoff.

Vehicle actions must deliver the same impact grammar as combat: speed, crunch, collision, debris, knockback, breakable barricades, chains of crashes. Players can potentially bail out at the last moment and escape on foot.

# Destruction with playable consequences

The user values recklessly, carelessly destructive action including self-destructive stunts. Structures, barrels, bridges, stalls, machinery, walls or props can break, collapse, explode and reveal routes. Destruction may uncover secrets or create new ones; accidents can be entertaining. The extent of destructible geometry and world repair/reset are not committed.

Avoid protecting a royal building or museum merely because it hosts exposition or achievement information. The Hall of Legends itself can host a legendary battle.

# The escalating last stand

A small scuffle attracts guards, then armored squads, then pursuit vehicles, then an enormous enforcer. The player disables and hijacks it, demolishes defenses, takes catastrophic damage, launches themselves out, escapes through a hidden passage. The joy is an improvised catastrophe, not a scripted set piece. Even if all party members are defeated, the event can be memorialized.

# Audio, VFX and pixel-art readability

Current aesthetic target is Amazing Mirror-like colorful sprite/pixel presentation. Impact can use key-frame exaggeration, brief hit-stop, pixel debris, enemy squash/stretch, dramatic sound transients, directional particles, camera nudge and clean collision arcs.

Keep contrast: if every attack creates max shake and explosion effects, none feels epic. Accessibility settings should allow reduced shake/flashes; exact options await design.

# Prototype bar

In a small pixel-art arena with a dozen low-tier enemies and one heavy brute, a well-timed powerful move should send a target into a group, causing a chain reaction players immediately understand and want to repeat. A high-speed stolen vehicle collision with a blockade should be satisfyingly violent in motion while remaining readable in 2D. A character should be able to fall to an enormous force and still create a beloved “last stand” story.
