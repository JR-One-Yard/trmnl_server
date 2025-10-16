import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { DisplayResponse } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Display GET request received")
    console.log("[v0] Headers:", Object.fromEntries(request.headers.entries()))

    const deviceId = request.headers.get("ID") || request.headers.get("id")

    if (!deviceId) {
      console.error("[v0] Display error: Missing device ID in headers")
      return NextResponse.json({ error: "Device ID is required in headers" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Get device
    let { data: device } = await supabase.from("devices").select("*").eq("device_id", deviceId).single()

    if (!device) {
      console.log("[v0] Device not found, auto-registering:", deviceId)

      const { data: newDevice, error: insertError } = await supabase
        .from("devices")
        .insert({
          device_id: deviceId,
          name: `TRMNL Device ${deviceId.slice(-8)}`,
          firmware_version: "unknown",
          last_seen_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        console.error("[v0] Failed to auto-register device:", insertError)
        return NextResponse.json({ error: "Failed to register device" }, { status: 500 })
      }

      device = newDevice
      console.log("[v0] Device auto-registered successfully")
    }

    console.log("[v0] Device found:", device.name)

    // Update last seen
    await supabase.from("devices").update({ last_seen_at: new Date().toISOString() }).eq("device_id", deviceId)

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

    if (!screen) {
      console.log("[v0] No active screen found, returning default")
      // Return default screen
      const response: DisplayResponse = {
        image_url: `${baseUrl}/api/render?device_id=${deviceId}&type=default`,
        refresh_rate: 300,
      }
      return NextResponse.json(response)
    }

    console.log("[v0] Active screen found:", screen.name)

    let imageUrl: string
    if (screen.type === "calendar-week") {
      imageUrl = `${baseUrl}/api/render-week`
    } else {
      imageUrl = `${baseUrl}/api/render?device_id=${deviceId}&screen_id=${screen.id}`
    }

    // Return screen configuration
    const response: DisplayResponse = {
      image_url: imageUrl,
      refresh_rate: screen.config.refresh_rate || 300,
      merge_variables: screen.config.merge_variables || {},
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Display error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
