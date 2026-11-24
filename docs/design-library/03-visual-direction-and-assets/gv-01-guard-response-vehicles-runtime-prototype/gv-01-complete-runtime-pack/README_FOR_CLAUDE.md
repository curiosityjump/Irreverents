# GV-01 — Guard Vehicle Runtime Starter Pack

Four original guard-response vehicle families rendered in Irreverents' compact navy-outlined blue-and-gold fantasy pixel art. **The vehicles contain no guards or riders**, so game code can render any NPC/hero separately in driver or passenger slots.

## What you can import now
- `runtime/vehicles/`: **16 individually transparent RGBA sprites**. All dimensions are multiples of 16: `patrol_trike` 112×80; `transport_wagon` 144×96; `siege_roller` 160×96; `guard_rotorcraft` 128×96.
- `runtime/atlas/guard_vehicles_4x4_160x96.png`: 4-column × 4-row atlas with one vehicle per row, 160×96 cells. Note native individual sprites are different sizes, so use `manifest.json` for precise anchors.
- `manifest.json`: all 16 filenames, state tags, frame native size, source crop, facing, pivot, approximate collider and approximate guard-driver anchor.
- `previews/gameplay_320x180_four_vehicles.png`: four distinct native 320×180 samples stitched 2×2; `previews/gameplay_4x_nearest.png` is a large nearest-neighbor review.
- `source`: original image-generation sheet preserved for provenance.

## State keys
- **Patrol trike**: parked_right, moving_right, parked_left, damaged.
- **Guard transport wagon**: closed_right, door_open_right, moving_right, damaged_right.
- **Siege roller**: ready_right, rolling_right, ready_left, damaged_right.
- **Guard rotorcraft**: idle_right, flying_right, idle_left, damaged_right.

## QA truth
All 16 PNGs validate as actual independent transparent files with dimensions divisible by 16 and binary alpha. **This is an importable static-state prototype, not a complete animated movement rig or proven live iPhone build.** The large source was rendered at 1536×1024 and downsampled into the working sizes. Some weathering effects remain composited, wheel/rotor motion is not genuinely animated, and exact driver attachment positions require Claude's live test. Gameplay mock is only for scale, not part of the art pack.

## Integration
- Character sprites stay separate. No baked-in guard or pilot in any sprite. Vehicles are autonomous physics entities with explicit `driver_anchor` reference points and collider recommendations.
- Pursuit/wanted logic follows the game's signed report rule. If there is no successfully completed report or alarm, do not deploy backup magically.
- Test room boundary traversal, impacts/throws, guard-villain faction collisions, and player driving/hijack behavior separately.
- Prefer the **existing owner-approved P04 vehicle source** for art comparisons before changing visual canon; GV-01 is new proposed vehicle art, ready for experimentation without owner approval bottleneck.
- Mark production-board row `VEH-001` as prototype usable until actual GitHub and iPhone testing; never claim deployed.
