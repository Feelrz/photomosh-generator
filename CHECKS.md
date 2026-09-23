# Validation — v1.8.2

- JavaScript syntax and unique DOM IDs: PASS.
- JPEG pixel tests: PASS — deterministic seeds, edge blocks, alpha, zero bypass, neutral reconstruction.
- Quantizer tests: PASS — single override, independent random entries, override order, determinism.
- Scan byte tests: PASS — exact count, immutable input, header/marker preservation, invalid segment rejection.
- Mocked async decode: PASS — success, rejection fallback, dimensions/alpha snapshot, cached failure, URL cleanup, bypass.
- Creative, Analog and Paranormal regression suites: PASS.
- Index/standalone equality and ZIP integrity: PASS.
- Browser runtime, console, visual quality, responsive layout and real exports: NOT VERIFIED. The available browser cannot access the local app. Mock tests do not substitute for real browser decoding.

Before release, check desktop and narrow mobile widths; JPEG toggles and all QTC controls; preset/project round trips; playback and scrubbing; broken-byte decode rejection; PNG/JPEG stills and supported video exports. Confirm no console errors. High-byte settings can yield different decodes across platforms.
