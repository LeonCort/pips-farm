"""List the names engine files take from game files.

    python3 tools/refs.py [farm]        engine files that use names declared in that game's files
    python3 tools/refs.py farm --strict exit 1 when an engine file uses a game name that is
                                    not listed in src/engine/contract.txt

All script files share one scope, so nothing stops an engine file from using a farm name;
this check does. src/engine/contract.txt lists the names the engine still takes from a
game; the list should only shrink. The scan is textual (strings and comments are skipped), so a local
variable that happens to share a game name is counted too: rename it if that happens.
"""
import os, re, sys, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def files_of(game):
    d = os.path.join(ROOT, 'src', game)
    names = [l.strip() for l in open(os.path.join(d, 'manifest.txt')) if l.strip() and not l.lstrip().startswith('#')]
    return [(n, open(os.path.join(d, n)).read()) for n in names]


def decls(s):
    out = set()
    for line in s.split('\n'):
        m = re.match(r'(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)', line)
        if m:
            out.add(m.group(1)); continue
        m = re.match(r'(?:const|let|var|class)\s+(.*)', line)
        if not m:
            continue
        rest = m.group(1)
        mm = re.match(r'\s*\{([^}]*)\}\s*=', rest)
        if mm:
            out.update(re.findall(r'[A-Za-z_$][\w$]*', mm.group(1)))
            continue
        # top-level names before '=' at bracket depth 0
        depth, start = 0, 0
        parts = []
        for i, ch in enumerate(rest):
            if ch in '([{': depth += 1
            elif ch in ')]}': depth -= 1
            elif ch == ',' and depth == 0:
                parts.append(rest[start:i]); start = i + 1
            elif ch == ';' and depth == 0:
                break
        parts.append(rest[start:])
        for p in parts:
            mm = re.match(r'\s*([A-Za-z_$][\w$]*)\s*(=|$)', p)
            if mm:
                out.add(mm.group(1))
    return out


def strip(s):
    s = re.sub(r'/\*.*?\*/', ' ', s, flags=re.S)
    s = re.sub(r"'(?:\\.|[^'\\\n])*'|\"(?:\\.|[^\"\\\n])*\"", '""', s)
    s = re.sub(r'`(?:\\.|[^`\\])*`', '""', s)
    return s


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    game = args[0] if args else 'farm'
    files = files_of(game)
    eng, own = {}, {}
    for n, s in files:
        for d in decls(s):
            (eng if n.startswith('../engine/') else own).setdefault(d, n)
    game_names = {d: f for d, f in own.items() if d not in eng and len(d) > 1}
    cpath = os.path.join(ROOT, 'src', 'engine', 'contract.txt')
    contract = set()
    if os.path.exists(cpath):
        contract = {l.split()[0] for l in open(cpath) if l.strip() and not l.lstrip().startswith('#')}
    total, new = 0, set()
    for n, s in files:
        if not n.startswith('../engine/'):
            continue
        words = re.findall(r'(?<![\w$.])([A-Za-z_$][\w$]*)\b(?!\s*:(?!:))', strip(s))
        c = collections.Counter(w for w in words if w in game_names)
        if c:
            total += len(c)
            new.update(k for k in c if k not in contract)
            print('%-22s %s' % (n[10:], ', '.join(('%s(%d)' if k in contract else 'NEW:%s(%d)') % (k, v) for k, v in c.most_common())))
    print(total, 'engine uses of', game, 'names;', len(contract), 'names in src/engine/contract.txt')
    if new:
        print('not in the contract:', ', '.join(sorted(new)))
    if '--strict' in sys.argv and new:
        sys.exit(1)


if __name__ == '__main__':
    main()
