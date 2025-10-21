import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DeviceList } from "@/components/device-list"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { LogoutButton } from "@/components/logout-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Monitor, FileText, Activity, TrendingUp } from "lucide-react"
import { DashboardRefresh } from "@/components/dashboard-refresh"

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()

  const { data: devices } = await supabase.from("devices").select("*").order("created_at", { ascending: false })

  const { count: totalScreens } = await supabase.from("screens").select("*", { count: "exact", head: true })

  const { count: totalLogs } = await supabase.from("logs").select("*", { count: "exact", head: true })

  const activeDevices =
    devices?.filter((device) => {
      if (!device.last_update_time) return false
      const lastUpdate = new Date(device.last_update_time)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
      return lastUpdate > tenMinutesAgo
    }).length || 0

  return (
    <div className="min-h-screen bg-background">
      <DashboardRefresh />

      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Manage your TRMNL devices</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/diagnostics">
                  <Activity className="w-4 h-4 mr-2" />
                  Diagnostics
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/logs">
                  <FileText className="w-4 h-4 mr-2" />
                  Logs
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/setup-guide">Setup Guide</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Home</Link>
              </Button>
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-2 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-primary" />
              </div>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground mb-1">Total Devices</div>
            <div className="text-3xl font-bold">{devices?.length || 0}</div>
          </Card>

          <Card className="p-6 border-2 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground mb-1">Active Devices</div>
            <div className="text-3xl font-bold">{activeDevices}</div>
          </Card>

          <Card className="p-6 border-2 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground mb-1">Total Screens</div>
            <div className="text-3xl font-bold">{totalScreens || 0}</div>
          </Card>

          <Card className="p-6 border-2 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground mb-1">Total Logs</div>
            <div className="text-3xl font-bold">{totalLogs || 0}</div>
          </Card>
        </div>

        <DeviceList devices={devices || []} />
      </div>
    </div>
  )
}
