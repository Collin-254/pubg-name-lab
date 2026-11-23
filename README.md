# PUBG Name Lab

An independent, lightweight reference website for PUBG Mobile nickname characters, Unicode symbols, and naming guidance.

## Features

- **Name generator at the top of the page:** type a name and get 28 styled variants (fancy letters, frames, symbols, combinations) with one-tap copy, a "Tweak" button that opens any result in the builder, and the last name remembered in the browser
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
2. Upload everything in this folder to the repository root, keeping the `icons/` folder: `index.html`, `404.html`, `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `og-image.png`, `site.webmanifest`, `robots.txt`, `vercel.json`, `icons/` and `README.md`.
3. In Vercel, choose **Add New → Project**, import `pubg-name-lab`, and deploy.
4. No framework preset, build command, or output directory is needed for this static HTML site.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | The whole site (HTML, CSS and JS in one file) |
| `404.html` | Custom not-found page (Vercel serves it automatically) |
| `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `icons/` | Original crosshair icon set, including a maskable icon for Android |
| `og-image.png` | 1200×630 social preview image |
| `site.webmanifest` | Lets the site be installed to a home screen |
| `robots.txt` | Allows crawling |
| `vercel.json` | Security headers (CSP, nosniff, frame denial) and icon caching |

After you have a domain, add a canonical link in `index.html` and change the `og:image` and `twitter:image` values to absolute URLs (for example `https://your-domain.com/og-image.png`), because social networks do not resolve relative image paths. Add a `sitemap.xml` at the same time if you want one.

## Accuracy note

PUBG MOBILE does not publish a complete public whitelist of accepted nickname characters. The character library is a Unicode reference, not a guarantee that every character will be accepted or rendered by the game. Always test the exact nickname in-game before using a Rename Card.

## Disclaimer

PUBG NAME LAB is an independent reference project and is not affiliated with, endorsed by, or operated by PUBG MOBILE, Tencent, or KRAFTON.
