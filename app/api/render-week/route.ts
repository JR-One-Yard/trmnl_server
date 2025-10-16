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
  console.log("[v0] render-week: Environment:", process.env.VERCEL_ENV || "development")
  console.log("[v0] render-week: Headers:", Object.fromEntries(req.headers.entries()))

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
    let Resvg, sharp
    try {
      const resvgModule = await import("@resvg/resvg-js")
      Resvg = resvgModule.Resvg
      sharp = (await import("sharp")).default
      console.log("[v0] render-week: Native modules loaded successfully")
    } catch (importError) {
      console.error("[v0] render-week: Failed to load native modules:", importError)
      throw new Error(`Failed to load native modules: ${importError}`)
    }

    const now = new Date()
    const { startOfWeek, endOfWeek } = getWeekBoundsSydney(now)
    console.log("[v0] render-week: Week bounds:", { startOfWeek, endOfWeek })

    const events = await getWeekEvents(startOfWeek, endOfWeek)
    console.log("[v0] render-week: Fetched", events.length, "events")

    const svg = renderWeekSvg({ events, startOfWeek, endOfWeek })
    console.log("[v0] render-week: SVG generated, length:", svg.length)

    let finalPng
    try {
      const r = new Resvg(svg, { fitTo: { mode: "width", value: 800 } })
      const png = r.render().asPng()
      console.log("[v0] render-week: SVG converted to PNG, size:", png.length)

      finalPng = await sharp(png).resize(800, 480, { fit: "cover" }).grayscale().png({ compressionLevel: 9 }).toBuffer()

      console.log("[v0] render-week: Final PNG processed, size:", finalPng.length)
    } catch (conversionError) {
      console.error("[v0] render-week: Image conversion failed:", conversionError)
      throw new Error(`Image conversion failed: ${conversionError}`)
    }

    const etag = await generateETag(finalPng)
    const ifNoneMatch = req.headers.get("if-none-match")

    if (etag && ifNoneMatch && ifNoneMatch === etag) {
      console.log("[v0] render-week: ETag match, returning 304")
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

    console.log("[v0] render-week: Returning PNG, size:", finalPng.length, "bytes")
    return new Response(finalPng, { status: 200, headers })
  } catch (error) {
    console.error("[v0] render-week: Error generating image", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ error: "Failed to generate image", details: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
