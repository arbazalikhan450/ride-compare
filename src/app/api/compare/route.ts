import { NextResponse } from "next/server";

type GeocodeResult = {
  lat: number;
  lon: number;
  display_name: string;
};

type CompareRequest = {
  from?: string;
  to?: string;
  fromCoord?: { lat: number; lon: number } | null;
  toCoord?: { lat: number; lon: number } | null;
};

function toNumber(value: string | number): number {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return 0;
  return parsed;
}

function parseLatLonString(raw: string): { lat: number; lon: number } | null {
  const m = raw.split(/[,\s]+/).map((v) => Number(v));
  if (m.length >= 2 && !Number.isNaN(m[0]) && !Number.isNaN(m[1])) {
    return { lat: m[0], lon: m[1] };
  }
  return null;
}

async function geocode(query: string): Promise<GeocodeResult | null> {
  const coord = parseLatLonString(query);
  if (coord) {
    return { lat: coord.lat, lon: coord.lon, display_name: `${coord.lat},${coord.lon}` };
  }
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "ride-compare/0.1 (test)",
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as Array<any>;
  if (!data || data.length === 0) return null;
  const first = data[0];
  return {
    lat: toNumber(first.lat),
    lon: toNumber(first.lon),
    display_name: first.display_name ?? query,
  };
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function estimatePriceUsd(distanceKm: number, surgeMultiplier = 1): number {
  const baseFare = 2.0;
  const perKm = 1.2;
  const bookingFee = 1.0;
  const est = (baseFare + distanceKm * perKm + bookingFee) * surgeMultiplier;
  return Math.round(est * 100) / 100;
}

function buildUberDeepLink(
  from: GeocodeResult,
  to: GeocodeResult
): { app: string; web: string } {
  const params = new URLSearchParams();
  params.set("action", "setPickup");
  params.set("pickup[latitude]", String(from.lat));
  params.set("pickup[longitude]", String(from.lon));
  params.set("dropoff[latitude]", String(to.lat));
  params.set("dropoff[longitude]", String(to.lon));
  const web = `https://m.uber.com/ul/?${params.toString()}`;
  return { app: web, web };
}

function buildLyftDeepLink(
  from: GeocodeResult,
  to: GeocodeResult
): { app: string; web: string } {
  const params = new URLSearchParams();
  params.set("id", "lyft");
  params.set("pickup[latitude]", String(from.lat));
  params.set("pickup[longitude]", String(from.lon));
  params.set("destination[latitude]", String(to.lat));
  params.set("destination[longitude]", String(to.lon));
  const app = `lyft://ridetype?${params.toString()}`;
  const web = `https://ride.lyft.com/?${params.toString()}`;
  return { app, web };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CompareRequest;
    const fromQuery = (body?.from ?? "").trim();
    const toQuery = (body?.to ?? "").trim();

    let fromGeo: GeocodeResult | null = null;
    let toGeo: GeocodeResult | null = null;

    if (body?.fromCoord && typeof body.fromCoord.lat === "number" && typeof body.fromCoord.lon === "number") {
      fromGeo = { lat: body.fromCoord.lat, lon: body.fromCoord.lon, display_name: "Current location" };
    }
    if (body?.toCoord && typeof body.toCoord.lat === "number" && typeof body.toCoord.lon === "number") {
      toGeo = { lat: body.toCoord.lat, lon: body.toCoord.lon, display_name: "Destination" };
    }

    if (!fromGeo) {
      if (!fromQuery) {
        return NextResponse.json(
          { error: "Pickup is required (address or coordinates)." },
          { status: 400 }
        );
      }
      fromGeo = await geocode(fromQuery);
    }
    if (!toGeo) {
      if (!toQuery) {
        return NextResponse.json(
          { error: "Dropoff is required (address or coordinates)." },
          { status: 400 }
        );
      }
      toGeo = await geocode(toQuery);
    }

    if (!fromGeo || !toGeo) {
      return NextResponse.json(
        { error: "Could not geocode one or both locations." },
        { status: 400 }
      );
    }

    const distanceKm = haversineKm(fromGeo.lat, fromGeo.lon, toGeo.lat, toGeo.lon);

    const uber = buildUberDeepLink(fromGeo, toGeo);
    const lyft = buildLyftDeepLink(fromGeo, toGeo);

    const results = [
      {
        provider: "Uber",
        estimateUsd: estimatePriceUsd(distanceKm, 1.0),
        etaMin: Math.max(2, Math.round(distanceKm / 0.8)),
        deepLink: uber.app,
        webLink: uber.web,
      },
      {
        provider: "Lyft",
        estimateUsd: estimatePriceUsd(distanceKm, 0.95),
        etaMin: Math.max(2, Math.round(distanceKm / 0.75)),
        deepLink: lyft.app,
        webLink: lyft.web,
      },
    ].sort((a, b) => a.estimateUsd - b.estimateUsd);

    return NextResponse.json({
      from: fromGeo,
      to: toGeo,
      distanceKm,
      currency: "USD",
      results,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}


