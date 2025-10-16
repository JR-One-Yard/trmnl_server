import { getSupabaseServerClient } from "@/lib/supabase/server"
import { DeviceList } from "@/components/device-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()

  const { data: devices } = await supabase.from("devices").select("*").order("created_at", { ascending: false })

  const { count: totalScreens } = await supabase.from("screens").select("*", { count: "exact", head: true })

  const { count: totalLogs } = await supabase.from("logs").select("*", { count: "exact", head: true })

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Manage your TRMNL devices</p>
            </div>
            <Button asChild>
              <Link href="/">
                <Plus className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg border p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Devices</div>
            <div className="text-3xl font-bold">{devices?.length || 0}</div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Screens</div>
            <div className="text-3xl font-bold">{totalScreens || 0}</div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="text-sm text-muted-foreground mb-1">Total Logs</div>
            <div className="text-3xl font-bold">{totalLogs || 0}</div>
          </div>
        </div>

        <DeviceList devices={devices || []} />
      </div>
    </div>
  )
}
