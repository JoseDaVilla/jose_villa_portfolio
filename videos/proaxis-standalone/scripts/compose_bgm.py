"""Original 20.4s electronic bed for ProAxis Standalone, synthesized with numpy.

Beat grid: 150 BPM (beat = 0.40s), origin 0.00s, so every scene cut is a whole
beat: 2.4 (drop, end of the logo sting), 4.4 (routing), 10.0 (AI Verdict),
12.8 (campaign), 15.2 (stats) and 17.6 (lockup: final hit + bell). A snare
roll builds 16.4 -> 17.6; the bed fades out over the final still hold.
Writes a 48k stereo WAV.
"""
import sys
import numpy as np

SR = 48000
DUR = 20.4
N = int(SR * DUR)
BEAT = 0.40
ORIGIN = 0.0
DROP = ORIGIN + 6 * BEAT          # 2.4
BUILD_START = 16.40
FINAL = 17.60
CUTS = [4.4, 10.0, 12.8, 15.2]    # mid-video scene cuts get a soft crash
rng = np.random.default_rng(7)


def t_arr(n):
    return np.arange(n) / SR


def place(buf, sig, at):
    i = int(round(at * SR))
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i]


def adsr(n, a, d, s, r):
    env = np.ones(n) * s
    na, nd, nr = int(a * SR), int(d * SR), int(r * SR)
    na = min(na, n)
    env[:na] = np.linspace(0, 1, na, endpoint=False) if na else env[:na]
    nd = min(nd, n - na)
    env[na:na + nd] = np.linspace(1, s, nd, endpoint=False)
    nr = min(nr, n)
    env[n - nr:] *= np.linspace(1, 0, nr)
    return env


def saw(freq, n, harmonics, detune=0.0, phase=0.0):
    t = t_arr(n)
    out = np.zeros(n)
    f = freq * (1 + detune)
    for k in range(1, harmonics + 1):
        if f * k > SR / 2.2:
            break
        out += np.sin(2 * np.pi * f * k * t + phase * k) / k
    return out * 0.6


def note_hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def lowpass_fft(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** 4)
    return np.fft.irfft(X, len(x))


def highpass_fft(x, cutoff):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (cutoff / np.maximum(f, 1e-3)) ** 4)
    return np.fft.irfft(X, len(x))


def reverb(x, seconds=2.2, mix=0.25, seed=1):
    r = np.random.default_rng(seed)
    n = int(seconds * SR)
    ir = r.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    ir = lowpass_fft(ir, 6000)
    ir /= np.sqrt(np.sum(ir ** 2))
    L = len(x) + n
    y = np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(ir, L), L)[: len(x)]
    return x * (1 - mix) + y * mix * 1.4


# --- chords (key of F / D minor) -----------------------------------------
CHORDS = {
    "Dm": [50, 53, 57, 62],
    "Bb": [46, 50, 53, 58],
    "F": [53, 57, 60, 65],
    "C": [48, 52, 55, 60],
    "Fadd9": [53, 57, 60, 67, 69],
}
BASS = {"Dm": 38, "Bb": 34, "F": 41, "C": 36, "Fadd9": 29}
BAR = 4 * BEAT
# (chord, start, end)
PROG = [("Dm", 0.0, DROP)]
i = 0
while DROP + i * BAR < FINAL - 1e-6:
    c = ["Dm", "Bb", "F", "C"][i % 4]
    s = DROP + i * BAR
    PROG.append((c, s, min(s + BAR, FINAL)))
    i += 1
PROG.append(("Fadd9", FINAL, DUR))

kick_times = [DROP + k * BEAT for k in range(int((BUILD_START + 0.45 - DROP) / BEAT) + 1)]
kick_times = [k for k in kick_times if k < BUILD_START + 0.01]

# sidechain envelope
side = np.ones(N)
for kt in kick_times + [FINAL]:
    i = int(kt * SR)
    n = int(0.35 * SR)
    seg = 1 - 0.62 * np.exp(-t_arr(n) / 0.075)
    j = min(N, i + n)
    side[i:j] = np.minimum(side[i:j], seg[: j - i])

