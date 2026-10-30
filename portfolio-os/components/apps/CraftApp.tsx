"use client";

import { useEffect, useState } from "react";

/** Mount the game once the window's open animation has settled. */
const MOUNT_DELAY_MS = 400;

/** Embeds the CraftJS voxel game (self-contained, vendored Three.js) in an iframe.
 *  The iframe mounts a beat after the window opens: parsing 1.4 MB of Three.js
 *  mid-animation was what made opening CraftJS stutter. */
export default function CraftApp() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), MOUNT_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  if (!ready) {
    return (
      <div className="flex h-full items-center justify-center bg-black">
        <p className="text-[13px] text-white/50">Loading CraftJS…</p>
      </div>
    );
  }

  return (
    <iframe
      src="/games/craftjs/index.html"
      title="CraftJS"
      className="h-full w-full border-0 bg-black"
      allow="pointer-lock; fullscreen; autoplay"
    />
  );
}
