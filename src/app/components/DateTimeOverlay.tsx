"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  open: boolean;
  date: string; // yyyy-mm-dd
  time: string; // HH:MM (24h)
  onApply: (date: string, time: string) => void;
  onClose: () => void;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toYMD(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function DateTimeOverlay({ open, date, time, onApply, onClose }: Props) {
  const [now, setNow] = useState<Date>(new Date());
  const [workDate, setWorkDate] = useState<string>(date);
  const [workTime, setWorkTime] = useState<string>(time);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (open) {
      setWorkDate(date);
      setWorkTime(time);
    }
  }, [open, date, time]);

  // Calendar grid for current workDate's month
  const view = useMemo(() => {
    const base = workDate ? new Date(workDate) : new Date();
    return { y: base.getFullYear(), m: base.getMonth() };
  }, [workDate]);

  const days = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const startWeekday = (first.getDay() + 6) % 7; // Mon=0
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const cells: Array<{ d: number | null; date?: Date }>=[];
    for (let i=0;i<startWeekday;i++) cells.push({ d: null });
    for (let d=1; d<=daysInMonth; d++) cells.push({ d, date: new Date(view.y, view.m, d) });
    while (cells.length % 7 !== 0) cells.push({ d: null });
    return cells;
  }, [view]);

  const [h24, m] = workTime.split(":").map((x)=>parseInt(x||"0",10));
  const hh = pad(h24);
  const mm = pad(m);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <div className="w-full max-w-4xl bg-neutral-900 text-white rounded-3xl shadow-2xl overflow-hidden" onClick={(e)=>e.stopPropagation()}>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Large digital clock */}
          <div className="p-8 flex items-center justify-center md:border-r border-neutral-800">
            <div className="text-center">
              <div className="text-[64px] md:text-[96px] font-bold tracking-widest">
                {hh}:{mm}
              </div>
              <div className="text-neutral-400 mt-2">{now.toLocaleString(undefined,{weekday:"long", hour:"2-digit", minute:"2-digit"})}</div>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700" onClick={()=>{
                  const nh=(h24+23)%24; setWorkTime(`${pad(nh)}:${mm}`);
                }}>- Hour</button>
                <button className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700" onClick={()=>{
                  const nh=(h24+1)%24; setWorkTime(`${pad(nh)}:${mm}`);
                }}>+ Hour</button>
                <button className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700" onClick={()=>{
                  const nm=(m+59)%60; setWorkTime(`${hh}:${pad(nm)}`);
                }}>- Min</button>
                <button className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700" onClick={()=>{
                  const nm=(m+1)%60; setWorkTime(`${hh}:${pad(nm)}`);
                }}>+ Min</button>
              </div>
            </div>
          </div>
          {/* Calendar */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <button className="px-2 py-1 rounded hover:bg-neutral-800" onClick={()=>{
                const base=new Date(view.y, view.m, 1); base.setMonth(base.getMonth()-1); setWorkDate(toYMD(base));
              }}>‹</button>
              <div className="text-neutral-200 font-semibold">
                {new Date(view.y, view.m, 1).toLocaleString(undefined,{month:"long", year:"numeric"})}
              </div>
              <button className="px-2 py-1 rounded hover:bg-neutral-800" onClick={()=>{
                const base=new Date(view.y, view.m, 1); base.setMonth(base.getMonth()+1); setWorkDate(toYMD(base));
              }}>›</button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-neutral-500 mb-1">
              {"Mon Tue Wed Thu Fri Sat Sun".split(" ").map((w)=>(<div key={w}>{w}</div>))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((c,i)=>{
                const ymd=c.date?toYMD(c.date):"";
                const sel= ymd===workDate;
                const today= toYMD(new Date());
                const isPast = !!c.date && ymd < today;
                return (
                  <button key={i} disabled={!c.date}
                    onClick={()=> c.date && setWorkDate(toYMD(c.date))}
                    className={`h-9 rounded-lg text-sm ${!c.date?"opacity-0": sel?"bg-blue-600 text-white":"hover:bg-neutral-800"} ${isPast?"text-neutral-500": ""}`}
                  >{c.d}</button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-4 border-t border-neutral-800">
          <button className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500" onClick={()=> onApply(workDate, workTime)}>Apply</button>
        </div>
      </div>
    </div>
  );
}



