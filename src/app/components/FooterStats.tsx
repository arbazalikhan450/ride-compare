"use client";

import { useEffect, useState } from "react";

export default function FooterStats() {
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    // Increment once when the component mounts
    fetch("/api/visits", { method: "POST" })
      .then((r) => r.json())
      .then((j) => setVisits(j.visits))
      .catch(() => {});
    // Poll every 10s to reflect other visitors
    const id = setInterval(() => {
      fetch("/api/visits")
        .then((r) => r.json())
        .then((j) => setVisits(j.visits))
        .catch(() => {});
    }, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="mt-8 mb-4 text-center">
      <div className="inline-block px-4 py-2 rounded-xl bg-neutral-100 border border-neutral-200">
        <div className="text-2xl font-semibold tracking-wide">{visits ?? 0}</div>
        <div className="h-0.5 w-12 bg-neutral-300 mx-auto my-1 rounded"/>
        <div className="text-xs text-rose-700 font-semibold">Page Visits</div>
      </div>
    </footer>
  );
}


