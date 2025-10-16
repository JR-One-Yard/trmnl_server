"use client"

import type { Device } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Monitor, Settings, Eye } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface DeviceCardProps {
  device: Device
}

export function DeviceCard({ device }: DeviceCardProps) {
  const isOnline = device.last_seen_at ? new Date(device.last_seen_at).getTime() > Date.now() - 10 * 60 * 1000 : false

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">{device.name || "Unnamed Device"}</CardTitle>
          </div>
          <Badge variant={isOnline ? "default" : "secondary"}>{isOnline ? "Online" : "Offline"}</Badge>
        </div>
        <CardDescription className="font-mono text-xs">{device.device_id}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
              <span className="font-medium">
                {formatDistanceToNow(new Date(device.last_seen_at), { addSuffix: true })}
              </span>
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
