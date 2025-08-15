"use client";

type Props = { onSet: (coord: { lat: number; lon: number }, address?: string) => void };

export default function GeoButton({ onSet }: Props) {
  async function getLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const res = await fetch(`/api/reverse?lat=${lat}&lon=${lon}`);
          const j = await res.json();
          onSet({ lat, lon }, j?.address);
        } catch {
          onSet({ lat, lon });
        }
      },
      () => {
        // ignore errors silently
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }
  return (
    <button
      type="button"
      title="Use current location"
      onClick={getLocation}
      className="px-2 py-1 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 text-sm inline-flex items-center justify-center"
      aria-label="Use current location"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10z" stroke="#111" strokeWidth="1.5" fill="#e11d48"/>
        <circle cx="12" cy="11" r="2" fill="#fff"/>
      </svg>
    </button>
  );
}


