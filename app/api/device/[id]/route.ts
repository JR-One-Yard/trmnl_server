import { getSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  try {
    const body = await request.json()
    const { name } = body

    const { data, error } = await supabase.from("devices").update({ name }).eq("id", id).select().single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating device:", error)
    return NextResponse.json({ error: "Failed to update device" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  try {
    // Delete associated screens and logs first (cascade)
    await supabase.from("screens").delete().eq("device_id", id)
    await supabase.from("logs").delete().eq("device_id", id)

    // Delete the device
    const { error } = await supabase.from("devices").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting device:", error)
    return NextResponse.json({ error: "Failed to delete device" }, { status: 500 })
  }
}