# --- pad --------------------------------------------------------------------
padL, padR = np.zeros(N), np.zeros(N)
for name, s, e in PROG:
    n = int((e - s + 0.6) * SR)
    env = adsr(n, 0.9 if s == 0 else 0.08, 0.3, 0.85, 0.6 if name != "Fadd9" else 2.2)
    for m in CHORDS[name]:
        f = note_hz(m)
        bright = 14 if s >= DROP else 9
        place(padL, saw(f, n, bright, detune=-0.004, phase=0.3) * env, s)
        place(padR, saw(f, n, bright, detune=+0.004, phase=1.1) * env, s)
# intro filter swell: crossfade dark -> bright up to the drop
padL_dark, padR_dark = lowpass_fft(padL, 500), lowpass_fft(padR, 500)
padL_br, padR_br = lowpass_fft(padL, 3200), lowpass_fft(padR, 3200)
tt = t_arr(N)
x = np.clip(tt / DROP, 0, 1) ** 2
padL = padL_dark * (1 - x) + padL_br * x
padR = padR_dark * (1 - x) + padR_br * x
pad_gain = np.where(tt < DROP, 0.10 + 0.1 * x, 0.16) * side
padL *= pad_gain
padR *= pad_gain

# --- bass (offbeat 8ths after drop, sub swell in intro) --------------------
bass = np.zeros(N)
for name, s, e in PROG[1:-1]:
    k = 0
    while True:
        at = s + k * BEAT + BEAT / 2
        if at >= e or at >= BUILD_START:
            break
        n = int(BEAT * 0.48 * SR)
        f = note_hz(BASS[name])
        sig = saw(f, n, 10) * 0.6 + np.sin(2 * np.pi * f * t_arr(n)) * 0.8
        sig *= adsr(n, 0.004, 0.08, 0.6, 0.04)
        place(bass, sig, at)
        k += 1
bass = lowpass_fft(bass, 900) * 0.38
# final sub
n = int(2.8 * SR)
place(bass, np.sin(2 * np.pi * note_hz(29) * t_arr(n)) * np.exp(-t_arr(n) / 1.1) * 0.55, FINAL)
# intro sub swell into the drop
n = int(DROP * SR)
swell = np.sin(2 * np.pi * note_hz(38) * t_arr(n)) * (np.linspace(0, 1, n) ** 3) * 0.25
place(bass, swell, 0.0)

# --- drums ------------------------------------------------------------------
drums = np.zeros(N)


def kick(level=1.0):
    n = int(0.45 * SR)
    t = t_arr(n)
    freq = 45 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(freq) / SR
    body = np.sin(ph) * np.exp(-t / 0.16)
    click = rng.standard_normal(n) * np.exp(-t / 0.004) * 0.3
    return (body + click) * level


def hat(level=1.0, decay=0.035):
    n = int(0.12 * SR)
    t = t_arr(n)
    s = np.diff(rng.standard_normal(n + 1)) * np.exp(-t / decay)
    return s * 0.22 * level


def clap(level=1.0):
    n = int(0.3 * SR)
    t = t_arr(n)
    noise = highpass_fft(rng.standard_normal(n), 900)
    env = np.exp(-t / 0.09)
    for d in (0.0, 0.011, 0.022):
        env += np.exp(-np.maximum(t - d, 0) / 0.006) * (t >= d) * 0.8
    return lowpass_fft(noise * env, 7000) * 0.28 * level


for kt in kick_times:
    place(drums, kick(0.95), kt)
    place(drums, hat(0.9), kt + BEAT / 2)
    place(drums, hat(0.45, 0.02), kt + BEAT / 4)
    place(drums, hat(0.45, 0.02), kt + 3 * BEAT / 4)
for idx, kt in enumerate(kick_times):
    if idx % 2 == 1:
        place(drums, clap(), kt)
