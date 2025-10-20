import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Monitor, Zap, Shield, Code, ArrowRight, Activity, Database, Wifi } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">TRMNL BYOS</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/docs">Docs</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center mb-24 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Activity className="w-4 h-4" />
            Self-Hosted E-Ink Display Management
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-balance bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Build Your Own Server
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl text-balance leading-relaxed">
            Take complete control of your TRMNL devices. Self-host, customize, and manage your e-ink displays with zero
            external dependencies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/dashboard">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              <Link href="/docs">View Documentation</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Monitor className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Device Management</CardTitle>
              <CardDescription className="text-base">
                Monitor and control all your TRMNL devices from a unified dashboard
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Dynamic Screens</CardTitle>
              <CardDescription className="text-base">
                Create custom screens with clock, weather, quotes, and more widgets
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Self-Hosted</CardTitle>
              <CardDescription className="text-base">
                Complete control over your data with zero external dependencies
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">JSON API</CardTitle>
              <CardDescription className="text-base">
                Full API support for device setup, display rendering, and logging
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Quick Start</h2>
            <p className="text-xl text-muted-foreground">Get your TRMNL device connected in minutes</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mb-4">
                  1
                </div>
                <CardTitle>Configure Device</CardTitle>
                <CardDescription className="text-base">
                  Point your TRMNL device to this server's API endpoint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Wifi className="w-4 h-4" />
                  <span>Network setup required</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mb-4">
                  2
                </div>
                <CardTitle>Create Screens</CardTitle>
                <CardDescription className="text-base">
                  Design custom screens in the dashboard with various templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Monitor className="w-4 h-4" />
                  <span>Multiple layouts available</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary/50" />
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl mb-4">
                  3
                </div>
                <CardTitle>Monitor & Manage</CardTitle>
                <CardDescription className="text-base">
                  View device status, logs, and update screens in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Database className="w-4 h-4" />
                  <span>Real-time updates</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Monitor className="w-4 h-4" />
              <span>TRMNL BYOS - Self-hosted e-ink display management</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/docs">Documentation</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
