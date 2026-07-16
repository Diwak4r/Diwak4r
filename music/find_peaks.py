import subprocess
import re
import sys
import os

WINDOW = 18.0
MIN_GAP = 18.0
N_CLIPS = 5

def get_duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", path],
        capture_output=True, text=True
    )
    return float(out.stdout.strip())

def scan_windows(path, duration):
    step = 8.0
    starts = []
    t = 10.0
    while t + WINDOW < duration - 10.0:
        starts.append(t)
        t += step
    results = []
    for s in starts:
        out = subprocess.run(
            ["ffmpeg", "-v", "info", "-hide_banner", "-nostats",
             "-ss", str(s), "-t", str(WINDOW), "-i", path,
             "-af", "volumedetect", "-f", "null", "-"],
            capture_output=True, text=True
        )
        m = re.search(r"mean_volume:\s*(-?\d+\.?\d*)\s*dB", out.stderr)
        if m:
            results.append((s, float(m.group(1))))
    return results

def pick_peaks(results, n, min_gap):
    results = sorted(results, key=lambda r: r[1], reverse=True)
    picked = []
    for s, vol in results:
        if all(abs(s - p) >= min_gap for p in picked):
            picked.append(s)
        if len(picked) >= n:
            break
    return sorted(picked)

def main():
    music_dir = sys.argv[1]
    files = [f for f in os.listdir(music_dir) if f.endswith(".mp3")]
    for f in files:
        path = os.path.join(music_dir, f)
        dur = get_duration(path)
        results = scan_windows(path, dur)
        peaks = pick_peaks(results, N_CLIPS, MIN_GAP)
        print(f"{f} | duration={dur:.1f}")
        print("  peaks:", [round(p, 1) for p in peaks])

if __name__ == "__main__":
    main()
