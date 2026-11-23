**Reference — imported, do not edit here.** Mirrored from the owner's Google Drive design library: *02 Gameplay Systems/33 — iPhone Browser Platform and GitHub-to-Railway Delivery* (https://docs.google.com/document/d/1uAu-ziYoHi9n7K3_YyxMgEiw23HuvOvDv1zRlhTRlp8/edit). Drive is the source; re-run `tools/drive_sync.py` to update (`docs/mechanisms/design-library-sync.md`).

---

IPHONE BROWSER PLATFORM AND GITHUB-TO-RAILWAY DELIVERY

Irreverents \| Owner-confirmed platform and deployment plan \| 22 November 2026

# Non-negotiable product target

IRREVERENTS WILL BE PLAYED PRIMARILY AS A BROWSER-BASED WEB APP ON IPHONES. Computer browsers are a possible secondary target. This overrides implicit PC-first, console-first, gamepad-required, or native-app-only assumptions. It does NOT mean a native App Store build is planned. Whether the web app is PWA-installable is an open choice.

All combat, platforming, party switching, social NPC encounters, stealth, world navigation, rare-power recovery and the Cantina's endless free-for-all must be practical with touch input on a real iPhone display. Desktop browser controls should be supported where possible without splitting the game into incompatible versions.

# Owner-selected development and deployment workflow

SOURCE CODE: GITHUB repository. Claude will write/edit game code in GitHub.

DEPLOYMENT: RAILWAY is to be connected by the owner to that GitHub repository. After the owner sets up the integration, code changes pushed to the selected deployment branch should automatically trigger builds and deployment on Railway, yielding a URL players can open in their phone browsers.

OWNER RESPONSIBILITY: The owner says “I'll set that up,” referring to linking Railway and GitHub. DO NOT claim Railway is currently configured, deployment has succeeded, a URL exists, or an actual game already runs. All of those are to be verified later.

CLAUDE RESPONSIBILITY: Write the game code into the GitHub repository; the verified connected auto-deploy path should propagate changes to Railway. The precise way Claude integrates with GitHub (which branch, whether it creates PRs, commit or push rights) is not specified. Do not invent a repo URL, Railway project identifier, deployment branch, production domain, or GitHub credentials.

DRIVE RESPONSIBILITY: Google Drive remains the design/decision/art-reference library. The shared root document named “changelog” tracks material changes made IN THE DRIVE with Eastern date/time and links. GitHub commits and Railway deploys have their own platform histories; consider linking relevant code changes from Drive when they alter game design, but do not treat this Drive changelog as automatically recording GitHub pushes.

# Browser and iPhone touch experience

The user-specified tap-to-swap cantina interaction is a central control design anchor: TAP an unlocked roaming character, see the current limited active party across the screen, then TAP which current team member to replace. Normal ATTACK action is distinct from tap/recruit.

Controls must accommodate directional movement, jump, attack, special ability, grabbing/throwing, contextual interaction, hiding, character switching, and combat precision with no external controller required. Design a small reusable set of context-sensitive controls, not a dozen tiny virtual buttons.

Consider touch target size, safe area insets, device notches, the bottom home indicator, Safari chrome, browser focus, touch gesture prevention within the game surface, and avoiding accidental tab/browser navigation. UI should not cover secret entrances or enemies. Haptics are an optional nice-to-have, not a hard requirement.

Orientation (portrait/landscape), virtual stick versus D-pad, exact on-screen buttons, sensitivity settings, and gamepad/keyboard mapping remain OPEN. Landscape is a promising test due to 2D side-scrolling but has not been approved by the owner.

# Pixel art on real screens

Small readable GBA-era pixel sprites and calm environmental backdrops need testing at phone scale and across different screen ratios. Do not approve large illustrations, anime-like character boards, promotional collages or crowded image boards as game-ready assets because they look good at desktop size.

Test the readability of visible paths, platform edges, collision effects, stealth spotting/report windup, power pickups, characters' idle animation and the Cantina K/D overlay at real iPhone viewport sizes. Preserve the restrained visual-noise direction and original IP.

# Performance, architecture and runtime expectations

Railway is deployment/hosting infrastructure, not itself a game engine, mobile input library, save database, or guaranteed online multiplayer service. The code architecture must still explicitly solve rendering, browser inputs, persistence, real-time networking if desired, and game-state ownership. The programming language, engine, backend topology, database and frameworks are OPEN until chosen.

Use reusable 2D movement/collision/physics and a finite room/world graph. NPCs use authored patterns, NOT AI. Keep active actor caps and optimize offscreen behavior so infinite reinforcements and Cantina respawns do not mean infinite simultaneous objects. Test memory, loading time, draw calls, sprite batching, audio resume, battery/heat and device throttling.

Design browser state resilience: phones suspend tabs, go to lock screen, receive interruptions, and switch from Wi-Fi to cellular. A page refresh / device switch should not inadvertently wipe permanent roster unlocks, explored percentages, mystery components or Hall of Legends records. Details of account/cloud save, local saves, server data store and co-op rejoin remain open.

# GitHub→Railway deployment acceptance test

1. Owner connects the intended GitHub repo and deployment branch to a Railway project.

2. Claude writes a small, working browser-game change in the repository, and pushes/merges according to the agreed workflow.

3. Railway receives the commit, successfully builds it, and reports a completed deployment.

4. Open the actual deployed URL on iPhone Safari (and optionally an installed PWA if later selected). Verify input, scaling, orientation and touch flow.

5. Confirm a subsequent committed update changes the live page after auto-deploy.

6. Test a mobile-initiated co-op session from deployed URL if/when networking exists, and confirm the performance and reconnection policies.

7. Confirm failed builds or broken commits have an understandable deployment history and recoverable previous version. Exact rollback policy and branch/environment configuration are open.

Until tested, label this pipeline CONFIRMED INTENDED WORKFLOW, NOT VERIFIED ACTIVE DEPLOYMENT.

# First useful playable slice

Do not begin with every proposed world region and asset. The smallest proof should run smoothly in iPhone browser from Railway URL: a tiny moving sprite, platforms, jump/attack/grab, one copy/drop interaction, one interactable, one route between rooms, one simple alarm interruption, a brief knockback test, and later the Cantina character tap/party swap. Add networked co-op and escalation incrementally. This is implementation advice, not an owner-set mandatory release sequence.

# Status and routing

CONFIRMED: iPhone browser/webapp is primary; optional computer browser support; Claude authors in GitHub; owner will configure GitHub→Railway autodeployment to a play URL; no NPC AI; game design remains gameplay-first.

NOT YET VERIFIED: GitHub repo and its URL; Railway app and its public URL; automatic deployment configured or functioning; engine, server, branch, domain, CI/CD workflows; input orientation and final on-screen controls; persistence and multiplayer architecture.

See 00 START HERE, 11 Decision Register, 24 Architecture, 06 Online Co-op, 05 Character Party, 10 Visual Direction, and shared project changelog.
