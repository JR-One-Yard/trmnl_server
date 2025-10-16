"use client"

import type { Screen } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Eye, Settings, Layout } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface ScreenListProps {
  deviceId: string
  screens: Screen[]
}

export function ScreenList({ deviceId, screens }: ScreenListProps) {
  if (screens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Screens</CardTitle>
          <CardDescription>No screens configured yet</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-12">
          <Layout className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
            Create your first screen to display content on your TRMNL device
          </p>
          <Button asChild>
            <Link href={`/device/${deviceId}/screen/new`}>Create Screen</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Screens</CardTitle>
        <CardDescription>Manage display screens for this device</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {screens.map((screen) => (
            <div key={screen.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{screen.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {screen.type}
                  </Badge>
                  {screen.is_active && (
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Created {formatDistanceToNow(new Date(screen.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/device/${deviceId}/screen/${screen.id}`}>
                    <Eye className="w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/device/${deviceId}/screen/${screen.id}/edit`}>
                    <Settings className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
