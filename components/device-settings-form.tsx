"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import type { Device } from "@/lib/types"

interface DeviceSettingsFormProps {
  device: Device
}

export function DeviceSettingsForm({ device }: DeviceSettingsFormProps) {
  const router = useRouter()
  const [name, setName] = useState(device.name || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/device/${device.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) throw new Error("Failed to update device")

      router.refresh()
    } catch (error) {
      console.error("Error updating device:", error)
      alert("Failed to update device settings")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Device Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My TRMNL Device"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="device-id">Device ID</Label>
        <Input id="device-id" value={device.device_id} disabled className="font-mono text-sm" />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
