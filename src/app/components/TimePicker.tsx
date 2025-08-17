"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  mode: "now" | "custom";
  onToggle: () => void;
  value: string; // HH:MM (24h)
  onChange: (val: string) => void;
};

export default function TimePicker({ mode, onToggle, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const [h24, m] = value.split(":").map((x) => parseInt(x || "0", 10));
  const isPM = h24 >= 12;
  const h12 = ((h24 + 11) % 12) + 1;

  function pad(n: number) {
    return String(n).padStart(2, "0");
  }

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex-1 text-left hover:opacity-80 inline-flex items-center gap-2 rounded-xl bg-neutral-100 border border-neutral-300 px-3 py-2 text-sm"
      >
        <span aria-hidden>🕰️</span>
        {mode === "now" ? <span>Now</span> : <span>{value}</span>}
        <span className="ml-auto">▾</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-[22rem] rounded-2xl border border-neutral-200 bg-white shadow-xl p-3 grid grid-cols-3 gap-3">
          {[{ label: "Hour", max: 12 }, { label: "Minute", max: 59 }, { label: "AM/PM", max: 1 }].map((col, idx) => (
            <div key={col.label} className="h-44 overflow-hidden">
              <div className="text-xs text-neutral-500 mb-1">{col.label}</div>
              <div className="h-36 overflow-y-auto snap-y">
                {Array.from({ length: col.max + 1 }).map((_, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      if (idx === 2) {
                        const newIsPM = i === 1;
                        const nh24 = newIsPM ? (h12 % 12) + 12 : h12 % 12;
                        onChange(`${pad(nh24)}:${pad(m)}`);
                        return;
                      }
                      const newH12 = idx === 0 ? (i === 0 ? 12 : i) : h12;
                      const newM = idx === 1 ? i : m;
                      const nh24 = isPM ? (newH12 % 12) + 12 : newH12 % 12;
                      onChange(`${pad(nh24)}:${pad(newM)}`);
                    }}
                    className={`snap-start cursor-pointer px-3 py-1 rounded text-sm ${
                      (idx === 0 ? i === h12 : idx === 1 ? i === m : (isPM ? i === 1 : i === 0))
                        ? "bg-blue-600 text-white"
                        : "hover:bg-neutral-100"
                    }`}
                  >
                    {idx === 2 ? (i === 0 ? "AM" : "PM") : pad(i === 0 && idx === 0 ? 12 : i)}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="col-span-2 flex items-center justify-between">
            <button className="px-3 py-2 rounded-lg border" onClick={() => onToggle()}>Use Now</button>
            <button className="px-3 py-2 rounded-lg bg-blue-600 text-white" onClick={() => setOpen(false)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}


