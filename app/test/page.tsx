import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function TestPage() {
  const supabase = await getSupabaseServerClient()

  // Test database connection and tables
  const tests = []

  // Test 1: Check devices table
  try {
    const { data: devices, error: devicesError } = await supabase.from("devices").select("*").limit(5)

    tests.push({
      name: "Devices Table",
      status: devicesError ? "error" : "success",
      message: devicesError ? devicesError.message : `Found ${devices?.length || 0} devices`,
      data: devices,
    })
  } catch (error) {
    tests.push({
      name: "Devices Table",
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }

  // Test 2: Check screens table
  try {
    const { data: screens, error: screensError } = await supabase.from("screens").select("*").limit(5)

    tests.push({
      name: "Screens Table",
      status: screensError ? "error" : "success",
      message: screensError ? screensError.message : `Found ${screens?.length || 0} screens`,
      data: screens,
    })
  } catch (error) {
    tests.push({
      name: "Screens Table",
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }

  // Test 3: Check logs table
  try {
    const { data: logs, error: logsError } = await supabase.from("logs").select("*").limit(5)

    tests.push({
      name: "Logs Table",
      status: logsError ? "error" : "success",
      message: logsError ? logsError.message : `Found ${logs?.length || 0} logs`,
      data: logs,
    })
  } catch (error) {
    tests.push({
      name: "Logs Table",
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }

  // Test 4: Check environment variables
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }

  tests.push({
    name: "Environment Variables",
    status: Object.values(envVars).every((v) => v) ? "success" : "error",
    message: Object.values(envVars).every((v) => v) ? "All required env vars set" : "Missing env vars",
    data: envVars,
  })

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">TRMNL BYOS Diagnostics</h1>
        <p className="text-muted-foreground">Testing database connection and system status</p>
      </div>

      <div className="grid gap-4">
        {tests.map((test, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{test.name}</CardTitle>
                <Badge variant={test.status === "success" ? "default" : "destructive"}>
                  {test.status === "success" ? "PASS" : "FAIL"}
                </Badge>
              </div>
              <CardDescription>{test.message}</CardDescription>
            </CardHeader>
            {test.data && (
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
                  {JSON.stringify(test.data, null, 2)}
                </pre>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">If all tests pass:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>
                Visit <code className="bg-muted px-1 rounded">/dashboard</code> to see your devices
              </li>
              <li>Configure your TRMNL device to point to this server</li>
              <li>
                Device will register via <code className="bg-muted px-1 rounded">/api/setup</code>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">API Endpoints:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>
                <code className="bg-muted px-1 rounded">POST /api/setup</code> - Register new device
              </li>
              <li>
                <code className="bg-muted px-1 rounded">GET /api/display</code> - Get screen for device
              </li>
              <li>
                <code className="bg-muted px-1 rounded">POST /api/log</code> - Log device activity
              </li>
              <li>
                <code className="bg-muted px-1 rounded">GET /api/render</code> - Render screen preview
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
