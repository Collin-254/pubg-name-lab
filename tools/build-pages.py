#!/usr/bin/env python3
"""Builds the static HTML pages from tools/pages/*.html (page bodies) plus the shared header/footer below.
Run from anywhere:  python3 tools/build-pages.py
You only need this if you change a page body or the header/footer. The generated .html files are committed."""
import os, re, json, html

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SITE = 'https://pubg-name-lab.vercel.app'
BASE = ['js/core.js', 'data/unicode-blocks.js', 'js/styles.js', 'js/unicode.js', 'js/compat.js', 'js/ui.js']

# file, nav key, title, description, extra scripts
PAGES = [
  ('index.html', 'home', 'PUBG Name Lab — Stylish Name Generator, Ideas & Unicode Tools',
   'Type your name and copy stylish PUBG Mobile nickname styles. Generate ideas, browse a curated name collection, build a name in Studio and inspect every character, with honest compatibility notes.',
   ['js/library-data.js', 'js/names-data.js', 'js/words-data.js', 'js/page-home.js']),
  ('discover.html', 'discover', 'PUBG Name Generator — Discover Nickname Ideas by Theme | PUBG Name Lab',
   'Generate PUBG Mobile nickname ideas by theme: tactical, dark, royal, minimalist, funny, anime, esports and aesthetic. Lock parts you like, regenerate the rest, add optional decorations and set a length.',
   ['js/names-data.js', 'js/words-data.js', 'js/page-discover.js']),
  ('names.html', 'names', 'PUBG Name Ideas Collection — Curated Nicknames to Copy | PUBG Name Lab',
   'A hand-curated collection of PUBG Mobile nickname ideas: pro, esports, dark, minimalist, funny, aesthetic, anime, clan, symbol and unique-looking. Search, filter, sort, copy, save and inspect each one.',
   ['js/names-data.js', 'js/page-names.js']),
  ('studio.html', 'studio', 'PUBG Nickname Studio — Build a Stylish Name | PUBG Name Lab',
   'Build a PUBG Mobile nickname from parts: mix letter styles, add a frame, prefix, suffix and side symbols, undo changes, check every character and copy the result.',
   ['js/library-data.js', 'js/page-studio.js']),
  ('inspect.html', 'inspect', 'Unicode Name Inspector — Check Every Character in a Nickname | PUBG Name Lab',
   'Paste a nickname and see each character: code point, Unicode name, script, UTF-8 and UTF-16, normalisation, invisible or lookalike warnings and mixed-script checks.',
   ['js/page-inspect.js']),
  ('library.html', 'library', 'PUBG Character Library — 2,700+ Symbols and Unicode Characters | PUBG Name Lab',
   'Search and copy 2,700+ Unicode characters for PUBG Mobile nicknames: styled letters, symbols, brackets, other alphabets and blank characters, each with its code point and evidence level.',
   ['js/library-data.js', 'js/page-library.js']),
  ('compatibility.html', 'compat', 'PUBG Name Compatibility — What Is Known, Reported and Tested | PUBG Name Lab',
   'What is official, what is community-reported and what has been verified for PUBG Mobile nicknames. Run your own in-game tests, keep a log and submit results.',
   ['js/library-data.js', 'js/page-compat.js']),
  ('guide.html', 'guide', 'PUBG Nickname Rules & Unicode Guide — What the Evidence Says | PUBG Name Lab',
   'Official PUBG Mobile nickname rules, what nobody has published, why fancy characters fail, how text is counted, and a checklist before you spend a Rename Card.',
   ['js/page-guide.js']),
  ('mynames.html', 'mynames', 'My Saved PUBG Names | PUBG Name Lab',
   'Your saved PUBG Mobile nicknames, stored in this browser only. Copy, inspect, open in Studio, record in-game test results, export or import.',
   ['js/library-data.js', 'js/page-mynames.js']),
]
NAV = [('discover', 'Discover', 'discover.html'), ('names', 'Collection', 'names.html'), ('studio', 'Studio', 'studio.html'),
       ('inspect', 'Inspect', 'inspect.html'), ('library', 'Library', 'library.html'), ('compat', 'Compatibility', 'compatibility.html'), ('guide', 'Guide', 'guide.html')]
HEART = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" style="fill:none;stroke:currentColor;stroke-width:2"><path d="M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.700 4 4.500 7.200 4.500c2 0 3.600 1.100 4.800 2.900 1.200-1.800 2.800-2.900 4.800-2.900 3.200 0 5.500 3.200 4.400 6.600-1.700 4.800-9.200 9.400-9.200 9.400Z"/></svg>'