# snare roll build into the final
roll_t = BUILD_START
step = BEAT / 4
while roll_t < FINAL - 0.05:
    prog = (roll_t - BUILD_START) / (FINAL - BUILD_START)
    place(drums, clap(0.25 + 0.75 * prog), roll_t)
    roll_t += step if prog < 0.5 else step / 2
place(drums, kick(1.15), FINAL)
# crash on the final: long filtered noise
n = int(2.6 * SR)
crash = highpass_fft(rng.standard_normal(n), 4000) * np.exp(-t_arr(n) / 0.7) * 0.16
place(drums, crash, FINAL)
# soft crashes on the mid-video scene cuts
for ct in CUTS:
    n = int(1.6 * SR)
    place(drums, highpass_fft(rng.standard_normal(n), 5000) * np.exp(-t_arr(n) / 0.45) * 0.07, ct)
# intro crash-less reverse swell into drop
n = int(1.4 * SR)
rev = highpass_fft(rng.standard_normal(n), 2500) * (np.linspace(0, 1, n) ** 4) * 0.18
place(drums, rev, DROP - 1.4)

# --- pluck arpeggio (16ths) with ping-pong delay ---------------------------
arpL, arpR = np.zeros(N), np.zeros(N)
pattern = [0, 1, 2, 3, 2, 1, 2, 3]
for name, s, e in PROG[1:-1]:
    tones = CHORDS[name]
    k = 0
    while True:
        at = s + k * (BEAT / 2)
        if at >= e or at >= FINAL - 0.05:
            break
        m = tones[pattern[k % len(pattern)] % len(tones)] + 12
        n = int(0.28 * SR)
        f = note_hz(m)
        sig = (saw(f, n, 8) + 0.5 * np.sin(2 * np.pi * 2 * f * t_arr(n))) * np.exp(-t_arr(n) / 0.07)
        if at < 4.4:
            sig *= 0.5  # sparser under the headline
        place(arpL, sig, at)
        place(arpR, sig, at)
        k += 1
arp_dry = lowpass_fft(arpL, 4200) * 0.085
arpL = arp_dry.copy()
arpR = arp_dry * 0.85
for tap, g in ((3, 0.45), (6, 0.25), (9, 0.12)):
    d = int(tap * BEAT / 4 * SR)
    sh = np.zeros(N)
    sh[d:] = arp_dry[:-d]
    if tap % 2:
        arpR += sh * g
    else:
        arpL += sh * g

# --- final bell -------------------------------------------------------------
bell = np.zeros(N)
for m, off in ((77, 0.0), (81, 0.05), (84, 0.1), (89, 0.6)):
    n = int(2.6 * SR)
    f = note_hz(m)
    t = t_arr(n)
    sig = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.3)) * np.exp(-t / 0.9)
    place(bell, sig * 0.09, FINAL + 0.65 + off)

# --- mix --------------------------------------------------------------------
# low-cut the rhythm stems through the build so the final lands bigger
build = np.clip((tt - BUILD_START) / (FINAL - BUILD_START), 0, 1) * (tt < FINAL)
duck_low = 1 - 0.8 * build
L = padL + bass * duck_low + drums + arpL + bell
R = padR + bass * duck_low + drums + arpR + bell
L = reverb(L, mix=0.22, seed=3)
R = reverb(R, mix=0.22, seed=4)
# fade out tail
fade = np.ones(N)
fs = int(19.5 * SR)
fade[fs:] = np.linspace(1, 0, N - fs) ** 1.5
fade[: int(0.02 * SR)] = np.linspace(0, 1, int(0.02 * SR))
L, R = L * fade, R * fade
mix = np.stack([L, R], 1)
mix = np.tanh(mix * 1.6) / 1.6
mix /= np.max(np.abs(mix)) / 0.89

out = sys.argv[1]
pcm = (mix * 32767).astype("<i2")
import wave
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", out)
