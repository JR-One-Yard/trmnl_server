import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Monitor, Zap, Shield, Code } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-balance">TRMNL BYOS</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl text-balance">
            Build Your Own Server for TRMNL devices. Self-host and manage your e-ink displays with complete control.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/docs">Documentation</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Monitor className="w-10 h-10 mb-2 text-primary" />
              <CardTitle>Device Management</CardTitle>
              <CardDescription>Monitor and control all your TRMNL devices from one dashboard</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="w-10 h-10 mb-2 text-primary" />
              <CardTitle>Dynamic Screens</CardTitle>
              <CardDescription>Create custom screens with clock, weather, quotes, and more</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-10 h-10 mb-2 text-primary" />
              <CardTitle>Self-Hosted</CardTitle>
              <CardDescription>Complete control over your data with zero external dependencies</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Code className="w-10 h-10 mb-2 text-primary" />
              <CardTitle>JSON API</CardTitle>
              <CardDescription>Full API support for device setup, display, and logging</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get your TRMNL device connected in minutes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Configure Your Device</h3>
                <p className="text-sm text-muted-foreground">Point your TRMNL device to this server's API endpoint</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Create Screens</h3>
                <p className="text-sm text-muted-foreground">
                  Design custom screens in the dashboard with various templates
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Monitor & Manage</h3>
                <p className="text-sm text-muted-foreground">
                  View device status, logs, and update screens in real-time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
