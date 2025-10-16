"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { Power } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface ToggleScreenButtonProps {
  screenId: string
  isActive: boolean
  deviceId: string
}

export function ToggleScreenButton({ screenId, isActive, deviceId }: ToggleScreenButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase
        .from("screens")
        .update({
          is_active: !isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", screenId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("[v0] Toggle screen error:", error)
      alert("Failed to toggle screen. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleToggle} disabled={loading}>
      <Power className="w-4 h-4 mr-2" />
      {loading ? "Updating..." : isActive ? "Deactivate" : "Activate"}
    </Button>
  )
}
