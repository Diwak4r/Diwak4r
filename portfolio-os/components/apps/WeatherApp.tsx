"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudRain, CloudSnow, Sun, Moon, } from "@phosphor-icons/react";
import { useSystem } from "@/lib/system";

const CACHE_KEY = "dios-weather";
const LAT = 27.7172;
const LON = 85.324;

interface Wx {
  temp: number; condition: string; weathercode: number; isDay: boolean;
  hi: number; lo: number; daily: { date: string; hi: number; lo: number; code: number }[];
  cachedAt: number;
}

function bgFor(code: number, isDay: boolean): string {
  if (isDay) {
    if (code <= 3) return "linear-gradient(180deg, #2980b9 0%, #6dd5fa 100%)";
    if (code <= 48) return "linear-gradient(180deg, #7b8fa1, #bdc3c7)";
    if (code <= 57) return "linear-gradient(180deg, #8b9196, #c4c9ce)";
    if (code <= 67) return "linear-gradient(180deg, #5f6b74, #a0a7ad)";
    return "linear-gradient(180deg, #3a4756, #6e7b87)";
  }
  return "linear-gradient(180deg, #0c1220 0%, #1c2840 60%, #2a3a58 100%)";
}

export default function WeatherApp() {
  const wifiOn = useSystem(s => s.wifiOn);
  const [data, setData] = useState<Wx | null>(null);
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wifiOn) { setLoading(false); setErr(true); return; }
    const cached = (() => { try { const c = localStorage.getItem(CACHE_KEY); return c ? JSON.parse(c) as Wx : null; } catch { return null; } })();
    if (cached && Date.now() - cached.cachedAt < 3600_000) { setData(cached); setLoading(false); return; }

    const params = new URLSearchParams({ latitude: String(LAT), longitude: String(LON), current: "temperature_2m,weather_code,is_day", daily: "temperature_2m_max,temperature_2m_min,weather_code", timezone: "auto", forecast_days: "7" });
    fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
      .then(r => r.json()).then(j => {
        const wx: Wx = {
          temp: Math.round(j.current.temperature_2m), condition: "", weathercode: j.current.weather_code, isDay: j.current.is_day === 1,
          hi: Math.round(j.daily.temperature_2m_max[0]), lo: Math.round(j.daily.temperature_2m_min[0]),
          daily: j.daily.time.map((t: string, i: number) => ({ date: t, hi: Math.round(j.daily.temperature_2m_max[i]), lo: Math.round(j.daily.temperature_2m_min[i]), code: j.daily.weather_code[i] })),
          cachedAt: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(wx));
        setData(wx); setLoading(false); setErr(false);
      }).catch(() => { if (!cached) setErr(true); setLoading(false); });
  }, [wifiOn]);

  if (err && !data) return (
    <div className="flex h-full flex-col items-center justify-center gap-3" style={{ background: "linear-gradient(160deg, #1a2a3a, #0d1620)" }}>
      <Cloud size={44} className="text-white/40" />
      <p className="text-[13px] text-white/50">{wifiOn ? "Weather is off the grid right now." : "Wi-Fi is off — weather needs a connection."}</p>
    </div>
  );

  if (loading && !data) return (
    <div className="flex h-full items-center justify-center" style={{ background: "linear-gradient(160deg, #1a2a3a, #0d1620)" }}>
      <span className="animate-pulse text-[13px] text-white/40">Loading Kathmandu weather…</span>
    </div>
  );

  if (!data) return null;

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-cover" style={{ background: bgFor(data.weathercode, data.isDay) }}>
      <div className="flex flex-1 flex-col items-center justify-center gap-1 p-6 text-center text-white">
        <p className="text-[13px] font-medium text-white/75">Kathmandu, Nepal</p>
        <p className="text-[64px] font-light leading-none tracking-tighter">{data.temp}&deg;</p>
        <p className="text-[14px] text-white/75">H:{data.hi}&deg; &nbsp; L:{data.lo}&deg;</p>
      </div>
      <div className="shrink-0 border-t border-white/[0.12] px-4 py-3">
        <div className="flex justify-between text-center">
          {data.daily.slice(0, 7).map((d, i) => (
            <div key={d.date} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <span className="text-[11px] font-medium text-white/60">{i === 0 ? "Today" : weekdays[new Date(d.date).getDay()]}</span>
              <span className="text-[22px]">{d.code <= 3 ? <Sun size={20} weight="fill" /> : d.code <= 48 ? <Cloud size={20} weight="fill" /> : d.code <= 67 ? <CloudRain size={20} weight="fill" /> : <CloudSnow size={20} weight="fill" />}</span>
              <span className="text-[12px] tabular-nums font-semibold text-white/90">{d.hi}&deg;</span>
              <span className="text-[11px] tabular-nums text-white/45">{d.lo}&deg;</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
