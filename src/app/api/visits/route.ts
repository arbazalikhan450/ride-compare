import { NextResponse } from "next/server";

let count = 0;

// GET: read-only (no increment) so clients can poll without inflating stats
export async function GET() {
  return NextResponse.json({ visits: count });
}

// POST: increment once per page mount
export async function POST() {
  count += 1;
  return NextResponse.json({ visits: count });
}


