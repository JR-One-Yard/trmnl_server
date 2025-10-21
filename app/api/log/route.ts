import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { normalizeMacAddress, isValidMacAddress, generateFriendlyId, generateMockMacAddress } from "@/lib/security"
import { logInfo, logError, logWarn } from "@/lib/logger"
import { parseDeviceStatus } from "@/lib/helpers"
import type { LogRequest, LogResponse } from "@/lib/types/device"

export async function POST(request: NextRequest) {
  try {
    await logInfo("Log POST request received")

    const macAddress = request.headers.get("ID") || request.headers.get("id")
    const apiKey = request.headers.get("Access-Token") || request.headers.get("access-token")

    const deviceStatus = parseDeviceStatus(request.headers)

    const supabase = await createClient()
    let device = null
    let authMethod = "none"

    // 1. Try MAC + API key exact match
    if (macAddress && apiKey && isValidMacAddress(macAddress)) {
      const normalizedMac = normalizeMacAddress(macAddress)
      const { data } = await supabase
        .from("devices")
        .select("*")
        .eq("mac_address", normalizedMac)
        .eq("api_key", apiKey)
        .single()

      if (data) {
        device = data
        authMethod = "mac_and_key"
        await logInfo("Device authenticated with MAC + API key for log", { friendlyId: device.friendly_id })
      }
    }

    // 2. Try MAC only (update API key if provided)
    if (!device && macAddress && isValidMacAddress(macAddress)) {
      const normalizedMac = normalizeMacAddress(macAddress)
      const { data } = await supabase.from("devices").select("*").eq("mac_address", normalizedMac).single()

      if (data) {
        device = data
        authMethod = "mac_only"
        await logInfo("Device authenticated with MAC only for log", { friendlyId: device.friendly_id })

        // Update API key if provided
        if (apiKey && apiKey !== device.api_key) {
          await supabase.from("devices").update({ api_key: apiKey }).eq("id", device.id)
          await logInfo("Updated API key for device in log", { friendlyId: device.friendly_id })
        }
      }
    }

    // 3. Try API key only (update MAC if provided)
    if (!device && apiKey) {
      const { data } = await supabase.from("devices").select("*").eq("api_key", apiKey).single()

      if (data) {
        device = data
        authMethod = "key_only"
        await logInfo("Device authenticated with API key only for log", { friendlyId: device.friendly_id })

        // Update MAC if provided and valid
        if (macAddress && isValidMacAddress(macAddress)) {
          const normalizedMac = normalizeMacAddress(macAddress)
          await supabase.from("devices").update({ mac_address: normalizedMac }).eq("id", device.id)
          await logInfo("Updated MAC address for device in log", { friendlyId: device.friendly_id })
        }
      }
    }

    // 4. Create mock device if needed (for development/testing)
    if (!device && apiKey) {
      const mockMac = generateMockMacAddress(apiKey)
      const friendlyId = generateFriendlyId(mockMac)

      const { data, error } = await supabase
        .from("devices")
        .insert({
          mac_address: mockMac,
          friendly_id: friendlyId,
          api_key: apiKey,
          name: `Mock Device ${friendlyId.slice(-6)}`,
          screen: "epd_2_9",
          timezone: "UTC",
          refresh_schedule: "300",
          firmware_version: deviceStatus.firmware_version || "unknown",
          last_seen_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (!error && data) {
        device = data
        authMethod = "mock_created"
        await logInfo("Created mock device for log", { friendlyId: device.friendly_id, mockMac })
      }
    }

    if (!device) {
      await logWarn("Log request failed - no device found", { macAddress, hasApiKey: !!apiKey })
      return NextResponse.json(
        {
          status: "error",
          message: "Device not registered. Please run setup first.",
        } as LogResponse,
        { status: 200 },
      )
    }

    const body: LogRequest = await request.json().catch(() => ({}))

    const now = new Date().toISOString()

    const updateData: any = {
      last_seen_at: now,
      last_update_time: now,
      updated_at: now,
    }

    if (deviceStatus.battery_voltage !== undefined) {
      updateData.battery_voltage = deviceStatus.battery_voltage
    }
    if (deviceStatus.firmware_version) {
      updateData.firmware_version = deviceStatus.firmware_version
    }
    if (deviceStatus.rssi !== undefined) {
      updateData.rssi = deviceStatus.rssi
    }

    await supabase.from("devices").update(updateData).eq("id", device.id)

    const logMessage = body.message || `Log entry from ${device.friendly_id}`
    const logLevel = body.level || "info"
    const logData = body.log_data || {}

    const { error: logError } = await supabase.from("logs").insert({
      friendly_id: device.friendly_id,
      log_data: {
        message: logMessage,
        level: logLevel,
        ...logData,
        auth_method: authMethod,
        timestamp: new Date().toISOString(),
      },
    })

    if (logError) {
      await logError("Failed to store device log", {
        error: logError.message,
        friendlyId: device.friendly_id,
      })
    }

    await logInfo("Device log processed successfully", {
      friendlyId: device.friendly_id,
      authMethod,
      logLevel,
    })

    const response: LogResponse = {
      status: "ok",
      message: "Log entry recorded successfully",
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    await logError("Log endpoint error", { error: String(error) })
    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error",
      } as LogResponse,
      { status: 200 },
    )
  }
}
