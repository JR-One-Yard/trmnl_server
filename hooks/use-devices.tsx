"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import type { Device } from "@/lib/types/device"

export function useDevices() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const fetchDevices = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("devices")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      setDevices(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch devices")
      console.error("[v0] Error fetching devices:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()

    // Set up real-time subscription
    const channel = supabase
      .channel("devices-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "devices",
        },
        (payload) => {
          console.log("[v0] Device change detected:", payload)

          if (payload.eventType === "INSERT") {
            setDevices((prev) => [payload.new as Device, ...prev])
          } else if (payload.eventType === "UPDATE") {
            setDevices((prev) =>
              prev.map((device) => (device.id === payload.new.id ? (payload.new as Device) : device)),
            )
          } else if (payload.eventType === "DELETE") {
            setDevices((prev) => prev.filter((device) => device.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  return { devices, loading, error, refresh: fetchDevices }
}
