import type { NextRequest } from "next/server"
import { getWeekBoundsSydney } from "@/lib/calendar/time"
import { getWeekEvents } from "@/lib/calendar/fetch"
import { renderWeekSvg } from "@/lib/calendar/renderWeekSvg"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  console.log("[v0] render-week: Starting generation")

  try {
    const now = new Date()
    const { startOfWeek, endOfWeek } = getWeekBoundsSydney(now)
    console.log("[v0] render-week: Week bounds:", { startOfWeek, endOfWeek })

    const events = await getWeekEvents(startOfWeek, endOfWeek)
    console.log("[v0] render-week: Fetched", events.length, "events")

    const svg = renderWeekSvg({ events, startOfWeek, endOfWeek })
    console.log("[v0] render-week: SVG generated, length:", svg.length)

    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("[v0] render-week: Error generating image", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ error: "Failed to generate image", details: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
