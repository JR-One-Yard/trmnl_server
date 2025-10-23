import { NextResponse } from "next/server"
import { convertToBMP } from "@/lib/calendar/bmp-converter"
import { logInfo, logError } from "@/lib/logger"
import getData from "@/app/recipes/screens/year-progress/getData"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const revalidate = 0

function renderSevenSegment(digit: string, x: number, y: number, size: number): string {
  const segments: { [key: string]: boolean[] } = {
    "0": [true, true, true, false, true, true, true],
    "1": [false, false, true, false, false, true, false],
    "2": [true, false, true, true, true, false, true],
    "3": [true, false, true, true, false, true, true],
    "4": [false, true, true, true, false, true, false],
    "5": [true, true, false, true, false, true, true],
    "6": [true, true, false, true, true, true, true],
    "7": [true, false, true, false, false, true, false],
    "8": [true, true, true, true, true, true, true],
    "9": [true, true, true, true, false, true, true],
    " ": [false, false, false, false, false, false, false],
  }

  const segs = segments[digit] || segments[" "]
  const w = size * 0.8
  const h = size * 0.15
  const gap = size * 0.05

  let svg = ""

  // Top (0)
  if (segs[0]) svg += `<rect x="${x + gap}" y="${y}" width="${w}" height="${h}" fill="black"/>`
  // Top-left (1)
  if (segs[1]) svg += `<rect x="${x}" y="${y + gap}" width="${h}" height="${w}" fill="black"/>`
  // Top-right (2)
  if (segs[2]) svg += `<rect x="${x + w + gap}" y="${y + gap}" width="${h}" height="${w}" fill="black"/>`
  // Middle (3)
  if (segs[3]) svg += `<rect x="${x + gap}" y="${y + w + gap}" width="${w}" height="${h}" fill="black"/>`
  // Bottom-left (4)
  if (segs[4]) svg += `<rect x="${x}" y="${y + w + gap * 2 + h}" width="${h}" height="${w}" fill="black"/>`
  // Bottom-right (5)
  if (segs[5]) svg += `<rect x="${x + w + gap}" y="${y + w + gap * 2 + h}" width="${h}" height="${w}" fill="black"/>`
  // Bottom (6)
  if (segs[6]) svg += `<rect x="${x + gap}" y="${y + w * 2 + gap * 2 + h}" width="${w}" height="${h}" fill="black"/>`

  return svg
}

function renderNumber(num: number, x: number, y: number, digitSize: number): string {
  const str = num.toString()
  let svg = ""
  const spacing = digitSize * 1.2

  for (let i = 0; i < str.length; i++) {
    svg += renderSevenSegment(str[i], x + i * spacing, y, digitSize)
  }

  return svg
}

function renderDotMatrixSymbol(symbol: string, x: number, y: number, size: number): string {
  const patterns: { [key: string]: number[][] } = {
    "/": [
      [0, 0, 0, 1],
      [0, 0, 1, 0],
      [0, 1, 0, 0],
      [1, 0, 0, 0],
    ],
    "%": [
      [1, 1, 0, 0, 1],
      [1, 1, 0, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 1, 1],
      [1, 0, 0, 1, 1],
    ],
  }

  const pattern = patterns[symbol]
  if (!pattern) return ""

  let svg = ""
  const dotSize = size / 6
  const spacing = size / 5

  for (let row = 0; row < pattern.length; row++) {
    for (let col = 0; col < pattern[row].length; col++) {
      if (pattern[row][col]) {
        svg += `<circle cx="${x + col * spacing}" cy="${y + row * spacing}" r="${dotSize}" fill="black"/>`
      }
    }
  }

  return svg
}

function renderDotText(text: string, x: number, y: number, dotSize: number): string {
  // Simple dot matrix for basic characters
  const chars: { [key: string]: number[][] } = {
    D: [
      [1, 1, 1, 0],
      [1, 0, 0, 1],
      [1, 0, 0, 1],
      [1, 0, 0, 1],
      [1, 1, 1, 0],
    ],
    a: [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [1, 0, 1, 0],
      [1, 0, 1, 0],
      [0, 1, 1, 1],
    ],
    y: [
      [0, 0, 0, 0],
      [1, 0, 0, 1],
      [1, 0, 0, 1],
      [0, 1, 1, 1],
      [0, 0, 0, 1],
      [0, 1, 1, 0],
    ],
    o: [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [1, 0, 0, 1],
      [1, 0, 0, 1],
      [0, 1, 1, 0],
    ],
    f: [
      [0, 0, 1, 1],
      [0, 1, 0, 0],
      [1, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
    " ": [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
  }

  let svg = ""
  let offsetX = 0

  for (const char of text.toLowerCase()) {
    const matrix = chars[char] || chars[" "]
    const width = matrix[0]?.length || 3

    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col]) {
          svg += `<circle cx="${x + offsetX + col * dotSize * 1.5}" cy="${y + row * dotSize * 1.5}" r="${dotSize / 2}" fill="black"/>`
        }
      }
    }

    offsetX += width * dotSize * 1.5 + dotSize
  }

  return svg
}

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
    const availableHeight = canvasHeight - 2 * margin - 80 // More space for footer

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

    const footerY = 410
    const digitSize = 22

    // Left: "296 / 365" format
    const dayNumberSvg = renderNumber(data.dayIndex, 60, footerY, digitSize)
    const slashSvg = renderDotMatrixSymbol("/", 190, footerY + 10, 20)
    const totalNumberSvg = renderNumber(data.totalDays, 220, footerY, digitSize)

    // Right: "81%" format
    const percentage = Math.round(data.percentage * 100)
    const percentSvg = renderNumber(percentage, 620, footerY, digitSize)
    const percentSymbolSvg = renderDotMatrixSymbol("%", 710, footerY + 5, 25)

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="480" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="480" fill="white"/>
  
  <!-- Dots Grid -->
  ${dotsHtml}
  
  <!-- Footer Separator -->
  <line x1="40" y1="390" x2="760" y2="390" stroke="black" strokeWidth="2"/>
  
  <!-- Day Counter: "296 / 365" -->
  ${dayNumberSvg}
  ${slashSvg}
  ${totalNumberSvg}
  
  <!-- Percentage: "81%" -->
  ${percentSvg}
  ${percentSymbolSvg}
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
