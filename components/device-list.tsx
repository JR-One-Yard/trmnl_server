"use client"

import type { Device } from "@/lib/types"
import { DeviceCard } from "./device-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Monitor } from "lucide-react"

interface DeviceListProps {
  devices: Device[]
}

export function DeviceList({ devices }: DeviceListProps) {
  if (devices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Devices Found</CardTitle>
          <CardDescription>Connect your TRMNL device to get started</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-12">
          <Monitor className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Configure your TRMNL device to point to this server's API endpoint. Once connected, it will appear here
            automatically.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Devices</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </div>
  )
}
