import os
here = os.path.dirname(os.path.abspath(__file__))
r = lambda f: open(os.path.join(here, f)).read()
def chunk():
    """loading screen markup: goes first in <body> so it paints before the big scripts"""
    return '<style>\n' + r('boot.css') + '</style>\n<div id="boot" role="img" aria-label="Loading"></div>\n<script>\n' + r('boot.js') + '\n' + r('load.js') + '\n</script>\n'
HOOK_OLD = 'if (dt > 0) step(dt);'
HOOK_NEW = 'if (dt > 0) { step(dt); if (window.PipsBoot) PipsBoot.frame(); }'
def hook(s):
    assert s.count(HOOK_OLD) == 1, 'frame hook'
    return s.replace(HOOK_OLD, HOOK_NEW)
