import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  console.log("[v0] test-bmp: Request received")
  console.log("[v0] test-bmp: Headers:", Object.fromEntries(req.headers.entries()))
  
  // Create a simple 800x480 1-bit BMP with just text "TEST"
  const width = 800
  const height = 480
  const rowSize = Math.ceil(width / 8)
  const paddedRowSize = Math.ceil(rowSize / 4) * 4
  const pixelDataSize = paddedRowSize * height
  const fileSize = 62 + pixelDataSize
  
  const bmp = Buffer.alloc(fileSize)
  let offset = 0
  
  // BMP File Header
  bmp.write('BM', offset); offset += 2
  bmp.writeUInt32LE(fileSize, offset); offset += 4
  bmp.writeUInt32LE(0, offset); offset += 4
  bmp.writeUInt32LE(62, offset); offset += 4
  
  // DIB Header
  bmp.writeUInt32LE(40, offset); offset += 4
  bmp.writeInt32LE(width, offset); offset += 4
  bmp.writeInt32LE(-height, offset); offset += 4
  bmp.writeUInt16LE(1, offset); offset += 2
  bmp.writeUInt16LE(1, offset); offset += 2
  bmp.writeUInt32LE(0, offset); offset += 4
  bmp.writeUInt32LE(pixelDataSize, offset); offset += 4
  bmp.writeInt32LE(2835, offset); offset += 4
  bmp.writeInt32LE(2835, offset); offset += 4
  bmp.writeUInt32LE(2, offset); offset += 4
  bmp.writeUInt32LE(2, offset); offset += 4
  
  // Color Palette
  // Black
  bmp.writeUInt8(0, offset++); bmp.writeUInt8(0, offset++); bmp.writeUInt8(0, offset++); bmp.writeUInt8(0, offset++)
  // White
  bmp.writeUInt8(255, offset++); bmp.writeUInt8(255, offset++); bmp.writeUInt8(255, offset++); bmp.writeUInt8(0, offset++)
  
  // Fill with white pixels (all 1s) and add "TEST" pattern
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < rowSize; x++) {
      // Create a simple pattern - black box in center
      if (y > 200 && y < 280 && x > 40 && x < 60) {
        bmp.writeUInt8(0x00, offset++) // Black pixels
      } else {
        bmp.writeUInt8(0xFF, offset++) // White pixels
      }
    }
    // Padding
    for (let p = rowSize; p < paddedRowSize; p++) {
      bmp.writeUInt8(0, offset++)
    }
  }
  
  console.log("[v0] test-bmp: Returning BMP, size:", bmp.length)
  
  return new Response(bmp, {
    status: 200,
    headers: {
      "Content-Type": "image/bmp",
      "Content-Length": bmp.length.toString(),
      "Cache-Control": "no-cache",
    },
  })
}
