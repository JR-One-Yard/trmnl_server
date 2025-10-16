import { getSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit } from "lucide-react"
import Link from "next/link"
import { DeleteScreenButton } from "@/components/delete-screen-button"
import { ToggleScreenButton } from "@/components/toggle-screen-button"

export default async function ScreenDetailPage({
  params,
}: {
  params: Promise<{ id: string; screenId: string }>
}) {
  const { id, screenId } = await params
  const supabase = await getSupabaseServerClient()

  const { data: device } = await supabase.from("devices").select("*").eq("id", id).single()

  const { data: screen } = await supabase.from("screens").select("*").eq("id", screenId).single()

  if (!device || !screen) {
    notFound()
  }

  const renderUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/render?device_id=${device.device_id}&screen_id=${screen.id}`

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="icon">
                <Link href={`/device/${id}`}>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">{screen.name}</h1>
                  <Badge variant="outline">{screen.type}</Badge>
                  {screen.is_active && <Badge>Active</Badge>}
                </div>
                <p className="text-muted-foreground">{device.name || device.device_id}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <ToggleScreenButton screenId={screen.id} isActive={screen.is_active} deviceId={id} />
              <Button asChild variant="outline">
                <Link href={`/device/${id}/screen/${screenId}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <DeleteScreenButton screenId={screen.id} deviceId={id} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 flex items-center justify-center">
              <img
                src={renderUrl || "/placeholder.svg"}
                alt={screen.name}
                className="max-w-full h-auto border rounded"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Screen Type</div>
                <div className="font-medium capitalize">{screen.type}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <div className="font-medium">{screen.is_active ? "Active" : "Inactive"}</div>
              </div>
              {Object.keys(screen.config).length > 0 && (
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Settings</div>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">{JSON.stringify(screen.config, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
