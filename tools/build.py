"""Build the game pages from src/.

    python3 tools/build.py            build into the repo root (bondgard.html, index.html)
    python3 tools/build.py <outdir>   build somewhere else (check.py uses this)

A game is its manifest: the script files listed there, glued in that order, with no
text patching. The page around it is the shared head, the CSS, the loading screen,
the game's body markup, three.js, the sound kit and the sound effects.

Pages get app-ver "dev"; run stamp.py before committing so the iPad sees an update.
Also writes build/test-<page>.html (three.js from the repo root, no web fonts) for Playwright.
"""
import os, sys, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
CDN_THREE = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
FONTS = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap'

GAMES = {
    'bondgard.html': {
        'title': 'Pips bondgård',
        'manifest': 'farm/manifest.txt',
        'body': 'farm/body.html',
        'css': ['engine/style.css', 'farm/style.css'],
    },
}

# the loading screen's frame hook lives in the loop file itself
SOUND = ['engine/sound/soundkit.js', 'engine/sound/sfx.js']
BOOT = ('engine/boot/boot.css', 'engine/boot/boot.js', 'engine/boot/load.js')
HEAD = 'engine/head.part'


def r(path):
    with open(os.path.join(SRC, path)) as f:
        return f.read()


def script(manifest):
    """the game script: every file in the manifest, in order (paths are relative to the manifest)"""
    base = os.path.dirname(manifest)
    names = [l.strip() for l in r(manifest).split('\n') if l.strip() and not l.lstrip().startswith('#')]
    return ''.join(r(os.path.join(base, n)) for n in names)


def loading_screen():
    """goes first in <body> so it paints before the big scripts"""
    css, js, load = (r(p) for p in BOOT)
    return '<style>\n' + css + '</style>\n<div id="boot" role="img" aria-label="Loading"></div>\n<script>\n' + js + '\n' + load + '\n</script>\n'


def body(g, three):
    css = ''.join(r(p) for p in g['css'])
    kit, sfx = (r(p) for p in SOUND)
    top = '<title>' + g['title'] + '</title>\n<link rel="stylesheet" href="' + FONTS + '">\n<style>\n' + css + '</style>'
    rest = ('\n' + loading_screen() + r(g['body']) + '<script src="' + three + '"></script>\n'
            + '<script>\n' + kit + '\n</script>\n<script>\n' + sfx + '\n</script>\n<script>\n' + script(g['manifest']) + '\n</script>\n')
    return top, rest


def page(g):
    top, rest = body(g, 'three.min.js')
    return r(HEAD) + top + '\n</head>\n<body>\n' + rest + '\n</body>\n</html>\n'


def test_page(g):
    top, rest = body(g, '../three.min.js')
    t = ('<meta name="claude:viewport-fit-sides" content="cover">\n' + top + rest).replace('rel="stylesheet"', 'rel="x"')
    return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + t + '</body></html>'


def build(out):
    os.makedirs(out, exist_ok=True)
    os.makedirs(os.path.join(ROOT, 'build'), exist_ok=True)
    for name, g in GAMES.items():
        with open(os.path.join(out, name), 'w') as f:
            f.write(page(g))
        with open(os.path.join(ROOT, 'build', 'test-' + name), 'w') as f:
            f.write(test_page(g))
    subprocess.run([sys.executable, os.path.join(SRC, 'start', 'build.py'), os.path.join(out, 'index.html')], check=True)


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else ROOT
    build(out)
    print('built into', out)
