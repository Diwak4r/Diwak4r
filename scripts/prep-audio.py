# Builds the Spotify app's audio library. Run from the repo root:
#   python scripts/prep-audio.py
#
# - Full versions of all 19 tracks -> portfolio-os/public/audio/full/<slug>.mp3 (128k)
# - Covers extracted from each file's embedded art -> public/images/music-covers/<slug>.jpg
# - 4 "viral cut" clips for the 14 new tracks (loudest 24s windows, faded)
# - Removes the raw numbered uploads once processed
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO = os.path.join(ROOT, "portfolio-os", "public", "audio")
FULL = os.path.join(AUDIO, "full")
COVERS = os.path.join(ROOT, "portfolio-os", "public", "images", "music-covers")
MUSIC = os.path.join(ROOT, "music")

CLIP_LEN = 24.0
FADE = 1.0
N_CLIPS = 4
MIN_GAP = 24.0

# The 14 new uncut uploads (numbered filenames -> slug)
NEW = {
    "4. Aakhri Ishq.mp3": "aakhri-ishq",
    "9. Destiny - Mann Atkeya.mp3": "destiny-mann-atkeya",
    "14. Kanhaiyya.mp3": "kanhaiyya",
    "16. Ishq Jalakar - Karvaan.mp3": "ishq-jalakar",
    "17. Gehra Hua.mp3": "gehra-hua",
    "22. Lutt Le Gaya.mp3": "lutt-le-gaya",
    "23. Move - Yeh Ishq Ishq.mp3": "move-yeh-ishq-ishq",
    "26. BHATBHATEY MA.mp3": "bhatbhatey-ma",
    "28. AAAHH MEN!.mp3": "aaahh-men",
    "29. Sorry.mp3": "sorry",
    "31. Gata Only.mp3": "gata-only",
    "32. Me and the Devil.mp3": "me-and-the-devil",
    "37. F1.mp3": "f1",
    "38. Gata Only (Remix).mp3": "gata-only-remix",
}

# The original five: full versions come from the source files in music/
ORIGINAL = {
    "Aneesh, Sarkar, Hruday - Udi Udi (SPOTISAVER).mp3": "udi-udi",
    "Post Malone, Swae Lee - Sunflower - Spider-Man Into the Spider-Verse (SPOTISAVER).mp3": "sunflower",
    "The Weeknd - After Hours (SPOTISAVER).mp3": "after-hours",
    "The Weeknd - Reminder (SPOTISAVER).mp3": "reminder",
    "The Weeknd, Playboi Carti - Timeless (feat Playboi Carti) (SPOTISAVER).mp3": "timeless",
}


def run(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        print("FAILED:", " ".join(args)[:200])
        print(r.stderr[-500:])
        sys.exit(1)
    return r


def duration_of(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", path],
        capture_output=True, text=True)
    return float(r.stdout.strip())


def loudness_peaks(path, dur):
    """Mean volume of sliding windows; return the N loudest, well-spaced starts."""
    step = 8.0
    results = []
    t = 10.0
    while t + CLIP_LEN < dur - 8.0:
        r = subprocess.run(
            ["ffmpeg", "-v", "info", "-hide_banner", "-nostats",
             "-ss", str(t), "-t", str(CLIP_LEN), "-i", path,
             "-af", "volumedetect", "-f", "null", "-"],
            capture_output=True, text=True)
        m = re.search(r"mean_volume:\s*(-?\d+\.?\d*)\s*dB", r.stderr)
        if m:
            results.append((t, float(m.group(1))))
        t += step
    results.sort(key=lambda x: x[1], reverse=True)
    picked = []
    for s, _vol in results:
        if all(abs(s - p) >= MIN_GAP for p in picked):
            picked.append(s)
        if len(picked) >= N_CLIPS:
            break
    return sorted(picked)


def encode_full(src, slug):
    out = os.path.join(FULL, f"{slug}.mp3")
    if os.path.exists(out):
        return
    run(["ffmpeg", "-y", "-v", "error", "-i", src, "-vn", "-b:a", "128k", out])
    print(f"full      {slug}.mp3")


def extract_cover(src, slug):
    out = os.path.join(COVERS, f"{slug}.jpg")
    if os.path.exists(out):
        return
    run(["ffmpeg", "-y", "-v", "error", "-i", src, "-an",
         "-frames:v", "1", "-vf", "scale=600:-1", "-q:v", "3", out])
    print(f"cover     {slug}.jpg")


def cut_clips(src, slug):
    if os.path.exists(os.path.join(AUDIO, f"{slug}-1.mp3")):
        return
    dur = duration_of(src)
    peaks = loudness_peaks(src, dur)
    for i, start in enumerate(peaks, 1):
        out = os.path.join(AUDIO, f"{slug}-{i}.mp3")
        run(["ffmpeg", "-y", "-v", "error", "-ss", str(start), "-t", str(CLIP_LEN),
             "-i", src,
             "-af", f"afade=t=in:st=0:d={FADE},afade=t=out:st={CLIP_LEN - FADE}:d={FADE}",
             "-b:a", "128k", out])
    print(f"clips     {slug}-1..{len(peaks)}.mp3 at {[round(p) for p in peaks]}")


def main():
    os.makedirs(FULL, exist_ok=True)
    os.makedirs(COVERS, exist_ok=True)

    for fname, slug in NEW.items():
        src = os.path.join(AUDIO, fname)
        if not os.path.exists(src):
            print(f"skip (missing): {fname}")
            continue
        encode_full(src, slug)
        extract_cover(src, slug)
        cut_clips(src, slug)

    for fname, slug in ORIGINAL.items():
        src = os.path.join(MUSIC, fname)
        if not os.path.exists(src):
            print(f"skip (missing): {fname}")
            continue
        encode_full(src, slug)

    # The raw numbered uploads are processed; drop them so the site ships lean.
    for fname in NEW:
        src = os.path.join(AUDIO, fname)
        if os.path.exists(src):
            os.remove(src)
            print(f"removed   {fname}")

    print("done")


if __name__ == "__main__":
    main()
