"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { Trash2 } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface DeleteScreenButtonProps {
  screenId: string
  deviceId: string
}

export function DeleteScreenButton({ screenId, deviceId }: DeleteScreenButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this screen?")) {
      return
    }

    setLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.from("screens").delete().eq("id", screenId)

      if (error) throw error

      router.push(`/device/${deviceId}`)
      router.refresh()
    } catch (error) {
      console.error("[v0] Delete screen error:", error)
      alert("Failed to delete screen. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
      <Trash2 className="w-4 h-4 mr-2" />
      {loading ? "Deleting..." : "Delete"}
    </Button>
  )
}
