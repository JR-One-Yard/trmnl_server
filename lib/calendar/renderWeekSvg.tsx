import type { CalEvent } from "./types"

const W = 800,
  H = 480,
  PAD = 20,
  HEADER = 36,
  DAY_GAP = 4

function esc(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!)
}

function fmtHM(d: Date) {
  // 24h local display HH:mm
  const hh = d.getHours().toString().padStart(2, "0")
  const mm = d.getMinutes().toString().padStart(2, "0")
  return `${hh}:${mm}`
}

function fmtHeader(start: Date, end: Date) {
  return `${start.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}`
}

export function renderWeekSvg({
  events,
  startOfWeek,
  endOfWeek,
}: {
  events: CalEvent[]
  startOfWeek: Date
  endOfWeek: Date
}) {
  // group per day
  const days: { label: string; evts: CalEvent[] }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek)
    d.setDate(d.getDate() + i)
    const label = d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })
    const dayStart = new Date(d)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(d)
    dayEnd.setHours(23, 59, 59, 999)
    const evts = events
      .filter((e) => e.start <= dayEnd && e.end >= dayStart)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
    days.push({ label, evts })
  }

  const bodyY = PAD + HEADER + 8
  const dayBlockH = Math.floor((H - bodyY - PAD - DAY_GAP * 6) / 7)
  const headerTitle = fmtHeader(startOfWeek, endOfWeek)

  let svg = `
  <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .h1 { font: 600 24px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto; fill: #000; }
      .day{ font: 600 16px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto; fill: #000; }
      .evt{ font: 400 14px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto; fill: #000; }
      .muted{ fill: #000; opacity:.6 }
      .line{ stroke:#000; stroke-width:1; opacity:.15 }
    </style>

    <text x="${PAD}" y="${PAD + 24}" class="h1">${esc(headerTitle)}</text>
    <line x1="${PAD}" y1="${PAD + HEADER}" x2="${W - PAD}" y2="${PAD + HEADER}" class="line"/>
  `

  days.forEach((d, idx) => {
    const y = bodyY + idx * (dayBlockH + DAY_GAP)
    svg += `<g transform="translate(${PAD},${y})">
      <text x="0" y="16" class="day">${esc(d.label)}</text>
      <line x1="0" y1="${dayBlockH}" x2="${W - 2 * PAD}" y2="${dayBlockH}" class="line"/>`

    let row = 36
    const maxRows = Math.floor((dayBlockH - 10) / 18)

    if (d.evts.length === 0) {
      svg += `<text x="0" y="${row}" class="evt muted">No events</text>`
    } else {
      let used = 0
      for (const e of d.evts) {
        const when = e.allDay ? "All-day" : `${fmtHM(e.start)}–${fmtHM(e.end)}`
        const line = `${when}  ${esc(e.title || "(untitled)")}`
        svg += `<text x="0" y="${row}" class="evt">${line}</text>`
        row += 18
        used++
        if (e.location && used < maxRows) {
          svg += `<text x="0" y="${row}" class="evt muted">${esc(e.location)}</text>`
          row += 16
          used++
        }
        if (used >= maxRows) {
          break
        }
      }
    }
    svg += `</g>`
  })

  svg += `</svg>`
  return svg
}
