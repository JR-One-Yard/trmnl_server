"use client"

import type { Device } from "@/lib/types"
import { DeviceCard } from "./device-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Monitor } from "lucide-react"
import { Button } from "./ui/button"
import Link from "next/link"

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
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Configure your TRMNL device to point to this server's API endpoint. Once connected, it will appear here
            automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild>
              <Link href="/test-device">Register Test Device</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/docs">View Documentation</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Devices</h2>
        <Button asChild variant="outline">
          <Link href="/test-device">Add Test Device</Link>
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device) => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>
    </div>
  )
}
