U08-01 — iPhone touch control buttons
STATUS: DELIVERABLE / AUTO-APPROVED FOR PROTOTYPING

Six original game UI icons (Left, Right, Jump, Attack, Grab/Throw, Special) at exactly 24x24 native RGBA pixels. Each has a normal and pressed variant. Choose individual PNGs, 48x24 strips, or combined 144x48 atlas. JSON manifest defines all filenames, frame rectangles and atlas layout. Color treatment: quiet GBA-like, translucent pale controls, dark outlines.

IMPORTANT: These are graphical controls, not touch logic. A browser app should use pointer/touch event handlers to translate presses and arrange targets with enough mobile CSS hit area (e.g., invisible hit box larger than the 24-pixel artwork). Avoid smoothing; use nearest-neighbor image-rendering. Test on physical iPhone in landscape.

These are deliberately small, complete and precise rather than large concept art. They can be used immediately and iterated later. No separate user approval gate.
