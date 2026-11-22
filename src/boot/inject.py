"""Add the loading screen to an already built repo page (used for butik.html, whose sources are not in pips-src-live):
python3 inject.py <page.html>"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from chunk import chunk, hook
p = sys.argv[1]; s = open(p).read()
assert 'id="boot"' not in s, 'already has the loading screen'
assert s.count('<body>\n') == 1
s = s.replace('<body>\n', '<body>\n' + chunk(), 1)
open(p, 'w').write(hook(s))
