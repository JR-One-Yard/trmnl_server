/**
 * Calculate year progress using Australia/Sydney timezone
 */
export default async function getData() {
  // Get current date/time in Australia/Sydney timezone
  const sydneyTime = new Date().toLocaleString("en-AU", {
    timeZone: "Australia/Sydney",
  })
  const now = new Date(sydneyTime)

  // Get start of current year in Sydney timezone
  const currentYear = now.getFullYear()
  const startOfYear = new Date(currentYear, 0, 1) // January 1st

  // Check if current year is a leap year
  const isLeapYear = (currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0
  const totalDays = isLeapYear ? 366 : 365

  // Calculate day index (1-based)
  const timeDiff = now.getTime() - startOfYear.getTime()
  const dayIndex = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1

  // Calculate percentage
  const percentage = dayIndex / totalDays

  // Format current date
  const currentDate = now.toLocaleDateString("en-AU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  return {
    dayIndex: Math.min(dayIndex, totalDays), // Ensure we don't exceed total days
    totalDays,
    currentDate,
    percentage,
    isLeapYear,
    year: currentYear,
  }
}
