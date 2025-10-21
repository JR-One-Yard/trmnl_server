import type { NextRequest } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  console.log("[v0] test-bmp: Request received")
  console.log("[v0] test-bmp: Headers:", Object.fromEntries(req.headers.entries()))

  const width = 800
  const height = 480

  // Calculate row size with padding to 4-byte boundary
  const rowSize = Math.ceil(width / 8)
  const paddedRowSize = Math.ceil(rowSize / 4) * 4
  const pixelDataSize = paddedRowSize * height
  const fileSize = 62 + pixelDataSize

  const bmp = Buffer.alloc(fileSize)
  let offset = 0

  // BMP File Header (14 bytes)
  bmp.write("BM", offset)
  offset += 2 // Signature
  bmp.writeUInt32LE(fileSize, offset)
  offset += 4 // File size
  bmp.writeUInt32LE(0, offset)
  offset += 4 // Reserved
  bmp.writeUInt32LE(62, offset)
  offset += 4 // Data offset

  // DIB Header (BITMAPINFOHEADER - 40 bytes)
  bmp.writeUInt32LE(40, offset)
  offset += 4 // Header size
  bmp.writeInt32LE(width, offset)
  offset += 4 // Width
  bmp.writeInt32LE(-height, offset)
  offset += 4 // Height (negative for top-down)
  bmp.writeUInt16LE(1, offset)
  offset += 2 // Planes
  bmp.writeUInt16LE(1, offset)
  offset += 2 // Bits per pixel (1-bit monochrome)
  bmp.writeUInt32LE(0, offset)
  offset += 4 // Compression (none)
  bmp.writeUInt32LE(pixelDataSize, offset)
  offset += 4 // Image size
  bmp.writeInt32LE(2835, offset)
  offset += 4 // X pixels per meter
  bmp.writeInt32LE(2835, offset)
  offset += 4 // Y pixels per meter
  bmp.writeUInt32LE(2, offset)
  offset += 4 // Colors used
  bmp.writeUInt32LE(2, offset)
  offset += 4 // Important colors

  // Color Palette (8 bytes - 2 colors × 4 bytes each)
  // Black (index 0)
  bmp.writeUInt8(0, offset++)
  bmp.writeUInt8(0, offset++)
  bmp.writeUInt8(0, offset++)
  bmp.writeUInt8(0, offset++)
  // White (index 1)
  bmp.writeUInt8(255, offset++)
  bmp.writeUInt8(255, offset++)
  bmp.writeUInt8(255, offset++)
  bmp.writeUInt8(0, offset++)

  for (let y = 0; y < height; y++) {
    // Every 40 lines alternate between black (0x00) and white (0xFF)
    const pattern = Math.floor(y / 40) % 2 === 0 ? 0x00 : 0xff

    for (let x = 0; x < rowSize; x++) {
      bmp.writeUInt8(pattern, offset++)
    }

    // Padding to 4-byte boundary
    for (let p = rowSize; p < paddedRowSize; p++) {
      bmp.writeUInt8(0, offset++)
    }
  }

  console.log("[v0] test-bmp: Generated BMP with horizontal stripes", {
    width,
    height,
    fileSize,
    pixelDataSize,
    rowSize,
    paddedRowSize,
  })

  return new Response(bmp, {
    status: 200,
    headers: {
      "Content-Type": "image/bmp",
      "Content-Length": bmp.length.toString(),
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Cache-Control": "no-cache",
    },
  })
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Max-Age": "86400",
    },
  })
}
