import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "cyberscan-frontend",
    time: new Date().toISOString(),
  });
}

