"use client"

import type { Device } from "@/lib/types/device"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Monitor, Settings, Eye } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/helpers"
import { DeviceStatusBadge } from "./device-status-badge"
import { BatteryIndicator } from "./battery-indicator"
import { WifiIndicator } from "./wifi-indicator"

interface DeviceCardProps {
  device: Device
}

export function DeviceCard({ device }: DeviceCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">{device.name || "Unnamed Device"}</CardTitle>
          </div>
          <DeviceStatusBadge lastSeenAt={device.last_seen_at} />
        </div>
        <CardDescription className="font-mono text-xs">{device.friendly_id}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm">
          <BatteryIndicator voltage={device.battery_voltage} showLabel />
          <WifiIndicator rssi={device.rssi} showLabel />
        </div>

        <div className="space-y-2 text-sm">
          {device.firmware_version && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Firmware:</span>
              <span className="font-medium">{device.firmware_version}</span>
            </div>
          )}
          {device.last_seen_at && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Seen:</span>
              <span className="font-medium">{formatDate(device.last_seen_at, device.timezone)}</span>
            </div>
          )}
          {device.timezone && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timezone:</span>
              <span className="font-medium">{device.timezone}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
            <Link href={`/device/${device.id}`}>
              <Eye className="w-4 h-4 mr-2" />
              View
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
            <Link href={`/device/${device.id}/settings`}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
