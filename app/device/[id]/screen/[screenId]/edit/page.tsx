import { getSupabaseServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ScreenForm } from "@/components/screen-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function EditScreenPage({
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
              <h1 className="text-3xl font-bold">Edit Screen</h1>
              <p className="text-muted-foreground">{device.name || device.device_id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <ScreenForm deviceId={id} screen={screen} />
      </div>
    </div>
  )
}
