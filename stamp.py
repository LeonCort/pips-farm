"""Run before each commit: gives the game pages a new version so the in-game
'Check for updates' button can tell the iPad there is something newer."""
import os, re, json, time
here = os.path.dirname(os.path.abspath(__file__))
v = time.strftime('%Y%m%d%H%M%S', time.gmtime())
for f in ('butik.html', 'bondgard.html', 'zoo.html', 'isle.html'):
    p = os.path.join(here, f); s = open(p).read()
    s, n = re.subn(r'<meta name="app-ver" content="[^"]*">', '<meta name="app-ver" content="%s">' % v, s)
    assert n == 1, f
    open(p, 'w').write(s)
json.dump({'v': v}, open(os.path.join(here, 'version.json'), 'w'))
print(v)
