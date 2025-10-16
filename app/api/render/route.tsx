import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { renderWeekSvg } from "@/lib/calendar/renderWeekSvg"
import { convertToBMP } from "@/lib/calendar/bmp-converter"
import { Resvg } from "@resvg/resvg-js"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const deviceId = searchParams.get("device_id")
    const screenId = searchParams.get("screen_id")
    const type = searchParams.get("type")

    if (!deviceId) {
      return NextResponse.json({ error: "Device ID is required" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Get device
    const { data: device } = await supabase.from("devices").select("*").eq("device_id", deviceId).single()

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

    let screenData = null

    if (screenId) {
      const { data } = await supabase.from("screens").select("*").eq("id", screenId).single()
      screenData = data
    }

    if (screenData?.type === "calendar-week") {
      const userAgent = request.headers.get("user-agent") || ""
      const isBrowser = userAgent.includes("Mozilla") || userAgent.includes("Chrome")

      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      // Mock events for testing
      const events = [
        {
          summary: "Team Meeting",
          start: new Date(startOfWeek.getTime() + 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
          end: new Date(startOfWeek.getTime() + 2 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000).toISOString(),
        },
        {
          summary: "Lunch with Client",
          start: new Date(startOfWeek.getTime() + 3 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000).toISOString(),
          end: new Date(startOfWeek.getTime() + 3 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000).toISOString(),
        },
        {
          summary: "Project Review",
          start: new Date(startOfWeek.getTime() + 4 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000).toISOString(),
          end: new Date(startOfWeek.getTime() + 4 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000).toISOString(),
        },
      ]

      const svg = renderWeekSvg({ events, startOfWeek, endOfWeek })

      // Return SVG for browsers, BMP for TRMNL devices
      if (isBrowser) {
        return new NextResponse(svg, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        })
      }

      // Convert to BMP for TRMNL device
      const resvg = new Resvg(svg, {
        fitTo: { mode: "width", value: 800 },
        font: { loadSystemFonts: true },
      })
      const pngData = resvg.render()
      const png = pngData.asPng()
      const bmp = convertToBMP(png)

      return new NextResponse(bmp, {
        headers: {
          "Content-Type": "image/bmp",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })
    }

    // Generate SVG image based on screen type
    const svg = generateScreenSVG(device, screenData, type)

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("[v0] Render error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateScreenSVG(device: any, screen: any, type: string | null): string {
  const width = 800
  const height = 480

  if (!screen || type === "default") {
    // Default welcome screen
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#000000"/>
  <text x="${width / 2}" y="${height / 2 - 40}" fontFamily="Arial, sans-serif" fontSize="48" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">
    TRMNL
  </text>
  <text x="${width / 2}" y="${height / 2 + 20}" fontFamily="Arial, sans-serif" fontSize="24" fill="#CCCCCC" textAnchor="middle">
    Device: ${device.name || device.device_id}
  </text>
  <text x="${width / 2}" y="${height / 2 + 60}" fontFamily="Arial, sans-serif" fontSize="18" fill="#999999" textAnchor="middle">
    Configure your screen in the dashboard
  </text>
</svg>`
  }

  // Generate screen based on type
  switch (screen.type) {
    case "clock":
      return generateClockScreen(width, height, screen.config)
    case "weather":
      return generateWeatherScreen(width, height, screen.config)
    case "quote":
      return generateQuoteScreen(width, height, screen.config)
    case "custom":
      return generateCustomScreen(width, height, screen.config)
    default:
      return generateDefaultScreen(width, height, screen)
  }
}

function generateClockScreen(width: number, height: number, config: any): string {
  const now = new Date()
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  const date = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#FFFFFF"/>
  <text x="${width / 2}" y="${height / 2 - 20}" fontFamily="Arial, sans-serif" fontSize="96" fill="#000000" textAnchor="middle" fontWeight="bold">
    ${time}
  </text>
  <text x="${width / 2}" y="${height / 2 + 60}" fontFamily="Arial, sans-serif" fontSize="28" fill="#666666" textAnchor="middle">
    ${date}
  </text>
</svg>`
}

function generateWeatherScreen(width: number, height: number, config: any): string {
  const temp = config.temperature || "72°F"
  const condition = config.condition || "Sunny"
  const location = config.location || "Your Location"

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#87CEEB"/>
  <text x="${width / 2}" y="80" fontFamily="Arial, sans-serif" fontSize="32" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">
    ${location}
  </text>
  <text x="${width / 2}" y="${height / 2}" fontFamily="Arial, sans-serif" fontSize="120" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">
    ${temp}
  </text>
  <text x="${width / 2}" y="${height / 2 + 80}" fontFamily="Arial, sans-serif" fontSize="36" fill="#FFFFFF" textAnchor="middle">
    ${condition}
  </text>
</svg>`
}

function generateQuoteScreen(width: number, height: number, config: any): string {
  const quote = config.quote || "The only way to do great work is to love what you do."
  const author = config.author || "Steve Jobs"

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#1a1a1a"/>
  <text x="${width / 2}" y="${height / 2 - 40}" fontFamily="Georgia, serif" fontSize="32" fill="#FFFFFF" textAnchor="middle" fontStyle="italic">
    "${quote}"
  </text>
  <text x="${width / 2}" y="${height / 2 + 40}" fontFamily="Arial, sans-serif" fontSize="24" fill="#CCCCCC" textAnchor="middle">
    — ${author}
  </text>
</svg>`
}

function generateCustomScreen(width: number, height: number, config: any): string {
  const title = config.title || "Custom Screen"
  const content = config.content || "Configure your custom content"
  const bgColor = config.backgroundColor || "#FFFFFF"
  const textColor = config.textColor || "#000000"

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  <text x="${width / 2}" y="${height / 2 - 40}" fontFamily="Arial, sans-serif" fontSize="48" fill="${textColor}" textAnchor="middle" fontWeight="bold">
    ${title}
  </text>
  <text x="${width / 2}" y="${height / 2 + 20}" fontFamily="Arial, sans-serif" fontSize="24" fill="${textColor}" textAnchor="middle">
    ${content}
  </text>
</svg>`
}

function generateDefaultScreen(width: number, height: number, screen: any): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#F5F5F5"/>
  <text x="${width / 2}" y="${height / 2}" fontFamily="Arial, sans-serif" fontSize="36" fill="#333333" textAnchor="middle">
    ${screen.name}
  </text>
</svg>`
}
