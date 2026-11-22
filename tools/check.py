"""Rebuild the pages from src/ and compare them with the committed ones.

    python3 tools/check.py

Passes when every page is identical apart from the version stamp (app-ver).
Run it before every commit that should not change the game.
"""
import os, re, sys, tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import build, ROOT

PAGES = ('bondgard.html', 'zoo.html', 'index.html')
ver = lambda s: re.sub(r'<meta name="app-ver" content="[^"]*">', '', s)

with tempfile.TemporaryDirectory() as tmp:
    build(tmp)
    bad = 0
    for p in PAGES:
        new = ver(open(os.path.join(tmp, p)).read())
        old = ver(open(os.path.join(ROOT, p)).read())
        if new == old:
            print('same   ', p, len(new))
            continue
        bad += 1
        i = next((i for i in range(min(len(new), len(old))) if new[i] != old[i]), min(len(new), len(old)))
        print('DIFFERS', p, 'at char', i)
        print('  built: ', repr(new[max(0, i - 120):i + 120]))
        print('  commit:', repr(old[max(0, i - 120):i + 120]))
sys.exit(1 if bad else 0)
