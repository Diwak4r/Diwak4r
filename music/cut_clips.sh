#!/bin/bash
set -e
DUR=28
FADE=1
OUT="../portfolio-os/public/audio"
mkdir -p "$OUT"

cut() {
  local src="$1" slug="$2" idx="$3" start="$4"
  ffmpeg -y -v error -ss "$start" -t "$DUR" -i "$src" \
    -af "afade=t=in:st=0:d=$FADE,afade=t=out:st=$(($DUR-$FADE)):d=$FADE" \
    -b:a 128k "$OUT/${slug}-${idx}.mp3"
}

src="Aneesh, Sarkar, Hruday - Udi Udi (SPOTISAVER).mp3"
i=1; for s in 18 42 66 106 130; do cut "$src" udi-udi $i $s; i=$((i+1)); done

src="Post Malone, Swae Lee - Sunflower - Spider-Man Into the Spider-Verse (SPOTISAVER).mp3"
i=1; for s in 26 50 74 98 122; do cut "$src" sunflower $i $s; i=$((i+1)); done

src="The Weeknd - After Hours (SPOTISAVER).mp3"
i=1; for s in 130 154 186 218 250; do cut "$src" after-hours $i $s; i=$((i+1)); done

src="The Weeknd - Reminder (SPOTISAVER).mp3"
i=1; for s in 42 66 138 162 186; do cut "$src" reminder $i $s; i=$((i+1)); done

src="The Weeknd, Playboi Carti - Timeless (feat Playboi Carti) (SPOTISAVER).mp3"
i=1; for s in 42 114 138 178 210; do cut "$src" timeless $i $s; i=$((i+1)); done

echo "done"
