import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { DisplayResponse } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const deviceId = request.headers.get("ID")

    if (!deviceId) {
      return NextResponse.json({ error: "Device ID is required in headers" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Get device
    const { data: device } = await supabase.from("devices").select("*").eq("device_id", deviceId).single()

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 })
    }

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

    if (!screen) {
      // Return default screen
      const response: DisplayResponse = {
        image_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/render?device_id=${deviceId}&type=default`,
        refresh_rate: 300,
      }
      return NextResponse.json(response)
    }

    // Return screen configuration
    const response: DisplayResponse = {
      image_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/render?device_id=${deviceId}&screen_id=${screen.id}`,
      refresh_rate: screen.config.refresh_rate || 300,
      merge_variables: screen.config.merge_variables || {},
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Display error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
