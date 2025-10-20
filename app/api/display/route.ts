import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { normalizeMacAddress, isValidMacAddress } from "@/lib/security"
import { logInfo, logError, logWarn } from "@/lib/logger"
import type { DisplayResponse } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    await logInfo("Display GET request received")

    const macAddress = request.headers.get("ID") || request.headers.get("id")

    if (!macAddress) {
      await logWarn("Display request missing MAC address in headers")
      return NextResponse.json({ error: "MAC address is required in ID header" }, { status: 400 })
    }

    if (!isValidMacAddress(macAddress)) {
      await logWarn("Display request with invalid MAC address", { macAddress })
      return NextResponse.json({ error: "Invalid MAC address format" }, { status: 400 })
    }

    const normalizedMac = normalizeMacAddress(macAddress)
    const supabase = await createClient()

    const { data: device } = await supabase.from("devices").select("*").eq("mac_address", normalizedMac).single()

    if (!device) {
      await logWarn("Device not found for display request", { macAddress: normalizedMac })
      return NextResponse.json({ error: "Device not registered. Please run setup first." }, { status: 404 })
    }

    await logInfo("Device found for display request", {
      friendlyId: device.friendly_id,
      name: device.name,
    })

    await supabase.from("devices").update({ last_seen_at: new Date().toISOString() }).eq("mac_address", normalizedMac)

    // Get active screen for device
    const { data: screen } = await supabase
      .from("screens")
      .select("*")
      .eq("device_id", device.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get("host")}`
    const secureBaseUrl = baseUrl.replace(/^http:/, "https:")

    if (!screen) {
      await logInfo("No active screen found, returning default", {
        friendlyId: device.friendly_id,
      })

      const response: DisplayResponse = {
        image_url: `${secureBaseUrl}/api/render?device_id=${device.id}&type=default`,
        refresh_rate: 300,
      }

      return NextResponse.json(response)
    }

    await logInfo("Active screen found", {
      friendlyId: device.friendly_id,
      screenName: screen.name,
      screenType: screen.type,
    })

    const imageUrl = `${secureBaseUrl}/api/render?device_id=${device.id}&screen_id=${screen.id}`

    const response: DisplayResponse = {
      image_url: imageUrl,
      refresh_rate: screen.config.refresh_rate || 300,
      merge_variables: screen.config.merge_variables || {},
    }

    return NextResponse.json(response)
  } catch (error) {
    await logError("Display error", { error: String(error) })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
