import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { LogRequest } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Log POST request received")
    console.log("[v0] Headers:", Object.fromEntries(request.headers.entries()))

    const deviceId = request.headers.get("ID") || request.headers.get("id")

    if (!deviceId) {
      console.error("[v0] Log error: Missing device ID in headers")
      return NextResponse.json({ error: "Device ID is required in headers" }, { status: 400 })
    }

    const body: LogRequest = await request.json()
    console.log("[v0] Log request body:", body)

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
      console.log("[v0] Device auto-registered successfully in log endpoint")
    }

    const logMessage = body.message || `Device log entry from ${deviceId}`
    const logLevel = body.level || "info"

    console.log("[v0] Creating log entry with message:", logMessage)

    // Create log entry
    const { data, error } = await supabase
      .from("logs")
      .insert({
        device_id: device.id,
        level: logLevel,
        message: logMessage,
        metadata: body.metadata || {},
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Database insert error:", error)
      throw error
    }

    console.log("[v0] Log entry created successfully")

    return NextResponse.json({
      status: "logged",
      log: data,
    })
  } catch (error) {
    console.error("[v0] Log error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
