"use client"

import { Badge } from "./ui/badge"
import { getDeviceStatus } from "@/lib/helpers"

interface DeviceStatusBadgeProps {
  lastSeenAt?: string
}

export function DeviceStatusBadge({ lastSeenAt }: DeviceStatusBadgeProps) {
  const status = getDeviceStatus(lastSeenAt)

  const variants = {
    online: { variant: "default" as const, label: "Online" },
    offline: { variant: "secondary" as const, label: "Offline" },
    unknown: { variant: "outline" as const, label: "Unknown" },
  }

  const { variant, label } = variants[status]

  return <Badge variant={variant}>{label}</Badge>
}
