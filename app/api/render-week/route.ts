import type { NextRequest } from "next/server"
import { getWeekBoundsSydney } from "@/lib/calendar/time"
import { getWeekEvents } from "@/lib/calendar/fetch"
import { renderWeekSvg } from "@/lib/calendar/renderWeekSvg"
import { convertToBMP } from "@/lib/calendar/bmp-converter"

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

    // Check if client wants SVG (for browser testing) or BMP (for TRMNL device)
    const acceptHeader = req.headers.get("accept") || ""
    const userAgent = req.headers.get("user-agent") || ""
    const isBrowser = userAgent.includes("Mozilla") || userAgent.includes("Chrome") || userAgent.includes("Safari")
    
    // Return SVG for browsers (for testing)
    if (isBrowser && !acceptHeader.includes("image/bmp")) {
      console.log("[v0] render-week: Returning SVG for browser")
      return new Response(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })
    }

    // Convert to BMP for TRMNL devices
    console.log("[v0] render-week: Converting to BMP for TRMNL device")
    
    // Import Resvg dynamically
    const { Resvg } = await import("@resvg/resvg-js")
    
    // Convert SVG to PNG
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: "width",
        value: 800,
      },
      font: {
        loadSystemFonts: false,
      },
    })
    
    const pngBuffer = resvg.render().asPng()
    console.log("[v0] render-week: PNG generated, size:", pngBuffer.length)
    
    // Convert PNG to 1-bit BMP for e-ink
    const bmpBuffer = await convertToBMP(pngBuffer)
    console.log("[v0] render-week: BMP generated, size:", bmpBuffer.length)
    
    return new Response(bmpBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/bmp",
        "Content-Length": bmpBuffer.length.toString(),
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