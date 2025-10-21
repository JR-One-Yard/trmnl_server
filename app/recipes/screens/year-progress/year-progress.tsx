import { PreSatori } from "@/utils/pre-satori"

interface YearProgressProps {
  dayIndex?: number
  totalDays?: number
  currentDate?: string
  percentage?: number
}

export default function YearProgress({
  dayIndex = 1,
  totalDays = 365,
  currentDate = "2025-01-01",
  percentage = 0.27,
}: YearProgressProps) {
  // Grid configuration for optimal layout on 800x480
  const canvasWidth = 800
  const canvasHeight = 480
  const margin = 40
  const availableWidth = canvasWidth - 2 * margin
  const availableHeight = canvasHeight - 2 * margin - 60 // Reserve space for footer

  // Calculate optimal grid dimensions
  // We want to fit at least 366 dots (leap year) in a visually balanced grid
  const targetAspectRatio = availableWidth / availableHeight

  // Try different column counts to find the best fit
  let bestCols = 14
  let bestRows = 27
  let bestScore = Number.POSITIVE_INFINITY

  for (let cols = 10; cols <= 20; cols++) {
    const rows = Math.ceil(366 / cols)
    const aspectRatio = cols / rows
    const aspectScore = Math.abs(aspectRatio - targetAspectRatio)
    const totalSlots = cols * rows

    // Prefer grids that fit all days with good aspect ratio
    if (totalSlots >= totalDays && aspectScore < bestScore) {
      bestCols = cols
      bestRows = rows
      bestScore = aspectScore
    }
  }

  const cols = bestCols
  const rows = bestRows

  // Calculate dot size and spacing to fit in available space
  const maxDotWidth = Math.floor(availableWidth / cols)
  const maxDotHeight = Math.floor(availableHeight / rows)
  const dotSize = Math.min(maxDotWidth, maxDotHeight) - 2 // Leave 2px spacing

  const gridWidth = cols * maxDotWidth
  const gridHeight = rows * maxDotHeight
  const startX = margin + (availableWidth - gridWidth) / 2
  const startY = margin + (availableHeight - gridHeight) / 2

  // Generate dots array
  const dots: { x: number; y: number; filled: boolean; index: number }[] = []
  for (let i = 0; i < totalDays; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols
    const x = startX + col * maxDotWidth + maxDotWidth / 2
    const y = startY + row * maxDotHeight + maxDotHeight / 2
    const filled = i < dayIndex

    dots.push({ x, y, filled, index: i + 1 })
  }

  return (
    <PreSatori>
      {(transform) => (
        <>
          {transform(
            <div className="w-[800px] h-[480px] bg-white flex flex-col">
              <div className="flex-1 relative">
                {/* Render dots as simple filled/outlined circles */}
                {dots.map((dot, i) => (
                  <div
                    key={i}
                    className={`absolute rounded-full border-2 border-black ${dot.filled ? "bg-black" : "bg-white"}`}
                    style={{
                      left: dot.x - dotSize / 2,
                      top: dot.y - dotSize / 2,
                      width: dotSize,
                      height: dotSize,
                    }}
                  />
                ))}
              </div>

              {/* Footer with progress info */}
              <div className="flex-none p-4 border-t border-black">
                <div className="flex justify-between items-center text-xl font-mono">
                  <span>
                    Day {dayIndex} of {totalDays}
                  </span>
                  <span>{currentDate}</span>
                  <span>{(percentage * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>,
          )}
        </>
      )}
    </PreSatori>
  )
}
