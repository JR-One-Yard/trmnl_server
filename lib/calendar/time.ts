export function getWeekBoundsSydney(ref: Date) {
  // Calculate Mon–Sun in local time (AU/Sydney). Keep simple for now.
  const d = new Date(ref)
  const day = d.getDay() // 0 Sun .. 6 Sat
  const diffToMon = (day + 6) % 7 // days since Monday
  const start = new Date(d)
  start.setDate(d.getDate() - diffToMon)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { startOfWeek: start, endOfWeek: end }
}
