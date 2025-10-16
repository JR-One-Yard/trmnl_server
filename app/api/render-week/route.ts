import type { NextRequest } from "next/server"
import { getWeekBoundsSydney } from "@/lib/calendar/time"
import { getWeekEvents } from "@/lib/calendar/fetch"
import { renderWeekSvg } from "@/lib/calendar/renderWeekSvg"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  console.log("[v0] render-week: Starting PNG generation")

  try {
    const crypto = await import("crypto")
    const { Resvg } = await import("@resvg/resvg-js")
    const sharp = (await import("sharp")).default

    // 1) Data
    const now = new Date()
    const { startOfWeek, endOfWeek } = getWeekBoundsSydney(now)
    console.log("[v0] render-week: Week bounds", { startOfWeek, endOfWeek })

    const events = await getWeekEvents(startOfWeek, endOfWeek)
    console.log("[v0] render-week: Fetched events", { count: events.length })

    // 2) SVG
    const svg = renderWeekSvg({ events, startOfWeek, endOfWeek })
    console.log("[v0] render-week: Generated SVG", { length: svg.length })

    // 3) Rasterise SVG → PNG
    const r = new Resvg(svg, { fitTo: { mode: "width", value: 800 } })
    const png = r.render().asPng()
    console.log("[v0] render-week: Converted to PNG", { size: png.length })

    const finalPng = await sharp(png)
      .resize(800, 480, { fit: "cover" })
      .grayscale()
      .png({ compressionLevel: 9 })
      .toBuffer()
    console.log("[v0] render-week: Final PNG processed", { size: finalPng.length })

    // 4) Cache headers (ETag/304)
    const etag = crypto.createHash("sha1").update(finalPng).digest("hex")
    const ifNoneMatch = req.headers.get("if-none-match")

    if (ifNoneMatch && ifNoneMatch === etag) {
      console.log("[v0] render-week: Returning 304 Not Modified")
      return new Response(null, { status: 304, headers: { ETag: etag } })
    }

    console.log("[v0] render-week: Returning PNG with ETag", { etag })
    return new Response(finalPng, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=60",
        ETag: etag,
        "Last-Modified": new Date().toUTCString(),
      },
    })
  } catch (error) {
    console.error("[v0] render-week: Error generating PNG", error)
    return new Response(JSON.stringify({ error: "Failed to generate image" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
