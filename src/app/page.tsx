"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import RideCard from "./components/RideCard";
import FooterStats from "./components/FooterStats";
import GeoButton from "./components/GeoButton";
// Removed inline date/time panes; using full overlay only
// import DatePicker from "./components/DatePicker";
// import TimePicker from "./components/TimePicker";
import DateTimeOverlay from "./components/DateTimeOverlay";

type CompareResult = {
  provider: string;
  estimateUsd: number;
  etaMin: number;
  deepLink: string;
  webLink: string;
};

export default function Home() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CompareResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"price" | "eta">("price");
  const [dateStr, setDateStr] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [timeStr, setTimeStr] = useState<string>("12:00");
  const [fromCoord, setFromCoord] = useState<{ lat: number; lon: number } | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);

  async function compare() {
    setError(null);
    setResults([]);
    setLoading(true);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setResults(json.results || []);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "Something went wrong";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pb-24">
      <header className="relative px-0 overflow-hidden">
        <video className="absolute inset-0 w-full h-[360px] object-cover" autoPlay muted loop playsInline poster="/icon-512.png">
          <source src="/ride-bg.mp4" type="video/mp4" />
        </video>
        <div className="relative z-10 px-6 bg-gradient-to-b from-black/40 to-white/0 min-h-[360px] flex items-center justify-center">
          <div className="max-w-5xl mx-auto text-center flex flex-col items-center justify-center gap-3">
            <div className="mt-2">
              <Image
                src="/brand/optiride-stacked.svg?v=1"
                alt="OptiRide"
                width={128}
                height={128}
                className="h-28 md:h-32 mx-auto"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/brand/optiride-icon.svg?v=5";
                }}
              />
            </div>
            <div className="text-base text-neutral-800 mt-4">Smarter fare comparisons across Uber, Lyft and more</div>
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <input
                    id="pickup-input"
                    className="px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-300 outline-none placeholder:text-neutral-500 w-full"
                    placeholder="Pickup location"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                  <GeoButton onSet={(c, addr) => {
                    setFromCoord(c);
                    setFrom(addr ? addr : `${c.lat.toFixed(5)}, ${c.lon.toFixed(5)}`);
                  }} />
                </div>
                <input
                  id="drop-input"
                  className="px-4 py-3 rounded-xl bg-neutral-100 border border-neutral-300 outline-none placeholder:text-neutral-500"
                  placeholder="Dropoff location"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              <div className="mt-3 flex items-center justify-center">
                <button
                  type="button"
                  className="w-full sm:w-[26rem] px-6 py-3 rounded-2xl border border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-lg font-medium flex items-center justify-between"
                  onClick={() => setOverlayOpen(true)}
                >
                  <span>Date & Time</span>
                  <span className="text-sm font-normal text-neutral-600">
                    {new Date(dateStr).toLocaleDateString()} · {timeStr}
                  </span>
                </button>
              </div>
              <div className="mt-3 flex flex-col items-center justify-center gap-2">
                <div className="flex items-center justify-center gap-2">
                  <label className="text-sm text-neutral-600">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "price" | "eta")}
                    className="text-sm px-3 py-2 rounded-lg border border-neutral-300 bg-white"
                  >
                    <option value="price">Lowest price</option>
                    <option value="eta">Fastest ETA</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-yellow-500 text-white font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  onClick={async () => {
                    if (!from.trim() || !to.trim()) {
                      const pickup = document.getElementById('pickup-input');
                      const drop = document.getElementById('drop-input');
                      if (pickup && !from.trim()) pickup.classList.add('ring-2','ring-red-500');
                      if (drop && !to.trim()) drop.classList.add('ring-2','ring-red-500');
                      setTimeout(() => {
                        if (pickup) pickup.classList.remove('ring-2','ring-red-500');
                        if (drop) drop.classList.remove('ring-2','ring-red-500');
                      }, 1200);
                      return;
                    }
                    await compare();
                  }}
              >
                {loading ? "Loading..." : "See prices"}
              </button>
              <button
                className="px-5 py-3 rounded-xl bg-slate-200 text-slate-900 border border-slate-300 hover:bg-slate-300 active:scale-95 transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                onClick={() => {
                  setFrom("");
                  setTo("");
                  setResults([]);
                  setError(null);
                }}
              >
                Clear
              </button>
            </div>
            {/* quick actions removed */}
            {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
          </div>
          </div>
        </div>
      </header>

      <main className="px-6 mt-6">
        <div className="max-w-2xl mx-auto space-y-3">
          {results.length === 0 && (
            <div className="text-center text-neutral-400 text-sm">Enter your trip to see available options.</div>
          )}
          {useMemo(() => {
            const sorted = [...results].sort((a, b) =>
              sortBy === "eta" ? a.etaMin - b.etaMin : a.estimateUsd - b.estimateUsd
            );
            const baseline = sorted.length > 0 ? sorted[0].estimateUsd : undefined;
            return sorted.map((r) => <RideCard key={r.provider} baselinePriceUsd={baseline} {...r} />);
          }, [results, sortBy])}
        </div>
      </main>

      <FooterStats />
      <DateTimeOverlay
        open={overlayOpen}
        date={dateStr}
        time={timeStr}
        onApply={(d,t)=>{ setDateStr(d); setTimeStr(t); setOverlayOpen(false); }}
        onClose={()=> setOverlayOpen(false)}
      />
    </div>
  );
}
