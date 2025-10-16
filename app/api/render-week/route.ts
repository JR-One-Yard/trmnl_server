import type { NextRequest } from "next/server"
import { getWeekBoundsSydney } from "@/lib/calendar/time"
import { getWeekEvents } from "@/lib/calendar/fetch"
import { renderWeekSvg } from "@/lib/calendar/renderWeekSvg"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function generateETag(buffer: Buffer): Promise<string | null> {
  try {
    const { createHash } = await import("node:crypto")
    return createHash("sha1").update(buffer).digest("hex")
  } catch {
    return null
  }
}

function isPreviewEnvironment(): boolean {
  return process.env.VERCEL_ENV === "preview" || !process.env.VERCEL_ENV
}

export async function GET(req: NextRequest) {
  console.log("[v0] render-week: Starting generation")

  try {
    if (isPreviewEnvironment()) {
      console.log("[v0] render-week: Preview mode - returning SVG")

      const now = new Date()
      const { startOfWeek, endOfWeek } = getWeekBoundsSydney(now)
      const events = await getWeekEvents(startOfWeek, endOfWeek)
      const svg = renderWeekSvg({ events, startOfWeek, endOfWeek })

      return new Response(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=60",
        },
      })
    }

    console.log("[v0] render-week: Production mode - generating PNG")
    const { Resvg } = await import("@resvg/resvg-js")
    const sharp = (await import("sharp")).default

    const now = new Date()
    const { startOfWeek, endOfWeek } = getWeekBoundsSydney(now)
    const events = await getWeekEvents(startOfWeek, endOfWeek)
    const svg = renderWeekSvg({ events, startOfWeek, endOfWeek })

    const r = new Resvg(svg, { fitTo: { mode: "width", value: 800 } })
    const png = r.render().asPng()

    const finalPng = await sharp(png)
      .resize(800, 480, { fit: "cover" })
      .grayscale()
      .png({ compressionLevel: 9 })
      .toBuffer()

    const etag = await generateETag(finalPng)
    const ifNoneMatch = req.headers.get("if-none-match")

    if (etag && ifNoneMatch && ifNoneMatch === etag) {
      return new Response(null, { status: 304, headers: { ETag: etag } })
    }

    const headers: Record<string, string> = {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=60",
      "Last-Modified": new Date().toUTCString(),
    }

    if (etag) {
      headers.ETag = etag
    }

    return new Response(finalPng, { status: 200, headers })
  } catch (error) {
    console.error("[v0] render-week: Error generating image", error)
    return new Response(JSON.stringify({ error: "Failed to generate image" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
