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
