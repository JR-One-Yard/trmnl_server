import type { NextRequest } from "next/server"
import { getWeekBoundsSydney } from "@/lib/calendar/time"
import { getWeekEvents } from "@/lib/calendar/fetch"
import { renderWeekSvg } from "@/lib/calendar/renderWeekSvg"
import { convertToBMP } from "@/lib/calendar/bmp-converter"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)
  console.log(`[v0] [${requestId}] render-week: REQUEST RECEIVED`)
  console.log(`[v0] [${requestId}] All headers:`, JSON.stringify(Object.fromEntries(req.headers.entries())))

  try {
    const now = new Date()
    const { startOfWeek, endOfWeek } = getWeekBoundsSydney(now)
    console.log(`[v0] [${requestId}] Week bounds:`, { startOfWeek, endOfWeek })

    const events = await getWeekEvents(startOfWeek, endOfWeek)
    console.log(`[v0] [${requestId}] Fetched ${events.length} events`)

    const svg = renderWeekSvg({ events, startOfWeek, endOfWeek })
    console.log(`[v0] [${requestId}] SVG generated, length: ${svg.length}`)

    // Check if client wants SVG (for browser testing) or BMP (for TRMNL device)
    const acceptHeader = req.headers.get("accept") || ""
    const userAgent = req.headers.get("user-agent") || ""
    const deviceId = req.headers.get("ID") || req.headers.get("id") || ""

    console.log(`[v0] [${requestId}] User-Agent: "${userAgent}"`)
    console.log(`[v0] [${requestId}] Accept: "${acceptHeader}"`)
    console.log(`[v0] [${requestId}] Device ID: "${deviceId}"`)

    // Return SVG only for browsers that explicitly look like browsers
    const isBrowser =
      userAgent.includes("Mozilla") ||
      userAgent.includes("Chrome") ||
      userAgent.includes("Safari") ||
      userAgent.includes("Edge")
    const wantsSvg =
      acceptHeader.includes("image/svg") || (isBrowser && !deviceId && !acceptHeader.includes("image/bmp"))

    console.log(`[v0] [${requestId}] isBrowser: ${isBrowser}, wantsSvg: ${wantsSvg}`)

    if (wantsSvg) {
      console.log(`[v0] [${requestId}] Returning SVG for browser`)
      return new Response(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })
    }

    // Convert to BMP for TRMNL devices
    console.log(`[v0] [${requestId}] Converting to BMP for TRMNL device`)

    // Import Resvg dynamically
    console.log(`[v0] [${requestId}] Importing Resvg...`)
    const { Resvg } = await import("@resvg/resvg-js")
    console.log(`[v0] [${requestId}] Resvg imported successfully`)

    // Convert SVG to PNG
    console.log(`[v0] [${requestId}] Creating Resvg instance...`)
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: "width",
        value: 800,
      },
      font: {
        loadSystemFonts: false,
      },
    })

    console.log(`[v0] [${requestId}] Rendering PNG...`)
    const pngBuffer = resvg.render().asPng()
    console.log(`[v0] [${requestId}] PNG generated, size: ${pngBuffer.length} bytes`)

    // Convert PNG to 1-bit BMP for e-ink
    console.log(`[v0] [${requestId}] Converting to BMP...`)
    const bmpBuffer = await convertToBMP(pngBuffer)
    console.log(`[v0] [${requestId}] BMP generated, size: ${bmpBuffer.length} bytes`)

    console.log(`[v0] [${requestId}] Returning BMP response`)
    return new Response(bmpBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/bmp",
        "Content-Length": bmpBuffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error(`[v0] [${requestId}] ERROR:`, error)
    console.error(`[v0] [${requestId}] Error stack:`, error instanceof Error ? error.stack : "No stack trace")
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ error: "Failed to generate image", details: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
