import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateApiKey, generateFriendlyId, normalizeMacAddress, isValidMacAddress } from "@/lib/security"
import { logInfo, logError, logWarn } from "@/lib/logger"
import type { SetupRequest } from "@/lib/types"

export async function GET(request: NextRequest) {
  await logInfo("Setup health check received")

  return NextResponse.json({
    status: "ok",
    message: "TRMNL BYOS server is ready",
  })
}

export async function POST(request: NextRequest) {
  try {
    await logInfo("Setup POST request received")

    const macAddress = request.headers.get("ID") || request.headers.get("id")

    if (!macAddress) {
      await logWarn("Setup request missing MAC address in headers")
      return NextResponse.json({ error: "MAC address is required in ID header" }, { status: 400 })
    }

    if (!isValidMacAddress(macAddress)) {
      await logWarn("Setup request with invalid MAC address format", { macAddress })
      return NextResponse.json(
        { error: "Invalid MAC address format. Expected format: XX:XX:XX:XX:XX:XX" },
        { status: 400 },
      )
    }

    const normalizedMac = normalizeMacAddress(macAddress)

    const body: SetupRequest = await request.json().catch(() => ({}))

    const supabase = await createClient()

    const { data: existingDevice } = await supabase
      .from("devices")
      .select("*")
      .eq("mac_address", normalizedMac)
      .single()

    if (existingDevice) {
      const { data, error } = await supabase
        .from("devices")
        .update({
          firmware_version: body.firmware_version,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("mac_address", normalizedMac)
        .select()
        .single()

      if (error) {
        await logError("Database error updating device", { error: error.message, macAddress: normalizedMac })
        throw error
      }

      await logInfo("Device updated successfully", {
        friendlyId: data.friendly_id,
        macAddress: normalizedMac,
      })

      return NextResponse.json({
        status: "updated",
        device: data,
      })
    } else {
      const apiKey = generateApiKey(normalizedMac)
      const friendlyId = generateFriendlyId(normalizedMac)
      const deviceName = body.device_name || `TRMNL Device ${friendlyId.slice(-6)}`

      const { data, error } = await supabase
        .from("devices")
        .insert({
          mac_address: normalizedMac,
          friendly_id: friendlyId,
          api_key: apiKey,
          name: deviceName,
          firmware_version: body.firmware_version || "unknown",
          screen: body.screen || "epd_2_9",
          timezone: body.timezone || "UTC",
          last_seen_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        await logError("Database error creating device", {
          error: error.message,
          macAddress: normalizedMac,
        })
        throw error
      }

      await logInfo("Device created successfully", {
        friendlyId: data.friendly_id,
        macAddress: normalizedMac,
      })

      return NextResponse.json({
        status: "created",
        device: data,
        api_key: apiKey, // Return API key only on creation
      })
    }
  } catch (error) {
    await logError("Setup error", { error: String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
