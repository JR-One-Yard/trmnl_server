import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logInfo, logError } from "@/lib/logger"
import { convertToBMP } from "@/lib/calendar/bmp-converter"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const deviceId = url.searchParams.get("device_id") || url.searchParams.get("device")
    const testMode = !deviceId

    await logInfo("Render request received", { deviceId, testMode })

    const content = {
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      message: "TRMNL Test Display",
      device: testMode ? "Test Mode" : "Loading...",
    }

    if (deviceId && !testMode) {
      const supabase = await createClient()
      const { data: device } = await supabase.from("devices").select("*").eq("id", deviceId).single()

      if (device) {
        content.device = device.friendly_id || device.name || "Unknown Device"
        content.message = `Hello ${device.name || "Device"}!`
      }
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="480" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="480" fill="white"/>
  
  <!-- Header -->
  <text x="400" y="80" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="black">
    ${content.message}
  </text>
  
  <!-- Time -->
  <text x="400" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="black">
    ${content.time}
  </text>
  
  <!-- Date -->
  <text x="400" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="black">
    ${content.date}
  </text>
  
  <!-- Device Info -->
  <text x="400" y="380" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#666">
    Device: ${content.device}
  </text>
  
  <!-- Footer -->
  <text x="400" y="450" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#999">
    TRMNL BYOS • ${new Date().toISOString().split("T")[0]}
  </text>
</svg>`

    const sharp = (await import("sharp")).default
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer()
    const bmpBuffer = await convertToBMP(pngBuffer)

    await logInfo("Image generated successfully", {
      deviceId,
      testMode,
      bmpSize: bmpBuffer.length,
    })

    return new Response(bmpBuffer, {
      headers: {
        "Content-Type": "image/bmp",
        "Content-Length": bmpBuffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, ID, Access-Token",
      },
    })
  } catch (error) {
    await logError("Render error", { error: String(error) })
    return NextResponse.json({ error: "Image generation failed", details: String(error) }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, ID, Access-Token",
      "Access-Control-Max-Age": "86400",
    },
  })
}
