# Changelog

## v1.8.2 — JPEG quantizers and scan bytes

- Added QTC override and independent seeded random quantizer entries.
- Added actual JPEG scan-byte mutation with decode rejection/timeout fallback.
- Retained alpha, cached asynchronous decode, and wait before still export.
- Persisted new controls in presets/projects; defaults preserve old settings.
- Added quantizer, byte structure and mocked async decode regression checks.

## v1.8.1 — JPEG Damage

- Added default-off JPEG-style DCT block quantization and corruption with color bleed, seed, mix and optional timeline animation.
- Integrated the effect after Signal Cooker and before tracking, with project/preset persistence.
- Added deterministic pixel regression tests.


## v1.8.0 — Modulation / Signal Cooker

- Added timeline-driven sine, triangle, pulse and random-step modulation with target, rate and depth.
- Added accumulating edge burn, color displacement and tonal crushing with iteration and mix controls.
- Added preset/project persistence and default-off compatibility.


## v1.7.2 — Analog tracking

- Replaced random transparent tracking strips with smoothly displaced image rows and edge wrapping.
- Added coherent bottom head-switch distortion.
- Softened scanlines and slowed the rolling luminance band; interlace now works independently of scanline strength.
- Fixed still export overlay inclusion when only head noise or other secondary display effects are enabled.


## v1.7.1 — Effect switches

- Added a master ON/OFF switch beside PARANORMAL SIGNAL and individual switches for all four effects.
- Switches bypass rendering while retaining slider values; their states persist in projects and presets.
- Standardized disclosure triangle dimensions and spacing for Presets, Paranormal Signal, and Export.


## v1.7.0 — Paranormal Signal

- Added SIGNAL POSSESSION, CURSED BROADCAST, GLITCH BURST, and DEAD PIXEL COLONY in a collapsible panel.
- Added their preview and export overlay rendering, preset/project persistence, and backward-compatible defaults.
- Added a focused effect smoke test.


## v1.6.3 — visible Presets arrow

- Added an explicit triangle before // PRESETS: ▼ when open, ▶ when closed.
- Preserved the collapsible section and all preset controls.


## v1.6.2 — compact preset shelf

- Made Presets collapsible, with Save and Import beside the heading.
- Put GHOST PROTOCOL in the full-width final preset slot and ABSURD MAX immediately after Y2K tape crush.
- Preserved preset JSON compatibility and existing effects.


## v1.6.1 — Presets together

- Moved Save, Import, and GHOST PROTOCOL directly beneath the built-in presets.
- Renamed visible controls and new JSON files to Preset; existing v1.6.0 template JSON remains importable.
- Kept the preset group together at narrower viewport widths.


## v1.5.4 — finer snow control

- Snow size now supports 0.5–6 in 0.25 increments. Values below 1 produce finer VHS grain without rounding away the setting.
- Preserved the default size of 2 and the existing project JSON setting.

## v1.3.0 — Watch Dogs / Errorhead UI pass

- Rebuilt the interface around a high-contrast black/white hacker-console aesthetic inspired by the supplied Watch Dogs 2 settings reference and Errorhead-style experimental web tools.
- Added a single electric-blue active selection state for the current control/help target.
- Added dotted / scanline background treatment, square panels, hard borders, console labels and stripped-down game-settings hierarchy.
- Added an interactive **Signal Surgery help panel**. Click or focus Topology or any mutation parameter to see what it does, what low/high values mean and a practical creative-use note.
- Added help entries for Fusion Strength, Topology Warp, Recursive Feedback, Frame Memory, Shape Contamination, Color Migration, Source Braid, Cross-DNA Continuity, Slit-scan Rupture, Cell Rupture, Chroma Surgery, CRT Curvature, Macroblock DNA, Chaos Modulation, Decoder Iterations and Seed.
- Added a local UI-font loader. VT323 was tested successfully and can be loaded from the user's own font file; the chosen font is stored locally in browser storage for later sessions.
- Existing rendering, video, Boomerang, VHS, Audio Reactor, masking, keyframes, Frame Hunter and export workflows remain intact.

## v1.2.0

- Added Boomerang playback, moving VHS/scanline/tracking effects, VHS deck OSD, Audio Reactor, cross-DNA continuity, CRT curvature and additional presets.

## v1.6.0 — Templates / GHOST PROTOCOL

- Added a Templates tab with JSON save and import, including validation and no embedded private media.
- Added GHOST PROTOCOL to generate random looks while preserving the existing source chain and masks.
- Added WebM / MP4 video format selection; MP4 is used only when natively supported by the browser.