def head(fn, title, desc):
    url = SITE + '/' + ('' if fn == 'index.html' else fn)
    e = html.escape
    return f'''<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#f2eee3">
<title>{e(title)}</title>
<meta name="description" content="{e(desc, quote=True)}">
<meta name="application-name" content="PUBG Name Lab">
<meta name="apple-mobile-web-app-title" content="Name Lab">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/icons/icon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="canonical" href="{url}">
<meta property="og:url" content="{url}">
<meta property="og:site_name" content="PUBG Name Lab">
<meta property="og:type" content="website">
<meta property="og:title" content="{e(title, quote=True)}">
<meta property="og:description" content="{e(desc, quote=True)}">
<meta property="og:image" content="{SITE}/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="PUBG Name Lab: generate, collect, build and inspect PUBG Mobile nicknames.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{e(title, quote=True)}">
<meta name="twitter:description" content="{e(desc, quote=True)}">
<meta name="twitter:image" content="{SITE}/og-image.png">
<script>
try{{var t=localStorage.getItem('pnl-theme');if(t!=='dark'&&t!=='light')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name=theme-color]');if(m)m.content=t==='dark'?'#0f1210':'#f2eee3'}}catch(e){{}}
</script>
<link rel="stylesheet" href="css/site.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
'''

def header(key):
    cur = ' aria-current="page"'
    links = ''.join('<a href="%s"%s>%s</a>' % (h, cur if k == key else '', t) for k, t, h in NAV)
    fav = '<a class="navfav" href="mynames.html"%s aria-label="My names">%s<span class="favcount" id="favCount" hidden>0</span></a>' % (cur if key == 'mynames' else '', HEART)
    return f'''<header class="site">
  <div class="wrap bar">
    <a class="brand" href="/" aria-label="PUBG Name Lab, home">
      <span class="mark" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg></span>
      <span>PUBG <em>Name Lab</em></span>
    </a>
    <nav class="nav" aria-label="Primary">{links}{fav}
      <button class="btn iconbtn" id="themeBtn" type="button" aria-label="Switch colour theme">
        <svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"/></svg>
        <svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      </button>
    </nav>
  </div>
</header>
<main id="main">
'''

FOOT = '''</main>
<footer>
  <div class="wrap">
    <div>
      <p><strong>PUBG NAME LAB</strong> · An independent nickname toolkit. Not affiliated with, endorsed by, or operated by PUBG MOBILE, Tencent or KRAFTON.</p>
      <p>Valid Unicode is not the same as accepted by the game. The in-game name field is the final test, and the <a href="compatibility.html">Compatibility</a> page shows exactly what is known, reported or untested.</p>
    </div>
    <nav aria-label="Footer"><a href="discover.html">Discover</a><a href="names.html">Collection</a><a href="studio.html">Studio</a><a href="inspect.html">Inspect</a><a href="library.html">Library</a><a href="compatibility.html">Compatibility</a><a href="guide.html">Guide</a><a href="mynames.html">My names</a></nav>
  </div>
</footer>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
'''

def build():
    sitemap = []
    for fn, key, title, desc, extra in PAGES:
        src = os.path.join(ROOT, 'tools', 'pages', fn)
        body = open(src, encoding='utf-8').read()
        scripts = []
        for s in BASE + extra:
            if s not in scripts: scripts.append(s)
        # data files that page scripts rely on must come before them
        order = {'js/library-data.js': 0, 'js/names-data.js': 0, 'js/words-data.js': 0}
        pre = [s for s in scripts if s in order]
        rest = [s for s in scripts if s not in order]
        # library/names/words data only need core (+styles for names), so place them after styles
        idx = rest.index('js/styles.js') + 1
        ordered = rest[:idx] + pre + rest[idx:]
        tags = ''.join(f'<script src="{s}"></script>\n' for s in ordered)
        out = head(fn, title, desc) + header(key) + body.strip('\n') + '\n' + FOOT + '<noscript><div class="wrap"><p>This site needs JavaScript to generate and inspect names.</p></div></noscript>\n' + tags + '</body>\n</html>\n'
        open(os.path.join(ROOT, fn), 'w', encoding='utf-8').write(out)
        sitemap.append(SITE + '/' + ('' if fn == 'index.html' else fn))
    today = '2026-11-24'
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for u in sitemap:
        pr = '1.0' if u.endswith('.app/') or u == SITE + '/' else '0.8'
        xml += f'  <url><loc>{u}</loc><lastmod>{today}</lastmod><changefreq>monthly</changefreq><priority>{pr}</priority></url>\n'
    xml += '</urlset>\n'
    open(os.path.join(ROOT, 'sitemap.xml'), 'w').write(xml)
    print('built', len(PAGES), 'pages + sitemap')

if __name__ == '__main__':
    build()
