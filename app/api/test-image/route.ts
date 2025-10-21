import type { NextRequest } from "next/server"
import { logInfo } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    await logInfo("Test image request received")

    const width = 800
    const height = 480
    const bmp = createTestBmp(width, height)

    return new Response(bmp, {
      headers: {
        "Content-Type": "image/bmp",
        "Content-Length": bmp.length.toString(),
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Test image generation failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

function createTestBmp(width: number, height: number): Buffer {
  const headerSize = 62 // 14 (file) + 40 (info) + 8 (palette)
  const rowSize = Math.ceil(width / 8)
  const paddedRowSize = Math.ceil(rowSize / 4) * 4
  const pixelDataSize = paddedRowSize * height
  const fileSize = headerSize + pixelDataSize

  const bmp = Buffer.alloc(fileSize)
  let offset = 0

  // BMP File Header (14 bytes)
  bmp.write("BM", offset)
  offset += 2
  bmp.writeUInt32LE(fileSize, offset)
  offset += 4
  bmp.writeUInt32LE(0, offset)
  offset += 4
  bmp.writeUInt32LE(headerSize, offset)
  offset += 4

  // DIB Header (40 bytes)
  bmp.writeUInt32LE(40, offset)
  offset += 4
  bmp.writeInt32LE(width, offset)
  offset += 4
  bmp.writeInt32LE(height, offset)
  offset += 4
  bmp.writeUInt16LE(1, offset)
  offset += 2
  bmp.writeUInt16LE(1, offset)
  offset += 2 // 1-bit
  bmp.writeUInt32LE(0, offset)
  offset += 4
  bmp.writeUInt32LE(pixelDataSize, offset)
  offset += 4
  bmp.writeInt32LE(2835, offset)
  offset += 4
  bmp.writeInt32LE(2835, offset)
  offset += 4
  bmp.writeUInt32LE(2, offset)
  offset += 4
  bmp.writeUInt32LE(2, offset)
  offset += 4

  // Color Palette (8 bytes)
  bmp.writeUInt8(0, offset++)
  bmp.writeUInt8(0, offset++)
  bmp.writeUInt8(0, offset++)
  bmp.writeUInt8(0, offset++)
  bmp.writeUInt8(255, offset++)
  bmp.writeUInt8(255, offset++)
  bmp.writeUInt8(255, offset++)
  bmp.writeUInt8(0, offset++)

  for (let y = height - 1; y >= 0; y--) {
    const pattern = Math.floor(y / 40) % 2 === 0 ? 0xff : 0x00
    for (let x = 0; x < rowSize; x++) {
      bmp[offset++] = pattern
    }
    // Add padding
    const padding = paddedRowSize - rowSize
    for (let p = 0; p < padding; p++) {
      bmp[offset++] = 0
    }
  }

  return bmp
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  })
}
