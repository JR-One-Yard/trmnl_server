"use client"

import { Wifi, WifiOff } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

interface WifiIndicatorProps {
  rssi?: number
  showLabel?: boolean
}

export function WifiIndicator({ rssi, showLabel = false }: WifiIndicatorProps) {
  if (rssi === undefined) {
    return showLabel ? <span className="text-xs text-muted-foreground">No data</span> : null
  }

  // RSSI to signal strength mapping
  // Excellent: > -50 dBm
  // Good: -50 to -60 dBm
  // Fair: -60 to -70 dBm
  // Weak: < -70 dBm

  let strength: "excellent" | "good" | "fair" | "weak"
  let color: string

  if (rssi > -50) {
    strength = "excellent"
    color = "text-green-600"
  } else if (rssi > -60) {
    strength = "good"
    color = "text-blue-600"
  } else if (rssi > -70) {
    strength = "fair"
    color = "text-yellow-600"
  } else {
    strength = "weak"
    color = "text-red-600"
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5">
            {rssi > -70 ? <Wifi className={`w-4 h-4 ${color}`} /> : <WifiOff className={`w-4 h-4 ${color}`} />}
            {showLabel && <span className={`text-xs font-medium ${color}`}>{strength}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p>
              <strong>Signal:</strong> {strength}
            </p>
            <p>
              <strong>RSSI:</strong> {rssi} dBm
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
