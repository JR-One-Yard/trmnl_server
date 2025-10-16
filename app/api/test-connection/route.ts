import { NextResponse } from "next/server"

export async function GET() {
  console.log("[v0] Test connection endpoint called")

  return NextResponse.json({
    status: "success",
    message: "TRMNL BYOS server is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      setup: "/api/setup",
      display: "/api/display",
      log: "/api/log",
      health: "/api/health",
    },
  })
}
