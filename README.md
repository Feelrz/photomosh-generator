# PhotoMosh Studio v1.8.2

Open `standalone/PhotoMosh-Studio.html` in a modern Chromium browser. No server or CDN is required.

The Presets section under the built-in looks saves shareable JSON containing mutation and display settings, without source photos, audio, or painted masks. Import a preset from someone else to apply those settings. GHOST PROTOCOL generates a randomized look that can then be saved as a preset.

Video recording offers WebM and MP4. MP4 works only when supported by the browser's MediaRecorder; WebM is recommended. GIF and MKV are not supported in this offline build because they require a separate encoder. Still exports remain PNG and JPEG.

Read CHECKS.md for verification status.

Presets can be collapsed using the // PRESETS heading. Save and Import remain beside the heading, and GHOST PROTOCOL replaces the former wide ABSURD MAX position. ABSURD MAX remains in the built-in grid after Y2K tape crush.

## Paranormal Signal (v1.8.2)

Open the collapsed **PARANORMAL SIGNAL** section to enable any of four effects. Each starts at zero to preserve older projects. SIGNAL POSSESSION reveals an existing source DNA in bright areas, shadows, or edges. CURSED BROADCAST overlays user text. GLITCH BURST damages a chosen timeline point. DEAD PIXEL COLONY grows clustered black defects through the sequence. The overlay appears in still exports and video recordings; settings are saved with projects and shared presets.

Run `node tests/paranormal-smoke.cjs` for focused logic checks. Browser visual QA is still required before release.

The ON/OFF switch beside PARANORMAL SIGNAL bypasses all four effects without changing their sliders. Each effect has an individual checkbox. Presets and projects retain switch states. PRESETS, PARANORMAL SIGNAL, and Export use matching disclosure arrows.

Scanlines now use a soft, nearly stationary raster. Tracking displaces actual image rows with smooth time variation and bottom head-switch damage. Existing controls remain available.

## Modulation and Signal Cooker

Both modules start disabled. Enable MODULATION, choose a target and waveform, then play or scrub the timeline. Rate is cycles per second. Depth is modulation around the base slider, clamped to the target's range. Modulation follows timeline position and does not edit the base slider.

SIGNAL COOKER repeatedly processes each result using edge emphasis, channel drift, contrast and quantization. Heat, Passes, Crush and Mix shape the result. Start with 3 passes; high values cost more render time. This is an original effect inspired by iterative degradation, not an implementation of proprietary Fryer internals. Its preview-sized output is included in still/video composition; still exports scale this layer. Project and preset files include these settings.

## JPEG Damage

JPEG DAMAGE combines 8×8 luminance DCT quantization, coefficient errors, block displacement and chroma averaging with an optional native JPEG encode/decode stage. Enable it and adjust Compression, Corruption, Color bleed, Seed and Mix. Animate corruption uses timeline position.

New controls:
- **Broken bytes** changes up to 128 eligible entropy-scan bytes in an actual browser-encoded JPEG. Headers, markers and stuffed-byte pairs remain intact. Invalid decodes and a 2-second decode timeout fall back to the block effect. This is not a guarantee against every browser failure.
- **Override one entry** enables QTC Position (0–63, row-major) and QTC Value (1–255).
- **Random entries** changes 0–64 unique quantizer entries, independently of that checkbox. Values range from 1 through Max random value and are applied after the single override.

Quantizer controls affect the custom luminance DCT stage, not the browser encoder's JPEG table. This does not implement every JPEG algorithm stage or the reference plugin's unspecified advanced/broken tools. Browser encoders and decoders may produce different results across platforms.

Settings persist in presets/projects. Processing is limited to 384px on the longest side; still export scales the effect layer. Byte decoding is asynchronous: playback can show the most recently decoded frame for unchanged settings while a new decode runs. Still export waits for the paused frame. Performance and real browser exports require visual QA; see CHECKS.md.
Live site: https://feelrz.github.io/photomosh-generator/
