"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  value: string; // yyyy-mm-dd
  onChange: (val: string) => void;
};

function toYMD(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function DatePicker({ value, onChange }: Props) {
  const initial = value ? new Date(value) : new Date();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<{ y: number; m: number }>(() => ({
    y: initial.getFullYear(),
    m: initial.getMonth(),
  }));
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const days = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const startWeekday = (first.getDay() + 6) % 7; // Mon=0
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const cells: Array<{ d: number | null; date?: Date }> = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ d: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(view.y, view.m, d);
      cells.push({ d, date: dt });
    }
    while (cells.length % 7 !== 0) cells.push({ d: null });
    return cells;
  }, [view]);

  const selectedYMD = value || toYMD(new Date());
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 rounded-xl bg-neutral-100 border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-200 transition"
      >
        <span aria-hidden>📅</span>
        <span>{new Date(selectedYMD).toLocaleDateString()}</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-80 rounded-2xl border border-neutral-200 bg-white shadow-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <button
              className="px-2 py-1 rounded hover:bg-neutral-100"
              onClick={() =>
                setView((v) => ({ y: v.y, m: v.m - 1 < 0 ? 11 : v.m - 1, ...(v.m - 1 < 0 ? { y: v.y - 1 } : {}) }))
              }
            >
              ‹
            </button>
            <div className="text-sm font-medium">
              {new Date(view.y, view.m, 1).toLocaleString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </div>
            <button
              className="px-2 py-1 rounded hover:bg-neutral-100"
              onClick={() =>
                setView((v) => ({ y: v.y, m: v.m + 1 > 11 ? 0 : v.m + 1, ...(v.m + 1 > 11 ? { y: v.y + 1 } : {}) }))
              }
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-neutral-500 mb-1">
            {"Mon Tue Wed Thu Fri Sat Sun".split(" ").map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((c, i) => {
              const ymd = c.date ? toYMD(c.date) : "";
              const isSel = c.date && ymd === selectedYMD;
              const isPast = !!c.date && c.date < startToday;
              return (
                <button
                  key={i}
                  disabled={!c.date || isPast}
                  onClick={() => {
                    if (!c.date) return;
                    onChange(toYMD(c.date));
                    setOpen(false);
                  }}
                  className={`h-8 text-sm rounded-md ${
                    !c.date
                      ? "opacity-0"
                      : isSel
                      ? "bg-blue-600 text-white"
                      : isPast
                      ? "text-neutral-300 cursor-not-allowed"
                      : "hover:bg-neutral-100"
                  }`}
                >
                  {c.d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


