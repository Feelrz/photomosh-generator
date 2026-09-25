# PhotoMosh Studio v1.10.0

Open `standalone/PhotoMosh-Studio.html` in a modern Chromium browser. No server or CDN is required.

## Clean start (v1.9.0)

The app opens with no photos, no active effects, the embedded VT323 font, and light mode. Click **+ Add images** or **+ Add** to begin. The **Dark mode** slider switch supports keyboard focus and Space. Each fresh launch starts light; loading a saved project may restore its saved theme. Custom font upload and bundled demo photos were removed as requested.

All effect strengths, seeds and mixing amounts start at zero. Size/count controls keep valid minima: macroblock size 5px, decoder/Cooker iterations 1, snow size 0.5px, scanline spacing 2px, thickness 1px, brush size 8px, burst width 2%, and quantizer values 1. These values alone do not activate an effect. All effect switches, OSD and audio reaction/sync start off. A neutral core render now displays a clean image or clean source-to-target blend without baked-in distortion.

**Zero effects** stops playback/recording, clears effect strengths and keyframes, and keeps images, loaded audio and painted masks. **Clear images** removes the image sources and their transitions while keeping effect settings. You can remove the final image; export/play controls stay disabled until an image is added.

The display panel wraps in narrow layouts. Preview overlay compositing matches the export blend. Freeze output and Frame Hunter now capture the visible overlay. GHOST PROTOCOL respects locked core parameters. Project loading decodes/validates media before replacing the current state and supports empty projects. Recorder cleanup and temporary export GPU resource cleanup were improved.

Validation is documented in CHECKS.md. DOM/native Canvas tests are broader than the earlier smoke checks, but they are not a substitute for real WebGL, responsive browser, codec or audio-device testing.


The Presets section under the built-in looks saves shareable JSON containing mutation and display settings, without source photos, audio, or painted masks. Import a preset from someone else to apply those settings. GHOST PROTOCOL generates a randomized look that can then be saved as a preset.

Video recording offers WebM and MP4. MP4 works only when supported by the browser's MediaRecorder; WebM is recommended. GIF and MKV are not supported in this offline build because they require a separate encoder. Still exports remain PNG and JPEG.

Read CHECKS.md for verification status.

Presets can be collapsed using the // PRESETS heading. Save and Import remain beside the heading, and GHOST PROTOCOL replaces the former wide ABSURD MAX position. ABSURD MAX remains in the built-in grid after Y2K tape crush.

## Paranormal Signal (v1.10.0)

Open **PARANORMAL SIGNAL**, then switch on an individual effect or choose **DEAD AIR** / **CURSED TAPE**. An empty effect receives a visible starter recipe and enables Live motion. Startup remains empty, light and neutral; no effect starts by itself.

- **Signal Possession**: animated mirrored intrusion, negative color, drifting displacement and bright/shadow/edge reveal. It works with the same source or with another DNA image.
- **Cursed Broadcast**: ghosted negative image, damaged transmission bands, noise and displaced text. An empty text field cycles through built-in lost-transmission phrases.
- **Glitch Burst**: tearing, channel offsets, colored boundaries and missing signal. Choose a timeline hit or a repeating storm.
- **Dead Pixel Colony**: evolving clusters erase source pixels; surviving fragments slip downward. High Spread destroys most of the frame. Growth controls fragment motion.
- **GRAVITY ROT / Pixel Dither**: ordered color dithering, holes and image-colored tiles falling with acceleration and trails. Disintegration, Fall speed and Pixel size control the result.

**Live motion** animates a paused photo, including Still mode. Turn it off to freeze the current phase; **Play** animates from timeline time. Motion rate and Pattern seed affect Paranormal Signal; Gravity Rot also uses its own Fall speed. Rate/speed zero freezes the corresponding motion. Restart and timeline scrubbing reset the paused phase. Background tabs stop the idle animation.

A master OFF bypasses the section without changing its sliders. Individual switches preserve configured values; an effect with zero strength receives a starter when enabled. Stills, Freeze, Frame Hunter and recording include the same composite. All new controls persist in presets and projects; older imports reset absent controls to neutral.

PRESETS, PARANORMAL SIGNAL and Export retain matching collapse arrows. Scanlines and tracking retain their existing behavior.

## Undo / Redo

Use the toolbar beside Save project, **Ctrl/Cmd Z**, **Ctrl/Cmd Shift Z**, or **Ctrl Y**. History covers effect settings, presets/randomization, source add/remove/reorder, Freeze, painted masks, keyframes, Zero effects and project imports. A slider gesture or mask stroke is one action. A new edit discards the redo branch. Text fields keep their native text-editing shortcuts.

