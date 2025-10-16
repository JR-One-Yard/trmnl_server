import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TestDeviceForm } from "@/components/test-device-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TestDevicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Register Test Device</CardTitle>
            <CardDescription>
              Create a test device to see how the system works without a physical TRMNL device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TestDeviceForm />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>API Endpoints</CardTitle>
            <CardDescription>Test these endpoints manually if needed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">POST /api/setup</h3>
              <p className="text-sm text-muted-foreground mb-2">Register a new device</p>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                {`curl -X POST ${process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"}/api/setup \\
  -H "Content-Type: application/json" \\
  -d '{"device_uuid": "test-device-123"}'`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">GET /api/display</h3>
              <p className="text-sm text-muted-foreground mb-2">Get screen for device</p>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                {`curl "${process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"}/api/display?uuid=test-device-123"`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">POST /api/log</h3>
              <p className="text-sm text-muted-foreground mb-2">Log device activity</p>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                {`curl -X POST ${process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"}/api/log \\
  -H "Content-Type: application/json" \\
  -d '{"device_uuid": "test-device-123", "message": "Test log"}'`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
