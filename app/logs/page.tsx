import { getSupabaseServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowLeft, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function SystemLogsPage() {
  const supabase = await getSupabaseServerClient()

  // Fetch all logs ordered by most recent
  const { data: logs, error } = await supabase
    .from("logs")
    .select("*, devices(name)")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("[v0] Error fetching logs:", error)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6" />
            <h1 className="text-3xl font-bold">System Logs</h1>
          </div>
          <p className="text-muted-foreground">View all API requests and device activity (last 100 entries)</p>
        </div>

        {error ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">Error loading logs: {error.message}</p>
            </CardContent>
          </Card>
        ) : logs && logs.length > 0 ? (
          <div className="space-y-3">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-medium">{log.endpoint}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span>{log.devices?.name || "Unknown Device"}</span>
                        <span>•</span>
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </CardDescription>
                    </div>
                    <Badge variant={log.status_code >= 200 && log.status_code < 300 ? "default" : "destructive"}>
                      {log.status_code}
                    </Badge>
                  </div>
                </CardHeader>
                {(log.request_data || log.response_data) && (
                  <CardContent className="space-y-2 text-sm">
                    {log.request_data && (
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Request:</p>
                        <pre className="rounded bg-muted p-2 overflow-x-auto text-xs">
                          {JSON.stringify(log.request_data, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.response_data && (
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Response:</p>
                        <pre className="rounded bg-muted p-2 overflow-x-auto text-xs">
                          {JSON.stringify(log.response_data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No logs yet</p>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                API requests from your TRMNL devices will appear here. Make sure your device is configured with your
                server URL.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
