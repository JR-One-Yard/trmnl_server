import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { SetupRequest } from "@/lib/types"

export async function GET(request: NextRequest) {
  console.log("[v0] Setup GET request received")
  console.log("[v0] Headers:", Object.fromEntries(request.headers.entries()))

  // Return simple success response for device health check
  return NextResponse.json({
    status: "ok",
    message: "TRMNL BYOS server is ready",
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Setup POST request received")
    console.log("[v0] Headers:", Object.fromEntries(request.headers.entries()))

    const deviceId = request.headers.get("ID") || request.headers.get("id")

    if (!deviceId) {
      console.error("[v0] Setup error: Missing device ID in headers")
      return NextResponse.json({ error: "Device ID is required in headers" }, { status: 400 })
    }

    const body: SetupRequest = await request.json().catch(() => ({}))
    console.log("[v0] Setup request body:", body)

    const supabase = await getSupabaseServerClient()

    const deviceName = body.device_name || `Device ${deviceId.slice(0, 8)}`

    // Check if device exists
    const { data: existingDevice } = await supabase.from("devices").select("*").eq("device_id", deviceId).single()

    if (existingDevice) {
      // Update existing device
      const { data, error } = await supabase
        .from("devices")
        .update({
          firmware_version: body.firmware_version,
          last_seen_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("device_id", deviceId)
        .select()
        .single()

      if (error) {
        console.error("[v0] Database error updating device:", error)
        throw error
      }

      console.log("[v0] Device updated:", data)
      return NextResponse.json({
        status: "updated",
        device: data,
      })
    } else {
      // Create new device
      const { data, error } = await supabase
        .from("devices")
        .insert({
          device_id: deviceId,
          name: deviceName,
          firmware_version: body.firmware_version,
          last_seen_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("[v0] Database error creating device:", error)
        throw error
      }

      console.log("[v0] Device created:", data)
      return NextResponse.json({
        status: "created",
        device: data,
      })
    }
  } catch (error) {
    console.error("[v0] Setup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
