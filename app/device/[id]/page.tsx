import { getSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScreenList } from "@/components/screen-list"
import { LogList } from "@/components/log-list"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default async function DevicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const { data: device } = await supabase.from("devices").select("*").eq("id", id).single()

  if (!device) {
    notFound()
  }

  const { data: screens } = await supabase
    .from("screens")
    .select("*")
    .eq("device_id", id)
    .order("created_at", { ascending: false })

  const { data: logs } = await supabase
    .from("logs")
    .select("*")
    .eq("device_id", id)
    .order("created_at", { ascending: false })
    .limit(10)

  const isOnline = device.last_seen_at ? new Date(device.last_seen_at).getTime() > Date.now() - 10 * 60 * 1000 : false

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="icon">
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">{device.name || "Unnamed Device"}</h1>
                  <Badge variant={isOnline ? "default" : "secondary"}>{isOnline ? "Online" : "Offline"}</Badge>
                </div>
                <p className="text-muted-foreground font-mono text-sm">{device.device_id}</p>
              </div>
            </div>
            <Button asChild>
              <Link href={`/device/${id}/screen/new`}>
                <Plus className="w-4 h-4 mr-2" />
                New Screen
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Device ID</div>
              <div className="font-mono text-sm">{device.device_id}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Firmware Version</div>
              <div className="font-medium">{device.firmware_version || "Unknown"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Last Seen</div>
              <div className="font-medium">
                {device.last_seen_at
                  ? formatDistanceToNow(new Date(device.last_seen_at), { addSuffix: true })
                  : "Never"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Created</div>
              <div className="font-medium">{formatDistanceToNow(new Date(device.created_at), { addSuffix: true })}</div>
            </div>
          </CardContent>
        </Card>

        <ScreenList deviceId={id} screens={screens || []} />

        <LogList logs={logs || []} />
      </div>
    </div>
  )
}
