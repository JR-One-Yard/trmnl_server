import type { CalEvent } from "./types"

interface RenderWeekProps {
  events: CalEvent[]
  startOfWeek: Date
  endOfWeek: Date
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export function renderWeekSvg({ events, startOfWeek, endOfWeek }: RenderWeekProps): string {
  const width = 800
  const height = 480
  const padding = 20
  const headerHeight = 60
  const dayWidth = (width - 2 * padding) / 7

  // Format dates for display
  const formatDate = (date: Date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    return `${days[date.getDay()]} ${date.getDate()}`
  }

  // Get week days
  const weekDays: Date[] = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    weekDays.push(day)
  }

  // Group events by day
  const eventsByDay: CalEvent[][] = weekDays.map(() => [])
  events.forEach((event) => {
    const eventDay = event.start.getDate()
    const dayIndex = weekDays.findIndex((d) => d.getDate() === eventDay)
    if (dayIndex >= 0) {
      eventsByDay[dayIndex].push(event)
    }
  })

  // Generate SVG
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`
  svg += `<rect width="${width}" height="${height}" fill="white"/>`

  // Header
  svg += `<text x="${width / 2}" y="30" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" textAnchor="middle" fill="black">Week Agenda</text>`
  svg += `<line x1="${padding}" y1="${headerHeight}" x2="${width - padding}" y2="${headerHeight}" stroke="black" strokeWidth="2"/>`

  // Day columns
  weekDays.forEach((day, i) => {
    const x = padding + i * dayWidth
    const y = headerHeight + 20

    // Day header
    svg += `<text x="${x + dayWidth / 2}" y="${y}" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle" fill="black">${formatDate(day)}</text>`

    // Events for this day
    const dayEvents = eventsByDay[i]
    dayEvents.forEach((event, j) => {
      const eventY = y + 20 + j * 40
      const eventHeight = 35

      // Event box
      svg += `<rect x="${x + 5}" y="${eventY}" width="${dayWidth - 10}" height="${eventHeight}" fill="#f0f0f0" stroke="black" strokeWidth="1" rx="3"/>`

      const title = event.title.length > 12 ? event.title.substring(0, 12) + "..." : event.title
      svg += `<text x="${x + dayWidth / 2}" y="${eventY + 15}" fontFamily="Arial, sans-serif" fontSize="10" textAnchor="middle" fill="black">${escapeXml(title)}</text>`

      // Event time (if not all-day)
      if (!event.allDay) {
        const timeStr = `${event.start.getHours()}:${event.start.getMinutes().toString().padStart(2, "0")}`
        svg += `<text x="${x + dayWidth / 2}" y="${eventY + 28}" fontFamily="Arial, sans-serif" fontSize="8" textAnchor="middle" fill="#666">${timeStr}</text>`
      } else {
        svg += `<text x="${x + dayWidth / 2}" y="${eventY + 28}" fontFamily="Arial, sans-serif" fontSize="8" textAnchor="middle" fill="#666">All Day</text>`
      }
    })
  })

  svg += `</svg>`
  return svg
}
