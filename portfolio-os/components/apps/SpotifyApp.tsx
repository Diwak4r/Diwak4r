"use client";

import { useEffect, useRef, useState } from "react";
import {
  Pause,
  Play,
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

function VolumeIcon({ volume }: { volume: number }) {
  if (volume === 0) return <SpeakerX size={17} weight="fill" />;
  if (volume < 0.33) return <SpeakerNone size={17} weight="fill" />;
  if (volume < 0.67) return <SpeakerLow size={17} weight="fill" />;
  return <SpeakerHigh size={17} weight="fill" />;
}

/** Diwakar's picks: mid-size cards, each with 5 clips from the song's best moments. */
export default function SpotifyApp() {
  const [song, setSong] = useState(0);
  const [clip, setClip] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [prevVolume, setPrevVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const track = playlist[song];
  const active = track.clips[clip];

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
    setPlaying(false);
  }, [song, clip]);

  useEffect(() => {
    if (playing) audioRef.current?.play().catch(() => setPlaying(false));
    else audioRef.current?.pause();
  }, [playing, song, clip]);

  const playSong = (i: number) => {
    setSong(i);
    setClip(0);
    setPlaying(true);
  };

  const nextClip = () => {
    if (clip < track.clips.length - 1) {
      setClip((c) => c + 1);
    } else {
      setSong((i) => (i + 1) % playlist.length);
      setClip(0);
    }
    setPlaying(true);
  };

  const prevClip = () => {
    if (clip > 0) setClip((c) => c - 1);
    else {
      const prevSong = (song - 1 + playlist.length) % playlist.length;
      setSong(prevSong);
      setClip(playlist[prevSong].clips.length - 1);
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
    <div className="flex h-full flex-col bg-[#121212]">
      <div className="os-scroll flex-1 overflow-y-auto p-5">
        <h2 className="mb-1 text-[15px] font-semibold text-white/90">Diwakar&rsquo;s Picks</h2>
        <p className="mb-4 text-[12px] text-white/40">
          The most-played moments from each track, cut into 5 parts
        </p>

        <div className="grid grid-cols-2 gap-4 @lg:grid-cols-3">
          {playlist.map((t, i) => (
            <div
              key={t.title}
              className={`overflow-hidden rounded-xl border transition ${
                i === song ? "border-[#1db954]" : "border-white/[0.06]"
              }`}
            >
              <button onClick={() => playSong(i)} className="group relative block w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.cover} alt="" className="block aspect-square w-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1db954] text-black">
                    <Play size={18} weight="fill" className="ml-0.5" />
                  </span>
                </span>
              </button>
              <div className="p-2.5">
                <p className="truncate text-[13px] font-medium text-white/90">{t.title}</p>
                <p className="truncate text-[11px] text-white/45">{t.artist}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {t.clips.map((c, ci) => (
                    <button
                      key={c.label}
                      onClick={() => {
                        setSong(i);
                        setClip(ci);
                        setPlaying(true);
                      }}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition ${
                        i === song && ci === clip
                          ? "bg-[#1db954] text-black"
                          : "bg-white/[0.08] text-white/60 hover:bg-white/[0.14]"
                      }`}
                    >
                      {ci + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Now playing bar */}
      <div className="flex items-center gap-3 border-t border-white/[0.08] bg-[#181818] px-4 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={track.cover} alt="" className="h-12 w-12 shrink-0 rounded object-cover" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-medium text-white/90">
            {track.title} <span className="text-white/40">&middot; {active.label}</span>
          </p>
          <p className="truncate text-[11px] text-white/45">{track.artist}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="w-8 text-right text-[10px] tabular-nums text-white/35">
              {formatTime(time)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 28}
              step={0.1}
              value={time}
              onChange={seek}
              className="h-1 flex-1 cursor-pointer accent-[#1db954]"
              aria-label="Seek"
            />
            <span className="w-8 text-[10px] tabular-nums text-white/35">
              {formatTime(duration)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button onClick={prevClip} aria-label="Previous clip" className="text-white/70 hover:text-white">
            <SkipBack size={17} weight="fill" />
          </button>
          <button
            onClick={() => setPlaying((v) => !v)}
            aria-label={playing ? "Pause" : "Play"}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 active:scale-95"
          >
            {playing ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" className="ml-0.5" />}
          </button>
          <button onClick={nextClip} aria-label="Next clip" className="text-white/70 hover:text-white">
            <SkipForward size={17} weight="fill" />
          </button>
        </div>

        <div className="ml-1 flex shrink-0 items-center gap-1.5">
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
            className="h-1 w-20 cursor-pointer accent-[#1db954]"
            aria-label="Volume"
          />
        </div>
      </div>

      <audio
        ref={audioRef}
        src={active.audio}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          e.currentTarget.volume = volume;
        }}
        onEnded={nextClip}
      />
    </div>
  );
}