History is session-only, with up to 24 undo steps and an approximate 80 MiB retained-media budget (at least two snapshots are retained). Shared source images and unchanged masks are reused. Live animation and timeline scrubbing do not create undo entries. Theme, audio-file loading/playback and Frame Hunter's collection are outside edit history. Undo/Redo stops playback/recording before restoring a state.

## Modulation and Signal Cooker

Both modules start disabled. Enable MODULATION, choose a target and waveform, then play or scrub the timeline. Rate is cycles per second. Depth is modulation around the base slider, clamped to the target's range. Modulation follows timeline position and does not edit the base slider.

SIGNAL COOKER uses accumulated processing: every iteration reads the previous iteration's output. It starts disabled; existing controls and preset values remain available.

- **Iterations (1–24)**: number of accumulated processing passes (formerly Passes, same saved setting).
- **Heat**: master processing intensity; zero bypasses all Cooker processing.
- **Crush**: tonal quantization, reapplied every iteration.
- **Block damage**: seeded displacement of small image blocks.
- **Texture buildup**: fine noise introduced on each pass and processed by subsequent passes.
- **Color drift**: extra channel separation and drifting color bias.
- **Edge burn**: additional edge emphasis that intensifies with accumulation.
- **Damage seed**: reproducible variations of block damage, texture and color.
- **Mix**: blends the final accumulated output with the input once.

New damage controls start at zero. Heat, Crush and Mix now also start at zero for a clean session. These controls persist in presets/projects; old imports reset the additions to their neutral defaults. The saved `fryPasses` identifier remains compatible.

For a gentle start, try Heat 10, Iterations 2–3 and low damage controls. For dense damage, raise Iterations slowly. Heat 25, Crush 35, Block damage 25, Texture 12, Color drift 25 and Edge burn 18 can move from a crunchy treatment at 3 iterations to heavy destruction at 24. Results depend on the source.

The CPU processes up to 720px on the longest side. Identical input pixels/settings reuse a cached result; changed frames and parameters must be computed. High iterations can pause the interface and are not guaranteed to run in real time. The effect is included in still/video composition; still exports scale this layer. This is an original effect inspired by iterative degradation, not a recreation of proprietary Fryer internals.

## JPEG Damage

JPEG DAMAGE combines 8×8 luminance DCT quantization, coefficient errors, block displacement and chroma averaging with an optional native JPEG encode/decode stage. Enabling an empty JPEG effect now loads a visible **CRUSHED CODEC** recipe and sets Mix to 100. The **CRUSHED CODEC**, **ACID LEAK** and **FULL COLLAPSE** buttons provide progressively different destruction looks. Macroblock collapse holds coarse averaged/quantized tiles; Acid chroma clips and posterizes color differences into neon RGB damage. Mix = 0 is an explicit bypass.

The previous advanced controls remain available:

- **Broken bytes** changes up to 128 eligible entropy-scan bytes in an actual browser-encoded JPEG. Headers, markers and stuffed-byte pairs remain intact. Invalid decodes and a 2-second decode timeout fall back to the block effect. This is not a guarantee against every browser failure.
- **Override one entry** enables QTC Position (0–63, row-major) and QTC Value (1–255).
- **Random entries** changes 0–64 unique quantizer entries, independently of that checkbox. Values range from 1 through Max random value and are applied after the single override.

Quantizer controls affect the custom luminance DCT stage, not the browser encoder's JPEG table. This does not implement every JPEG algorithm stage or the reference plugin's unspecified advanced/broken tools. Browser encoders and decoders may produce different results across platforms.

Settings persist in presets/projects. Processing is limited to 384px on the longest side; still export scales the effect layer. Byte decoding is asynchronous: playback can show the most recently decoded frame for unchanged settings while a new decode runs. Still export waits for the paused frame. Performance and real browser exports require visual QA; see CHECKS.md.

Animate corruption changes held blocks and chroma at three pattern updates per timeline/Live-motion second. On a static photo the DCT result is cached; a lightweight temporal layer moves the damage without recalculating the entire transform on every tick. A changing source or effect setting invalidates the cache. Native byte decoding remains optional and asynchronous. Actual browser performance varies; this is not a real-time guarantee.

Run `npm run test:advanced` for native Canvas pixel, motion, history, backward-compatibility and exact PNG checks. Synthetic test renders live under `tests/evidence/`; they are never loaded as startup images.
