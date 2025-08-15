"use client";

type Props = {
  onSetFrom: (value: string) => void;
  onSetTo: (value: string) => void;
};

const presets = [
  { label: "Home", value: "Home" },
  { label: "Work", value: "Work" },
  { label: "Airport", value: "Airport" },
];

export default function QuickActions({ onSetFrom, onSetTo }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((p) => (
        <div key={p.label} className="flex items-center gap-1">
          <button
            className="text-xs px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300"
            onClick={() => onSetFrom(p.value)}
          >
            Set From: {p.label}
          </button>
          <button
            className="text-xs px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300"
            onClick={() => onSetTo(p.value)}
          >
            Set To: {p.label}
          </button>
        </div>
      ))}
    </div>
  );
}


