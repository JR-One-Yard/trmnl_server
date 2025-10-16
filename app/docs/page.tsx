import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Code } from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Documentation</h1>
              <p className="text-muted-foreground">API reference and setup guide</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>TRMNL BYOS implements the standard BYOS API specification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Setup Endpoint
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Register or update a device. Called when device first connects or firmware updates.
              </p>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="text-muted-foreground mb-2"># Request</div>
                <div>curl -X POST "{apiUrl}/api/setup" \</div>
                <div> -H "ID: YOUR_DEVICE_ID" \</div>
                <div> -H "Content-Type: application/json" \</div>
                <div> -d '{'firmware_version": "1.0.0'}'</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Display Endpoint
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Get the current screen to display. Returns image URL and refresh rate.
              </p>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="text-muted-foreground mb-2"># Request</div>
                <div>curl -X GET "{apiUrl}/api/display" \</div>
                <div> -H "ID: YOUR_DEVICE_ID"</div>
                <div className="mt-4 text-muted-foreground"># Response</div>
                <div>{"{"}</div>
                <div> "image_url": "{apiUrl}/api/render?device_id=...",</div>
                <div> "refresh_rate": 300</div>
                <div>{"}"}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Log Endpoint
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Send device logs to the server for monitoring and debugging.
              </p>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="text-muted-foreground mb-2"># Request</div>
                <div>curl -X POST "{apiUrl}/api/log" \</div>
                <div> -H "ID: YOUR_DEVICE_ID" \</div>
                <div> -H "Content-Type: application/json" \</div>
                <div> -d '{('level": "info', 'message": "Screen updated')}'</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Configuration</CardTitle>
            <CardDescription>How to configure your TRMNL device</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Set API Endpoint</h3>
              <p className="text-sm text-muted-foreground mb-2">Configure your TRMNL device to use this server:</p>
              <div className="bg-muted p-3 rounded-lg font-mono text-sm">{apiUrl}</div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Device ID</h3>
              <p className="text-sm text-muted-foreground">
                Your device will automatically register with its unique ID when it first connects. You can then manage
                it from the dashboard.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Create Screens</h3>
              <p className="text-sm text-muted-foreground">
                Once your device is registered, create screens in the dashboard to display content. Screens can be
                clock, weather, quotes, or custom content.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Screen Types</CardTitle>
            <CardDescription>Available screen templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border rounded-lg">
              <h3 className="font-semibold mb-1">Clock</h3>
              <p className="text-sm text-muted-foreground">Display current time and date in a clean, readable format</p>
            </div>
            <div className="p-3 border rounded-lg">
              <h3 className="font-semibold mb-1">Weather</h3>
              <p className="text-sm text-muted-foreground">Show temperature, conditions, and location</p>
            </div>
            <div className="p-3 border rounded-lg">
              <h3 className="font-semibold mb-1">Quote</h3>
              <p className="text-sm text-muted-foreground">Display inspirational quotes with attribution</p>
            </div>
            <div className="p-3 border rounded-lg">
              <h3 className="font-semibold mb-1">Custom</h3>
              <p className="text-sm text-muted-foreground">Create your own custom content with configurable styling</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
