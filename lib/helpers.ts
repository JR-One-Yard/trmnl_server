import { DateTime } from "luxon"

/**
 * Calculate next expected update time based on refresh schedule and timezone
 * @param refreshSchedule - Cron-like schedule or interval in seconds
 * @param timezone - Device timezone (e.g., "America/New_York")
 * @returns ISO timestamp of next expected update
 */
export function calculateNextUpdate(refreshSchedule: string, timezone = "UTC"): string {
  try {
    // Parse refresh schedule (assume seconds for now, can be extended for cron)
    const intervalSeconds = Number.parseInt(refreshSchedule) || 300 // Default 5 minutes

    const now = DateTime.now().setZone(timezone)
    const nextUpdate = now.plus({ seconds: intervalSeconds })

    return nextUpdate.toISO() || new Date(Date.now() + intervalSeconds * 1000).toISOString()
  } catch (error) {
    // Fallback to UTC if timezone parsing fails
    return new Date(Date.now() + 300000).toISOString() // 5 minutes default
  }
}

/**
 * Calculate dynamic refresh rate based on time of day and timezone
 * @param timezone - Device timezone
 * @param baseRefreshRate - Base refresh rate in seconds (default 300)
 * @returns Calculated refresh rate in seconds
 */
export function calculateRefreshRate(timezone = "UTC", baseRefreshRate = 300): number {
  try {
    const now = DateTime.now().setZone(timezone)
    const hour = now.hour

    // Slower refresh during night hours (11 PM - 6 AM)
    if (hour >= 23 || hour < 6) {
      return baseRefreshRate * 2 // Double the refresh rate at night
    }

    // Faster refresh during peak hours (7 AM - 10 PM)
    return baseRefreshRate
  } catch (error) {
    return baseRefreshRate
  }
}

/**
 * Generate cache-busting image URL
 * @param baseUrl - Base image URL
 * @param deviceId - Device ID
 * @param timestamp - Optional timestamp (defaults to now)
 * @returns URL with cache-busting parameter
 */
export function generateImageUrl(baseUrl: string, deviceId: string, timestamp?: number): string {
  const ts = timestamp || Date.now()
  const separator = baseUrl.includes("?") ? "&" : "?"
  return `${baseUrl}${separator}device_id=${deviceId}&t=${ts}`
}

/**
 * Parse device status from request headers
 * @param headers - Request headers
 * @returns Device status object
 */
export function parseDeviceStatus(headers: Headers): {
  battery_voltage?: number
  firmware_version?: string
  rssi?: number
} {
  return {
    battery_voltage: headers.get("Battery-Voltage") ? Number.parseFloat(headers.get("Battery-Voltage")!) : undefined,
    firmware_version: headers.get("Firmware-Version") || undefined,
    rssi: headers.get("RSSI") ? Number.parseInt(headers.get("RSSI")!) : undefined,
  }
}

export const TIMEZONES = [
  // North America
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
  { value: "America/Toronto", label: "Toronto" },
  { value: "America/Vancouver", label: "Vancouver" },
  { value: "America/Mexico_City", label: "Mexico City" },

  // Europe
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Europe/Rome", label: "Rome (CET/CEST)" },
  { value: "Europe/Madrid", label: "Madrid (CET/CEST)" },
  { value: "Europe/Amsterdam", label: "Amsterdam (CET/CEST)" },
  { value: "Europe/Brussels", label: "Brussels (CET/CEST)" },
  { value: "Europe/Vienna", label: "Vienna (CET/CEST)" },
  { value: "Europe/Stockholm", label: "Stockholm (CET/CEST)" },
  { value: "Europe/Warsaw", label: "Warsaw (CET/CEST)" },
  { value: "Europe/Athens", label: "Athens (EET/EEST)" },
  { value: "Europe/Moscow", label: "Moscow (MSK)" },

  // Asia
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Bangkok", label: "Bangkok (ICT)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Seoul", label: "Seoul (KST)" },

  // Australia & Pacific
  { value: "Australia/Sydney", label: "Sydney (AEDT/AEST)" },
  { value: "Australia/Melbourne", label: "Melbourne (AEDT/AEST)" },
  { value: "Australia/Brisbane", label: "Brisbane (AEST)" },
  { value: "Australia/Perth", label: "Perth (AWST)" },
  { value: "Pacific/Auckland", label: "Auckland (NZDT/NZST)" },

  // Other
  { value: "UTC", label: "UTC" },
]

export function getDeviceStatus(lastSeenAt?: string): "online" | "offline" | "unknown" {
  if (!lastSeenAt) return "unknown"

  const lastSeen = new Date(lastSeenAt).getTime()
  const now = Date.now()
  const tenMinutes = 10 * 60 * 1000

  return now - lastSeen < tenMinutes ? "online" : "offline"
}

export function estimateBatteryLife(batteryVoltage?: number): {
  percentage: number
  estimatedHours: number
  status: "good" | "medium" | "low" | "critical" | "unknown"
} {
  if (!batteryVoltage) {
    return { percentage: 0, estimatedHours: 0, status: "unknown" }
  }

  // E-ink display power consumption estimates
  // Typical: 0.1W active, 0.001W sleep
  // Battery: 3.7V nominal, 2000mAh typical
  const minVoltage = 3.0 // Critical low
  const maxVoltage = 4.2 // Fully charged
  const nominalVoltage = 3.7

  // Calculate percentage (linear approximation)
  const percentage = Math.max(0, Math.min(100, ((batteryVoltage - minVoltage) / (maxVoltage - minVoltage)) * 100))

  // Estimate remaining capacity in mAh (assuming 2000mAh battery)
  const batteryCapacity = 2000
  const remainingCapacity = (percentage / 100) * batteryCapacity

  // Power consumption: ~0.1W for 30s refresh, ~0.001W sleep
  // Average: (0.1W * 30s + 0.001W * 270s) / 300s = 0.011W average per 5min cycle
  const averagePowerW = 0.011
  const averageCurrentMa = (averagePowerW / nominalVoltage) * 1000

  // Estimated hours remaining
  const estimatedHours = remainingCapacity / averageCurrentMa

  // Determine status
  let status: "good" | "medium" | "low" | "critical" | "unknown"
  if (percentage > 60) status = "good"
  else if (percentage > 30) status = "medium"
  else if (percentage > 15) status = "low"
  else status = "critical"

  return {
    percentage: Math.round(percentage),
    estimatedHours: Math.round(estimatedHours),
    status,
  }
}

export function formatDate(date: string | Date, timezone = "UTC"): string {
  try {
    const dt = DateTime.fromISO(typeof date === "string" ? date : date.toISOString()).setZone(timezone)
    const now = DateTime.now().setZone(timezone)

    const diffMinutes = now.diff(dt, "minutes").minutes

    if (diffMinutes < 1) return "just now"
    if (diffMinutes < 60) return `${Math.floor(diffMinutes)}m ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
    if (diffMinutes < 10080) return `${Math.floor(diffMinutes / 1440)}d ago`

    return dt.toFormat("MMM d, yyyy")
  } catch {
    return "unknown"
  }
}

export function isTimeInRange(timezone: string, startHour: number, endHour: number): boolean {
  try {
    const now = DateTime.now().setZone(timezone)
    const hour = now.hour

    if (startHour <= endHour) {
      return hour >= startHour && hour < endHour
    } else {
      // Handle ranges that cross midnight (e.g., 22:00 - 06:00)
      return hour >= startHour || hour < endHour
    }
  } catch {
    return false
  }
}
