"use client"

import type { Log } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { AlertCircle, Info, AlertTriangle, Bug } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface LogListProps {
  logs: Log[]
}

export function LogList({ logs }: LogListProps) {
  const getLogIcon = (level: string) => {
    switch (level) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "debug":
        return <Bug className="w-4 h-4 text-blue-500" />
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getLogVariant = (level: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (level) {
      case "error":
        return "destructive"
      case "warning":
        return "outline"
      default:
        return "secondary"
    }
  }

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
          <CardDescription>No logs available</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Logs</CardTitle>
        <CardDescription>Latest activity from this device</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="mt-0.5">{getLogIcon(log.level)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getLogVariant(log.level)} className="text-xs">
                    {log.level}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm">{log.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
