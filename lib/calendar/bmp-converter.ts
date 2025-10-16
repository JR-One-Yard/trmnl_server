/**
 * Convert PNG buffer to 1-bit BMP for e-ink displays
 * TRMNL devices expect 800x480 1-bit BMP images
 */

export async function convertToBMP(pngBuffer: Buffer): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  
  // Convert to grayscale and resize to exact TRMNL dimensions
  const processedBuffer = await sharp(pngBuffer)
    .resize(800, 480, { 
      fit: 'contain',
      background: { r: 255, g: 255, b: 255 }
    })
    .grayscale()
    .toBuffer();

  // Convert to 1-bit BMP
  const { data, info } = await sharp(processedBuffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Create 1-bit BMP manually
  const width = info.width;
  const height = info.height;
  const rowSize = Math.ceil(width / 8);
  const paddedRowSize = Math.ceil(rowSize / 4) * 4; // BMP rows must be multiple of 4 bytes
  const pixelDataSize = paddedRowSize * height;
  const fileSize = 62 + pixelDataSize; // 62 = 14 (file header) + 40 (info header) + 8 (color palette)

  const bmpBuffer = Buffer.alloc(fileSize);
  let offset = 0;

  // BMP File Header (14 bytes)
  bmpBuffer.write('BM', offset); offset += 2; // Signature
  bmpBuffer.writeUInt32LE(fileSize, offset); offset += 4; // File size
  bmpBuffer.writeUInt32LE(0, offset); offset += 4; // Reserved
  bmpBuffer.writeUInt32LE(62, offset); offset += 4; // Pixel data offset

  // DIB Header (BITMAPINFOHEADER - 40 bytes)
  bmpBuffer.writeUInt32LE(40, offset); offset += 4; // Header size
  bmpBuffer.writeInt32LE(width, offset); offset += 4; // Width
  bmpBuffer.writeInt32LE(-height, offset); offset += 4; // Height (negative for top-down)
  bmpBuffer.writeUInt16LE(1, offset); offset += 2; // Planes
  bmpBuffer.writeUInt16LE(1, offset); offset += 2; // Bits per pixel (1-bit)
  bmpBuffer.writeUInt32LE(0, offset); offset += 4; // Compression (none)
  bmpBuffer.writeUInt32LE(pixelDataSize, offset); offset += 4; // Image size
  bmpBuffer.writeInt32LE(2835, offset); offset += 4; // X pixels per meter (72 DPI)
  bmpBuffer.writeInt32LE(2835, offset); offset += 4; // Y pixels per meter (72 DPI)
  bmpBuffer.writeUInt32LE(2, offset); offset += 4; // Colors used (2 for 1-bit)
  bmpBuffer.writeUInt32LE(2, offset); offset += 4; // Important colors

  // Color Palette (8 bytes for 1-bit BMP)
  // Color 0: Black
  bmpBuffer.writeUInt8(0, offset++); // Blue
  bmpBuffer.writeUInt8(0, offset++); // Green
  bmpBuffer.writeUInt8(0, offset++); // Red
  bmpBuffer.writeUInt8(0, offset++); // Reserved
  // Color 1: White
  bmpBuffer.writeUInt8(255, offset++); // Blue
  bmpBuffer.writeUInt8(255, offset++); // Green
  bmpBuffer.writeUInt8(255, offset++); // Red
  bmpBuffer.writeUInt8(0, offset++); // Reserved

  // Pixel data (1-bit packed)
  for (let y = 0; y < height; y++) {
    let byte = 0;
    let bitIndex = 0;
    
    for (let x = 0; x < width; x++) {
      const pixelIndex = (y * width + x) * info.channels;
      const gray = data[pixelIndex];
      
      // Threshold at 128 (50% gray)
      const bit = gray > 128 ? 1 : 0;
      byte = (byte << 1) | bit;
      bitIndex++;
      
      if (bitIndex === 8 || x === width - 1) {
        // Shift remaining bits if at end of row
        if (x === width - 1 && bitIndex < 8) {
          byte <<= (8 - bitIndex);
        }
        bmpBuffer.writeUInt8(byte, offset++);
        byte = 0;
        bitIndex = 0;
      }
    }
    
    // Add padding to make row size multiple of 4
    const padding = paddedRowSize - rowSize;
    for (let p = 0; p < padding; p++) {
      bmpBuffer.writeUInt8(0, offset++);
    }
  }

  return bmpBuffer;
}