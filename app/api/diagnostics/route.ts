import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = getSupabaseServerClient()

  // Get all logs
  const { data: logs, error: logsError } = await supabase
    .from("logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  // Get all devices
  const { data: devices, error: devicesError } = await supabase
    .from("devices")
    .select("*")
    .order("created_at", { ascending: false })

  return NextResponse.json({
    logs: logs || [],
    logsError,
    devices: devices || [],
    devicesError,
    totalLogs: logs?.length || 0,
    totalDevices: devices?.length || 0,
  })
}
