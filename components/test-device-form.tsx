"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export function TestDeviceForm() {
  const router = useRouter()
  const [deviceName, setDeviceName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Generate a unique device UUID
      const deviceUuid = `test-${Date.now()}-${Math.random().toString(36).substring(7)}`

      const response = await fetch("/api/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ID: deviceUuid, // TRMNL devices send their ID in headers
        },
        body: JSON.stringify({
          device_name: deviceName || `Test Device ${new Date().toLocaleString()}`,
          firmware_version: "test-1.0.0",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to register device (${response.status})`)
      }

      const data = await response.json()
      console.log("[v0] Device registered:", data)

      // Redirect to dashboard
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      console.error("[v0] Error registering device:", err)
      setError(err instanceof Error ? err.message : "Failed to register device")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="deviceName">Device Name (Optional)</Label>
        <Input
          id="deviceName"
          placeholder="My Test Device"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Leave blank to auto-generate a name with timestamp</p>
      </div>

      {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded text-sm">{error}</div>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Registering..." : "Register Test Device"}
      </Button>
    </form>
  )
}
