# PUBG Name Lab

An independent, lightweight reference website for PUBG Mobile nickname characters, Unicode symbols, and naming guidance.

## Features

- Searchable character library (800 glyphs in 24 groups): Latin letters, digits, selected writing systems, decorative symbols, brackets, arrows, and five Mathematical Alphanumeric styles
- Search by character, script name, keyword or Unicode code point (`U+2605`); category chips with live counts; "Copy set" for any group
- Character inspector: code point, Unicode block, UTF-16 and UTF-8 size, HTML entity, JS escape and NFKC result
- Nickname builder: inserts at the cursor, grapheme-aware delete, live preview, saved names (kept in this browser only)
- Local checks that flag numeric-only names, invisible characters, emoji, combining marks, lookalike scripts and NFKC changes, clearly labelled as heuristics
- Length estimates for visible characters, code points, UTF-16 units and UTF-8 bytes
- Naming guidance that separates official documentation from unverified compatibility claims
- Links to official PUBG MOBILE and Unicode references
- Light and dark themes (follows the system, remembers your choice), keyboard navigation in the library (arrow keys, Home/End), reduced-motion support

## Run locally

No build tools or dependencies are required. Open `index.html` in a modern browser.

## Deploy on Vercel

1. Create a public GitHub repository named `pubg-name-lab`.
2. Upload `index.html` and `README.md` to the repository root.
3. In Vercel, choose **Add New → Project**, import `pubg-name-lab`, and deploy.
4. No framework preset, build command, or output directory is needed for this static HTML site.

## Accuracy note

PUBG MOBILE does not publish a complete public whitelist of accepted nickname characters. The character library is a Unicode reference, not a guarantee that every character will be accepted or rendered by the game. Always test the exact nickname in-game before using a Rename Card.

## Disclaimer

PUBG NAME LAB is an independent reference project and is not affiliated with, endorsed by, or operated by PUBG MOBILE, Tencent, or KRAFTON.
