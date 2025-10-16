import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

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
  <text x="${width / 2}" y="${height / 2 - 40}" font-family="Arial, sans-serif" font-size="48" fill="#FFFFFF" text-anchor="middle" font-weight="bold">
    TRMNL
  </text>
  <text x="${width / 2}" y="${height / 2 + 20}" font-family="Arial, sans-serif" font-size="24" fill="#CCCCCC" text-anchor="middle">
    Device: ${device.name || device.device_id}
  </text>
  <text x="${width / 2}" y="${height / 2 + 60}" font-family="Arial, sans-serif" font-size="18" fill="#999999" text-anchor="middle">
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
  <text x="${width / 2}" y="${height / 2 - 20}" font-family="Arial, sans-serif" font-size="96" fill="#000000" text-anchor="middle" font-weight="bold">
    ${time}
  </text>
  <text x="${width / 2}" y="${height / 2 + 60}" font-family="Arial, sans-serif" font-size="28" fill="#666666" text-anchor="middle">
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
  <text x="${width / 2}" y="80" font-family="Arial, sans-serif" font-size="32" fill="#FFFFFF" text-anchor="middle" font-weight="bold">
    ${location}
  </text>
  <text x="${width / 2}" y="${height / 2}" font-family="Arial, sans-serif" font-size="120" fill="#FFFFFF" text-anchor="middle" font-weight="bold">
    ${temp}
  </text>
  <text x="${width / 2}" y="${height / 2 + 80}" font-family="Arial, sans-serif" font-size="36" fill="#FFFFFF" text-anchor="middle">
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
  <text x="${width / 2}" y="${height / 2 - 40}" font-family="Georgia, serif" font-size="32" fill="#FFFFFF" text-anchor="middle" font-style="italic">
    "${quote}"
  </text>
  <text x="${width / 2}" y="${height / 2 + 40}" font-family="Arial, sans-serif" font-size="24" fill="#CCCCCC" text-anchor="middle">
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
  <text x="${width / 2}" y="${height / 2 - 40}" font-family="Arial, sans-serif" font-size="48" fill="${textColor}" text-anchor="middle" font-weight="bold">
    ${title}
  </text>
  <text x="${width / 2}" y="${height / 2 + 20}" font-family="Arial, sans-serif" font-size="24" fill="${textColor}" text-anchor="middle">
    ${content}
  </text>
</svg>`
}

function generateDefaultScreen(width: number, height: number, screen: any): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#F5F5F5"/>
  <text x="${width / 2}" y="${height / 2}" font-family="Arial, sans-serif" font-size="36" fill="#333333" text-anchor="middle">
    ${screen.name}
  </text>
</svg>`
}
