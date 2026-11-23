# Copies the delivered sound-effects pack (A01-01) from the design-library
# mirror into assets/audio/, the game's own copy: mono 16-bit WAV at the
# pack's 44.1 kHz, leading and trailing near-silence trimmed, a 10 ms fade
# at the end so a trim never clicks. Standard library only.
#
#   python3 -I src/client/audio/prepare-pack.py
#
# INTENT: WAV, not OGG: iPhone Safari does not reliably decode OGG Vorbis
# (docs/mechanisms/sound.md). Only the files a content/sounds/ entry names
# are copied, so unused cues cost no download.
import array, json, os, sys, wave

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
PACK = os.path.join(ROOT, 'docs/design-library/03-visual-direction-and-assets/audio/a01-01-first-sfx-pack/a01-01-complete')
OUT = os.path.join(ROOT, 'assets/audio')
THRESHOLD = 90  # of 32767: quieter than this at either end is cut

def wanted():
    names = set()
    d = os.path.join(ROOT, 'content/sounds')
    for f in sorted(os.listdir(d)):
        if f.endswith('.json'):
            with open(os.path.join(d, f)) as fh:
                for p in json.load(fh).get('files', []):
                    names.add(os.path.basename(p))
    return sorted(names)

def prepare(name):
    with wave.open(os.path.join(PACK, name)) as w:
        ch, width, rate, n = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
        raw = w.readframes(n)
    if width != 2:
        sys.exit(f'{name}: expected 16-bit samples, got {8 * width}-bit')
    s = array.array('h', raw)
    if sys.byteorder == 'big':
        s.byteswap()
    if ch > 1:  # mix down to mono
        s = array.array('h', (int(sum(s[i:i + ch]) / ch) for i in range(0, len(s), ch)))
    loud = [i for i, v in enumerate(s) if abs(v) > THRESHOLD]
    if not loud:
        sys.exit(f'{name}: silent')
    start = max(0, loud[0] - int(rate * 0.002))
    end = min(len(s), loud[-1] + int(rate * 0.01))
    s = s[start:end]
    fade = min(len(s), int(rate * 0.01))
    for k in range(fade):
        i = len(s) - fade + k
        s[i] = int(s[i] * (1 - (k + 1) / fade))
    if sys.byteorder == 'big':
        s.byteswap()
    with wave.open(os.path.join(OUT, name), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(s.tobytes())
    return len(s) * 2 + 44

os.makedirs(OUT, exist_ok=True)
total = 0
for name in wanted():
    total += prepare(name)
print(f'{len(wanted())} files, {total} bytes, in assets/audio/')
