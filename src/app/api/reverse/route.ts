import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon required" }, { status: 400 });
  }
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lon)}&format=json&zoom=16`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "ride-compare/0.1 (reverse)" },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ error: "lookup failed" }, { status: 502 });
    const data = await res.json();
    return NextResponse.json({ address: data?.display_name ?? `${lat},${lon}` });
  } catch {
    return NextResponse.json({ error: "reverse error" }, { status: 500 });
  }
}



