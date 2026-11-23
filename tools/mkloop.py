import subprocess, sys, numpy as np, json
src, name = sys.argv[1], sys.argv[2]
SR = 44100
raw = subprocess.run(['ffmpeg','-v','error','-i',src,'-ac','2','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
a = np.frombuffer(raw, dtype=np.float32).reshape(-1,2).copy(); n = len(a); mono = a.mean(1)
# where the fade-out starts: last second whose RMS is within 3 dB of the median
win = SR//2; rms = np.array([np.sqrt((mono[i:i+win]**2).mean()) for i in range(0, n-win, win)])
med = np.median(rms); last_ok = max(i for i,r in enumerate(rms) if r > med*0.6)
fade_start = last_ok*win
X = int(2.0*SR)  # crossfade length
# spectral frames
hop = 1024; nfft = 4096
def spec(seg):
    fr = [np.abs(np.fft.rfft(seg[i:i+nfft]*np.hanning(nfft)))[:600] for i in range(0, len(seg)-nfft, hop)]
    s = np.log1p(np.array(fr)); return s
ref = spec(mono[:int(6*SR)])
best = None
lo, hi = fade_start - int(40*SR), fade_start - X - int(0.5*SR)
for L in range(lo, hi, hop):
    s = spec(mono[L:L+int(6*SR)])
    m = min(len(s), len(ref)); d = np.mean((s[:m]-ref[:m])**2)
    if best is None or d < best[0]: best = (d, L)
L = best[1]
# fine align on waveform within +-30 ms
seg0 = mono[:int(1.0*SR)]; bestc=None
for off in range(-int(0.03*SR), int(0.03*SR)):
    c = np.dot(seg0, mono[L+off:L+off+len(seg0)])
    if bestc is None or c > bestc[0]: bestc=(c,off)
L += bestc[1]
t = np.linspace(0, np.pi/2, X)[:,None]
body = a[:L].copy()
body[:X] = a[L:L+X]*np.cos(t) + a[:X]*np.sin(t)
# check seam: end of body -> start of body
seam = np.concatenate([body[-SR//10:], body[:SR//10]]).mean(1)
print(name, 'orig %.2fs fade at %.2fs loop %.3fs dist %.3f off %d seamjump %.4f' % (n/SR, fade_start/SR, L/SR, best[0], bestc[1], abs(body[-1]-body[0]).max()))
pcm = (np.clip(body,-1,1)*32767).astype('<i2').tobytes()
subprocess.run(['ffmpeg','-v','error','-y','-f','s16le','-ar',str(SR),'-ac','2','-i','-','-c:a','libmp3lame','-b:a','160k',name+'.mp3'], input=pcm, check=True)
json.dump({'len': L/SR}, open(name+'.json','w'))
