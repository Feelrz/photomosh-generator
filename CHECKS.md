# Validation — v1.10.0

## Passed

- JavaScript syntax; 215 unique static HTML IDs; embedded VT323; identical index and standalone app.
- Existing creative, JPEG, analog and paranormal smoke suites. Original Signal Cooker pixel fixture remains unchanged.
- Complete application startup in JSDOM + native Skia Canvas: no unexpected console/runtime errors. One expected WebGL-unavailable warning selects the Canvas fallback.
- Empty images, light startup, font UI, every effect switch off and every range at its declared minimum. Theme switching and neutral source pixels remain correct.
- Existing source load/remove, built-in/custom presets, full/empty project imports, Cooker, analog/JPEG/paranormal composition, Freeze, masks/keyframes, locked randomization and malformed-project rejection.
- Native PNG and 1080px JPEG encoding. Mock recorder start/stop/clear and stream cleanup; mock bytes are not claimed to be video encoding.
- JPEG checkbox activation has a visibly damaged recipe and Mix=100. CRUSHED CODEC changes about 61% of fixture pixels; ACID LEAK and FULL COLLAPSE change over 99% (RGB difference threshold 24/765). Fixed settings/seed are deterministic; Mix=0 bypasses. Animated corruption changes across time.
- Same-source Possession and empty-text Broadcast visibly change the source. All five Paranormal effects produce different frames over time. Dead Pixel Colony at 99 destroys over 70% of fixture pixels to near-black. GRAVITY ROT moves image-colored dither fragments downward.
- Paused-photo Live motion starts/stops, stops at zero/off, and creates no history entries.
- Undo/Redo: source addition, grouped slider gestures, repeatable restoration, redo branch invalidation, independent mask copies, keyframes, Zero effects, preset import and project load. Native text-field shortcuts are preserved.
- New JPEG/dither/motion settings round-trip through presets and projects; older presets reset absent additions to neutral. Exported paused PNG pixels exactly match the composited preview.
- Rendered Canvas effect images were inspected, including coarse blocks, acid color, intrusion, cursed broadcast, near-total colony collapse and falling dither. `tests/evidence/` contains synthetic effect frames and measurements, not browser UI screenshots. No sample is loaded into the app.

## Performance changes

Static source/settings reuse the DCT result. JPEG animation uses a lighter held-block/chroma pass, and burst tearing is rasterized once instead of repeatedly drawing large crops. Idle animation is capped at 18 updates/second and stops in hidden tabs; this is an upper limit, not a guaranteed frame rate. In the native test harness, warmed JPEG animation was about 20–34 ms/frame versus roughly 0.7–0.8 seconds when recomputing the DCT. These are local harness observations, not browser benchmarks. Combined effects, cold renders and high Cooker iterations can still be expensive.

## Browser verification remains incomplete

The browser environment rejected local app navigation under its URL security policy. No alternate navigation or browser workaround was used. Actual WebGL rendering, rendered mobile/desktop layout, browser console, MP4/WebM codecs, audio synchronization, corrupted-JPEG native browser decoding and download dialogs remain unverified.

Responsive CSS was reviewed: toolbar/history controls wrap; new buttons wrap; form controls allow shrinking; Paranormal becomes one column at 600px and below. Existing desktop/tablet/mobile breakpoints remain. This is source review, not a rendered responsive sign-off. Do not describe this build as perfect or fully browser-verified.

## Reproduce

The app itself needs no npm dependency or server. For tests, use Node 20+:

```sh
npm test
npm install
npm run test:runtime
npm run test:advanced
```

The smoke tests are dependency-free. Runtime tests use jsdom 26.1.0 and @napi-rs/canvas 0.1.100. The advanced harness registers the embedded VT323 font in native Canvas, creates its own fixture and writes evidence into `tests/evidence/`.

## Manual checks remaining

Open the standalone HTML in Chrome/Brave. Check light and dark at 1440, 1024, 768 and 390px widths. Verify no clipping, readable collapsed headers, Undo/Redo focus and keyboard shortcuts. Load a photo, enable each new effect separately, pause/resume Live motion, scrub, Play, Freeze and export. Try presets, mask painting, undo/redo, JPEG table/byte controls and combined Cooker effects. Inspect the real browser console. Record WebM and supported MP4, and test audio sync with a local file.

## Retained limitations

- Canvas fallback approximates the WebGL mutation core; hardware behavior varies.
- High-resolution stills scale preview-sized overlay effects.
- MP4 requires browser support. GIF/MKV remain unsupported; no misleading extension renaming.
- Audio media is not embedded in projects or recorded video.
- Quantizer controls target custom luminance DCT, not every JPEG stage. Native byte decoding varies across platforms and has a fallback.
- Undo history is session-only, bounded to 24 steps / approximate 80 MiB (minimum two states). Large retained source images may exceed that soft budget. Audio-file loading, theme and the Hunter collection are outside edit history.
