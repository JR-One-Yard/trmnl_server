import type { CalendarEvent } from "./types"

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export function renderWeekSvg({
  events,
  startOfWeek,
  endOfWeek,
}: { events: CalendarEvent[]; startOfWeek: Date; endOfWeek: Date }): string {
  const width = 800
  const height = 480
  const padding = 10
  const headerHeight = 50
  const dayWidth = (width - padding * 2) / 7
  const contentHeight = height - headerHeight - padding * 2

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`
  svg += `<rect width="${width}" height="${height}" fill="white"/>`

  // Header
  svg += `<text x="${Math.floor(width / 2)}" y="30" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="black">Week Agenda</text>`
  svg += `<line x1="${padding}" y1="${headerHeight}" x2="${width - padding}" y2="${headerHeight}" stroke="black" stroke-width="2"/>`

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    return day
  })

  // Draw day columns
  weekDays.forEach((day, i) => {
    const x = padding + i * dayWidth
    const y = headerHeight + 20

    // Day header
    const formatDate = (d: Date) => {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      return `${days[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`
    }

    svg += `<text x="${Math.floor(x + dayWidth / 2)}" y="${y}" font-family="Arial" font-size="14" font-weight="bold" text-anchor="middle" fill="black">${escapeXml(formatDate(day))}</text>`

    // Draw events for this day
    const dayEvents = events
      .filter((e) => {
        const eventDate = new Date(e.start)
        return eventDate.toDateString() === day.toDateString()
      })
      .slice(0, 3)

    dayEvents.forEach((event, eventIndex) => {
      const eventY = y + 20 + eventIndex * 40
      const eventHeight = 35

      svg += `<rect x="${x + 5}" y="${eventY}" width="${dayWidth - 10}" height="${eventHeight}" fill="#f0f0f0" stroke="black" stroke-width="1" rx="3"/>`

      const summary = event.summary || "Untitled Event"
      const title = summary.length > 15 ? summary.substring(0, 12) + "..." : summary
      svg += `<text x="${Math.floor(x + dayWidth / 2)}" y="${eventY + 15}" font-family="Arial" font-size="10" text-anchor="middle" fill="black">${escapeXml(title)}</text>`

      if (event.start && event.end) {
        const startTime = new Date(event.start).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        const timeStr = `${startTime}`
        svg += `<text x="${Math.floor(x + dayWidth / 2)}" y="${eventY + 28}" font-family="Arial" font-size="8" text-anchor="middle" fill="#666">${escapeXml(timeStr)}</text>`
      } else {
        svg += `<text x="${Math.floor(x + dayWidth / 2)}" y="${eventY + 28}" font-family="Arial" font-size="8" text-anchor="middle" fill="#666">All Day</text>`
      }
    })

    // Draw column separator
    if (i < 6) {
      svg += `<line x1="${x + dayWidth}" y1="${headerHeight}" x2="${x + dayWidth}" y2="${height - padding}" stroke="#ccc" stroke-width="1"/>`
    }
  })

  svg += `</svg>`
  return svg
}
