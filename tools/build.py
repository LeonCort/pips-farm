"""Build the game pages from src/.

    python3 tools/build.py            build into the repo root (bondgard.html, index.html)
    python3 tools/build.py <outdir>   build somewhere else (check.py uses this)

The pages get app-ver "dev"; run stamp.py before committing so the iPad sees an update.
Also writes build/test-bondgard.html (three.js from the repo root, no web fonts) for Playwright.
"""
import os, sys, shutil, subprocess, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')


def run(*args, cwd):
    subprocess.run([sys.executable, *args], cwd=cwd, check=True, stdout=subprocess.DEVNULL)


def build(out):
    os.makedirs(out, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        w = os.path.join(tmp, 'src')
        shutil.copytree(SRC, w)
        # the farm: assemble the script, wrap it into a page, add the page head
        run('care/assemble.py', 'van', cwd=w)
        run('care/build.py', cwd=w)
        run('torepo2.py', 'care/care.html', os.path.join(out, 'bondgard.html'), '.', cwd=w)
        # the start page
        run('start/build.py', os.path.join(out, 'index.html'), cwd=w)
        test = open(os.path.join(w, 'care/test.html')).read().replace('../game/vend/package/build/three.min.js', '../three.min.js')
    os.makedirs(os.path.join(ROOT, 'build'), exist_ok=True)
    open(os.path.join(ROOT, 'build', 'test-bondgard.html'), 'w').write(test)


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else ROOT
    build(out)
    print('built into', out)
