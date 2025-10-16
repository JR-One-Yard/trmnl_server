import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { LogRequest } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const deviceId = request.headers.get("ID") || request.headers.get("id")

    if (!deviceId) {
      return NextResponse.json({ error: "Device ID is required in headers" }, { status: 400 })
    }

    const body: LogRequest = await request.json()
    const supabase = await getSupabaseServerClient()

    // Get device
    let { data: device } = await supabase.from("devices").select("id").eq("device_id", deviceId).single()

    if (!device) {
      console.log("[v0] Device not found in log endpoint, auto-registering:", deviceId)

      const { data: newDevice, error: insertError } = await supabase
        .from("devices")
        .insert({
          device_id: deviceId,
          name: `TRMNL Device ${deviceId.slice(-8)}`,
          firmware_version: "unknown",
          last_seen_at: new Date().toISOString(),
        })
        .select("id")
        .single()

      if (insertError) {
        console.error("[v0] Failed to auto-register device:", insertError)
        return NextResponse.json({ error: "Failed to register device" }, { status: 500 })
      }

      device = newDevice
    }

    // Create log entry
    const { data, error } = await supabase
      .from("logs")
      .insert({
        device_id: device.id,
        level: body.level || "info",
        message: body.message,
        metadata: body.metadata || {},
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      status: "logged",
      log: data,
    })
  } catch (error) {
    console.error("[v0] Log error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
