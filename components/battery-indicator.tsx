"use client"

import { Battery, BatteryLow, BatteryMedium, BatteryWarning } from "lucide-react"
import { estimateBatteryLife } from "@/lib/helpers"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

interface BatteryIndicatorProps {
  voltage?: number
  showLabel?: boolean
}

export function BatteryIndicator({ voltage, showLabel = false }: BatteryIndicatorProps) {
  const battery = estimateBatteryLife(voltage)

  if (battery.status === "unknown") {
    return showLabel ? <span className="text-xs text-muted-foreground">No data</span> : null
  }

  const icons = {
    good: Battery,
    medium: BatteryMedium,
    low: BatteryLow,
    critical: BatteryWarning,
    unknown: Battery,
  }

  const colors = {
    good: "text-green-600",
    medium: "text-yellow-600",
    low: "text-orange-600",
    critical: "text-red-600",
    unknown: "text-muted-foreground",
  }

  const Icon = icons[battery.status]
  const colorClass = colors[battery.status]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5">
            <Icon className={`w-4 h-4 ${colorClass}`} />
            {showLabel && <span className={`text-xs font-medium ${colorClass}`}>{battery.percentage}%</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p>
              <strong>Battery:</strong> {battery.percentage}%
            </p>
            <p>
              <strong>Voltage:</strong> {voltage?.toFixed(2)}V
            </p>
            <p>
              <strong>Est. Runtime:</strong> ~{battery.estimatedHours}h
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
