/**
 * Calculate year progress using Australia/Sydney timezone
 */
export default async function getData() {
  // Get current time in Sydney timezone using proper UTC offset calculation
  const now = new Date()

  // Convert to Sydney timezone (UTC+11 or UTC+10 depending on DST)
  const sydneyFormatter = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const parts = sydneyFormatter.formatToParts(now)
  const sydneyDate = {
    year: Number.parseInt(parts.find((p) => p.type === "year")?.value || "0"),
    month: Number.parseInt(parts.find((p) => p.type === "month")?.value || "0"),
    day: Number.parseInt(parts.find((p) => p.type === "day")?.value || "0"),
  }

  const currentYear = sydneyDate.year

  // Check if current year is a leap year
  const isLeapYear = (currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0
  const totalDays = isLeapYear ? 366 : 365

  // Calculate day of year (1-based)
  const startOfYear = new Date(Date.UTC(currentYear, 0, 1))
  const currentDate = new Date(Date.UTC(sydneyDate.year, sydneyDate.month - 1, sydneyDate.day))

  const timeDiff = currentDate.getTime() - startOfYear.getTime()
  const dayIndex = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1

  // Calculate percentage
  const percentage = dayIndex / totalDays

  // Format current date for display
  const formattedDate = `${sydneyDate.day.toString().padStart(2, "0")}/${sydneyDate.month.toString().padStart(2, "0")}/${currentYear}`

  return {
    dayIndex: Math.min(dayIndex, totalDays), // Ensure we don't exceed total days
    totalDays,
    currentDate: formattedDate,
    percentage,
    isLeapYear,
    year: currentYear,
  }
}
