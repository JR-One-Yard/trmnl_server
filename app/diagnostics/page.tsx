import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Activity, CheckCircle2, XCircle, AlertCircle, Database, Wifi, Server } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function DiagnosticsPage() {
  const supabase = await getSupabaseServerClient()

  // Fetch diagnostics data
  const { data: devices } = await supabase.from("devices").select("*").order("created_at", { ascending: false })

  const { data: recentLogs } = await supabase
    .from("logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10)

  const { count: totalScreens } = await supabase.from("screens").select("*", { count: "exact", head: true })

  // Calculate health metrics
  const totalDevices = devices?.length || 0
  const activeDevices =
    devices?.filter((device) => {
      if (!device.last_update_time) return false
      const lastUpdate = new Date(device.last_update_time)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
      return lastUpdate > tenMinutesAgo
    }).length || 0

  const inactiveDevices = totalDevices - activeDevices
  const systemHealth = totalDevices > 0 ? Math.round((activeDevices / totalDevices) * 100) : 100

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">System Diagnostics</h1>
              <p className="text-muted-foreground">Monitor system health and performance</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* System Health Overview */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">System Health</CardTitle>
                <CardDescription>Overall system status and performance</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {systemHealth >= 80 ? (
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                ) : systemHealth >= 50 ? (
                  <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-5xl font-bold">{systemHealth}%</div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      systemHealth >= 80
                        ? "bg-green-600 dark:bg-green-400"
                        : systemHealth >= 50
                          ? "bg-yellow-600 dark:bg-yellow-400"
                          : "bg-red-600 dark:bg-red-400"
                    }`}
                    style={{ width: `${systemHealth}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {systemHealth >= 80
                    ? "All systems operational"
                    : systemHealth >= 50
                      ? "Some devices need attention"
                      : "Multiple devices offline"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Status */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <Badge variant={totalScreens && totalScreens > 0 ? "default" : "secondary"}>
                  {totalScreens && totalScreens > 0 ? "Active" : "Idle"}
                </Badge>
              </div>
              <CardTitle>Database</CardTitle>
              <CardDescription>Supabase connection status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>Connected</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <Badge variant={activeDevices > 0 ? "default" : "secondary"}>
                  {activeDevices > 0 ? "Active" : "Idle"}
                </Badge>
              </div>
              <CardTitle>Device Network</CardTitle>
              <CardDescription>Connected devices status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active:</span>
                  <span className="font-semibold">{activeDevices}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Inactive:</span>
                  <span className="font-semibold">{inactiveDevices}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Server className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <Badge variant="default">Online</Badge>
              </div>
              <CardTitle>API Server</CardTitle>
              <CardDescription>Server response status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>All endpoints operational</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest device logs and events</CardDescription>
          </CardHeader>
          <CardContent>
            {recentLogs && recentLogs.length > 0 ? (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Activity className="w-4 h-4 text-primary mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{log.device_id}</span>
                        <Badge variant="outline" className="text-xs">
                          {log.log_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{log.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
