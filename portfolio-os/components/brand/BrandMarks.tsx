import { siGithub, siInstagram, siSpotify, siX } from "simple-icons";

/** Official brand marks (simple-icons, CC0) — pixel-exact, not fan recreations. */

export function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d={siGithub.path} />
    </svg>
  );
}

export function XMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d={siX.path} />
    </svg>
  );
}

export function InstagramMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d={siInstagram.path} />
    </svg>
  );
}

export function SpotifyMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d={siSpotify.path} />
    </svg>
  );
}

