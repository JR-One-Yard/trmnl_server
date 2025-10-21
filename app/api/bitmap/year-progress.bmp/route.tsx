import { NextResponse } from "next/server"
import { convertToBMP } from "@/lib/calendar/bmp-converter"
import { logInfo, logError } from "@/lib/logger"
import getData from "@/app/recipes/screens/year-progress/getData"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    await logInfo("Year progress bitmap generation started")

    // Get current year progress data
    const data = await getData()

    await logInfo("Year progress data calculated", {
      dayIndex: data.dayIndex,
      totalDays: data.totalDays,
      percentage: data.percentage,
    })

    // Grid configuration for optimal layout on 800x480
    const canvasWidth = 800
    const canvasHeight = 480
    const margin = 40
    const availableWidth = canvasWidth - 2 * margin
    const availableHeight = canvasHeight - 2 * margin - 60

    // Calculate optimal grid dimensions
    const targetAspectRatio = availableWidth / availableHeight
    let bestCols = 14
    let bestRows = 27
    let bestScore = Number.POSITIVE_INFINITY

    for (let cols = 10; cols <= 20; cols++) {
      const rows = Math.ceil(366 / cols)
      const aspectRatio = cols / rows
      const aspectScore = Math.abs(aspectRatio - targetAspectRatio)
      const totalSlots = cols * rows

      if (totalSlots >= data.totalDays && aspectScore < bestScore) {
        bestCols = cols
        bestRows = rows
        bestScore = aspectScore
      }
    }

    const cols = bestCols
    const rows = bestRows

    const maxDotWidth = Math.floor(availableWidth / cols)
    const maxDotHeight = Math.floor(availableHeight / rows)
    const dotSize = Math.min(maxDotWidth, maxDotHeight) - 2

    const gridWidth = cols * maxDotWidth
    const gridHeight = rows * maxDotHeight
    const startX = margin + (availableWidth - gridWidth) / 2
    const startY = margin + (availableHeight - gridHeight) / 2

    // Generate SVG
    let dotsHtml = ""
    for (let i = 0; i < data.totalDays; i++) {
      const row = Math.floor(i / cols)
      const col = i % cols
      const x = startX + col * maxDotWidth + maxDotWidth / 2
      const y = startY + row * maxDotHeight + maxDotHeight / 2
      const filled = i < data.dayIndex

      dotsHtml += `<circle cx="${x}" cy="${y}" r="${dotSize / 2}" fill="${filled ? "black" : "white"}" stroke="black" strokeWidth="2"/>`
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="480" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="480" fill="white"/>
  
  <!-- Dots Grid -->
  ${dotsHtml}
  
  <!-- Footer -->
  <line x1="40" y1="420" x2="760" y2="420" stroke="black" strokeWidth="2"/>
  
  <text x="60" y="450" fontFamily="monospace" fontSize="20" fill="black">
    Day ${data.dayIndex} of ${data.totalDays}
  </text>
  
  <text x="400" y="450" textAnchor="middle" fontFamily="monospace" fontSize="20" fill="black">
    ${data.currentDate}
  </text>
  
  <text x="740" y="450" textAnchor="end" fontFamily="monospace" fontSize="20" fill="black">
    ${(data.percentage * 100).toFixed(1)}%
  </text>
</svg>`

    // Convert SVG to PNG then to BMP
    const sharp = (await import("sharp")).default
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer()
    const bmpBuffer = await convertToBMP(pngBuffer)

    await logInfo("Year progress bitmap generated successfully", {
      bmpSize: bmpBuffer.length,
      dayIndex: data.dayIndex,
      totalDays: data.totalDays,
    })

    return new Response(bmpBuffer, {
      headers: {
        "Content-Type": "image/bmp",
        "Content-Length": bmpBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    await logError("Year progress bitmap generation failed", { error: String(error) })
    return NextResponse.json({ error: "Bitmap generation failed", details: String(error) }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
