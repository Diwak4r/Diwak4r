"use client";

/** Embeds the CraftJS voxel game (self-contained, vendored Three.js) in an iframe. */
export default function CraftApp() {
  return (
    <iframe
      src="/games/craftjs/index.html"
      title="CraftJS"
      className="h-full w-full border-0 bg-black"
      allow="pointer-lock; fullscreen; autoplay"
    />
  );
}
