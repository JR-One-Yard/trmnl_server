import { getSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DeleteDeviceButton } from "@/components/delete-device-button"
import { DeviceSettingsForm } from "@/components/device-settings-form"

export default async function DeviceSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const { data: device } = await supabase.from("devices").select("*").eq("id", id).single()

  if (!device) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href={`/device/${id}`}>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Device Settings</h1>
              <p className="text-muted-foreground">{device.name || "Unnamed Device"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Update your device name and configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <DeviceSettingsForm device={device} />
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for this device</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Delete Device</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete this device and all associated screens and logs. This action cannot be undone.
                </p>
                <DeleteDeviceButton deviceId={id} deviceName={device.name || "this device"} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
