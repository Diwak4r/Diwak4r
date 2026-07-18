"use client";

import { useEffect, useRef, useState } from "react";
import {
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  SpeakerHigh,
  SpeakerLow,
  SpeakerNone,
  SpeakerX,
} from "@phosphor-icons/react";
import { playlist } from "@/lib/content";

function formatTime(sec: number): string {
  if (!Number.isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

const VOLUME_KEY = "dios-spotify-volume";

/** "full" plays the whole song; a number plays that viral cut. */
type Mode = "full" | number;

function VolumeIcon({ volume }: { volume: number }) {
  if (volume === 0) return <SpeakerX size={16} weight="fill" />;
  if (volume < 0.33) return <SpeakerNone size={16} weight="fill" />;
  if (volume < 0.67) return <SpeakerLow size={16} weight="fill" />;
  return <SpeakerHigh size={16} weight="fill" />;
}

/** Diwakar's picks, laid out like the real Spotify desktop app: library rail,
 *  gradient playlist header, hover-play cards, and a full now-playing bar.
 *  Each track offers the complete song or its viral cuts. */
export default function SpotifyApp() {
  const [song, setSong] = useState(0);
  const [mode, setMode] = useState<Mode>("full");
  const [playing, setPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [prevVolume, setPrevVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const track = playlist[song];
  const src = mode === "full" ? track.full : track.clips[mode].audio;
  const nowLabel = mode === "full" ? "" : ` · ${track.clips[mode].label}`;

  useEffect(() => {
    const stored = localStorage.getItem(VOLUME_KEY);
    if (stored !== null) setVolume(Number(stored));
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    localStorage.setItem(VOLUME_KEY, String(volume));
  }, [volume]);

  useEffect(() => {
    setTime(0);
  }, [song, mode]);

  // Persist the last-played track so the desktop Now-Playing widget can show
  // it without a shared store. Written only when playback actually starts.
  // Deps are title/artist primitives so this stays correct even if playlist
  // entries are ever rebuilt per render.
  useEffect(() => {
    if (!playing) return;
    try {
      localStorage.setItem(
        "dios-spotify-last",
        JSON.stringify({ title: track.title, artist: track.artist })
      );
    } catch {
      /* storage may be unavailable; widget falls back gracefully */
    }
  }, [playing, song, track.title, track.artist]);

  useEffect(() => {
    if (playing) audioRef.current?.play().catch(() => setPlaying(false));
    else audioRef.current?.pause();
  }, [playing, song, mode]);

  const playTrack = (i: number, m: Mode = "full") => {
    setSong(i);
    setMode(m);
    setPlaying(true);
  };

  const nextSongIndex = () => {
    if (shuffle && playlist.length > 1) {
      let n = song;
      while (n === song) n = Math.floor(Math.random() * playlist.length);
      return n;
    }
    return (song + 1) % playlist.length;
  };

  const next = () => {
    if (mode !== "full" && mode < track.clips.length - 1) {
      setMode(mode + 1);
    } else {
      setSong(nextSongIndex());
      setMode(mode === "full" ? "full" : 0);
    }
    setPlaying(true);
  };

  const prev = () => {
    // Real player behavior: restart if we're a few seconds in.
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    if (mode !== "full" && mode > 0) {
      setMode(mode - 1);
    } else {
      const p = (song - 1 + playlist.length) % playlist.length;
      setSong(p);
      setMode(mode === "full" ? "full" : Math.max(0, playlist[p].clips.length - 1));
    }
    setPlaying(true);
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setTime(t);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume || 1);
    }
  };

  return (
    <div className="@container flex h-full flex-col bg-[#121212] text-white">
      <div className="flex min-h-0 flex-1">
        {/* Library rail */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-white/[0.06] bg-black/30 @3xl:flex">
          <p className="px-4 pb-2 pt-4 text-[12.5px] font-semibold text-white/55">Your Library</p>
          <div className="os-scroll min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {playlist.map((t, i) => (
              <button
                key={t.slug}
                onClick={() => playTrack(i)}
                className={`flex w-full items-center gap-2.5 rounded-md p-2 text-left transition-colors hover:bg-white/[0.07] ${
                  i === song ? "bg-white/[0.06]" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.cover} alt="" className="h-9 w-9 shrink-0 rounded object-cover" loading="lazy" />
                <span className="min-w-0">
                  <span className={`block truncate text-[12.5px] font-medium ${i === song ? "text-[#1ed760]" : "text-white/90"}`}>
                    {t.title}
                  </span>
                  <span className="block truncate text-[11px] text-white/45">{t.artist}</span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main view */}
        <div className="os-scroll min-h-0 flex-1 overflow-y-auto">
          {/* Playlist header on a green-to-ink gradient */}
          <div className="bg-[linear-gradient(180deg,rgba(29,185,84,0.35)_0%,rgba(29,185,84,0.08)_55%,transparent_100%)] px-5 pb-4 pt-6">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">Playlist</p>
            <h2 className="mt-1 text-[26px] font-bold tracking-tight @2xl:text-[32px]">Diwakar&rsquo;s Picks</h2>
            <p className="mt-1 text-[12.5px] text-white/55">
              {playlist.length} songs · play the full track or jump straight to the viral cuts
            </p>
          </div>

          {/* Track cards */}
          <div className="grid grid-cols-2 gap-3 p-5 @xl:grid-cols-3 @4xl:grid-cols-4">
            {playlist.map((t, i) => (
              <div
                key={t.slug}
                className={`group rounded-lg bg-white/[0.04] p-3 transition-colors hover:bg-white/[0.09] ${
                  i === song ? "bg-white/[0.08]" : ""
                }`}
              >
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.cover}
                    alt={`${t.title} cover`}
                    className="block aspect-square w-full rounded-md object-cover"
                    loading="lazy"
                  />
                  <button
                    onClick={() => (i === song && playing ? setPlaying(false) : playTrack(i))}
                    aria-label={i === song && playing ? `Pause ${t.title}` : `Play ${t.title}`}
                    className={`absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-[0_6px_14px_rgba(0,0,0,0.45)] transition-all ${
                      i === song && playing
                        ? "opacity-100"
                        : "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                    }`}
                  >
                    {i === song && playing ? (
                      <Pause size={17} weight="fill" />
                    ) : (
                      <Play size={17} weight="fill" className="ml-0.5" />
                    )}
                  </button>
                </div>
                <p className={`mt-2.5 truncate text-[13.5px] font-semibold ${i === song ? "text-[#1ed760]" : ""}`}>
                  {t.title}
                </p>
                <p className="truncate text-[11.5px] text-white/45">{t.artist}</p>

                {/* Full vs viral cuts */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => playTrack(i, "full")}
                    className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold transition ${
                      i === song && mode === "full"
                        ? "bg-[#1ed760] text-black"
                        : "bg-white/[0.09] text-white/65 hover:bg-white/[0.16]"
                    }`}
                  >
                    Full
                  </button>
                  {t.clips.map((c, ci) => (
                    <button
                      key={c.label}
                      onClick={() => playTrack(i, ci)}
                      aria-label={`Play ${t.title} ${c.label}`}
                      className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium transition ${
                        i === song && mode === ci
                          ? "bg-[#1ed760] text-black"
                          : "bg-white/[0.09] text-white/60 hover:bg-white/[0.16]"
                      }`}
                    >
                      {ci + 1}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Now playing bar */}
      <div className="flex items-center gap-4 border-t border-white/[0.08] bg-[#181818] px-4 py-2.5">
        <div className="flex w-52 min-w-0 shrink items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={track.cover} alt="" className="h-11 w-11 shrink-0 rounded object-cover" />
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-medium text-white/90">
              {track.title}
              <span className="text-white/40">{nowLabel}</span>
            </p>
            <p className="truncate text-[11px] text-white/45">{track.artist}</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShuffle((v) => !v)}
              aria-label="Shuffle"
              aria-pressed={shuffle}
              className={shuffle ? "text-[#1ed760]" : "text-white/55 hover:text-white"}
            >
              <Shuffle size={15} weight="bold" />
            </button>
            <button onClick={prev} aria-label="Previous" className="text-white/75 hover:text-white">
              <SkipBack size={16} weight="fill" />
            </button>
            <button
              onClick={() => setPlaying((v) => !v)}
              aria-label={playing ? "Pause" : "Play"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 active:scale-95"
            >
              {playing ? <Pause size={15} weight="fill" /> : <Play size={15} weight="fill" className="ml-0.5" />}
            </button>
            <button onClick={next} aria-label="Next" className="text-white/75 hover:text-white">
              <SkipForward size={16} weight="fill" />
            </button>
            <button
              onClick={() => setRepeat((v) => !v)}
              aria-label="Repeat"
              aria-pressed={repeat}
              className={repeat ? "text-[#1ed760]" : "text-white/55 hover:text-white"}
            >
              <Repeat size={15} weight="bold" />
            </button>
          </div>
          <div className="flex w-full max-w-[440px] items-center gap-2">
            <span className="w-8 shrink-0 text-right text-[10px] tabular-nums text-white/35">
              {formatTime(time)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 30}
              step={0.1}
              value={time}
              onChange={seek}
              className="h-1 min-w-0 flex-1 cursor-pointer accent-[#1ed760]"
              aria-label="Seek"
            />
            <span className="w-8 shrink-0 text-[10px] tabular-nums text-white/35">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="hidden w-32 shrink-0 items-center gap-1.5 @lg:flex">
          <button
            onClick={toggleMute}
            aria-label={volume > 0 ? "Mute" : "Unmute"}
            className="text-white/60 hover:text-white"
          >
            <VolumeIcon volume={volume} />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1 min-w-0 flex-1 cursor-pointer accent-[#1ed760]"
            aria-label="Volume"
          />
        </div>
      </div>

      <audio
        ref={audioRef}
        src={src}
        loop={repeat}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          e.currentTarget.volume = volume;
        }}
        onEnded={next}
      />
    </div>
  );
}
