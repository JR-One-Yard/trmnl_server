import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Circle, AlertCircle, ExternalLink } from "lucide-react"

export default function SetupGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              ← Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">TRMNL 7.5" DIY Kit Setup Guide</h1>
          <p className="text-muted-foreground">Follow these steps to connect your TRMNL device to your BYOS server</p>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Your BYOS server URL is:{" "}
            <code className="bg-muted px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"}
            </code>
            <br />
            You'll need this URL in Step 4.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          {/* Step 1 */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  1
                </div>
                <div>
                  <CardTitle>Assemble Your Hardware</CardTitle>
                  <CardDescription>Connect the display, battery, and driver board</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="ml-11 space-y-3">
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Connect the FPC cable to the XIAO ePaper Display Board</p>
                  <p className="text-sm text-muted-foreground">Metal side of the FPC cable should face upwards</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Connect the battery to the JST connector</p>
                  <p className="text-sm text-muted-foreground">Red wire to +, black wire to -</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">(Optional) Assemble the enclosure</p>
                  <p className="text-sm text-muted-foreground">
                    Use open-source designs from Printables or Thingiverse
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  2
                </div>
                <div>
                  <CardTitle>Flash the TRMNL Firmware</CardTitle>
                  <CardDescription>Install the latest firmware on your device</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="ml-11 space-y-3">
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Visit the TRMNL Web Flasher</p>
                  <a
                    href="https://usetrmnl.com/flasher"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    usetrmnl.com/flasher <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Connect your device via USB-C</p>
                  <p className="text-sm text-muted-foreground">Use a data-capable USB cable (not just charging)</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Select firmware version 1.5.12 or newer</p>
                  <p className="text-sm text-muted-foreground">Follow the on-screen instructions to flash</p>
                </div>
              </div>
              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Tip:</strong> If the web flasher doesn't work, you can build and flash from source using the
                  <a
                    href="https://github.com/usetrmnl/firmware"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline ml-1"
                  >
                    TRMNL firmware repository
                  </a>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  3
                </div>
                <div>
                  <CardTitle>Connect to WiFi</CardTitle>
                  <CardDescription>Configure your device's network connection</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="ml-11 space-y-3">
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Power on your device</p>
                  <p className="text-sm text-muted-foreground">The device will create a WiFi access point</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Connect to the TRMNL WiFi network</p>
                  <p className="text-sm text-muted-foreground">
                    Look for a network named "TRMNL-XXXX" on your phone or computer
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Open the captive portal</p>
                  <p className="text-sm text-muted-foreground">
                    Your browser should automatically open the configuration page
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Select your home WiFi network and enter the password</p>
                  <p className="text-sm text-muted-foreground">The device will connect and restart</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  4
                </div>
                <div>
                  <CardTitle>Configure BYOS Server URL</CardTitle>
                  <CardDescription className="text-primary">This is the most important step!</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="ml-11 space-y-3">
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Reconnect to the TRMNL WiFi network</p>
                  <p className="text-sm text-muted-foreground">
                    After WiFi setup, the device creates the access point again briefly
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Open the captive portal settings</p>
                  <p className="text-sm text-muted-foreground">Look for "Server Settings" or "Base URL" option</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-1 text-primary" />
                <div>
                  <p className="font-medium">Enter your BYOS server URL:</p>
                  <div className="mt-2 p-3 bg-primary/10 rounded-md border border-primary/20">
                    <code className="text-sm font-mono break-all">
                      {process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"}
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Make sure to include https:// and remove any trailing slashes
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Save the settings</p>
                  <p className="text-sm text-muted-foreground">The device will restart and connect to your server</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 5 */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  5
                </div>
                <div>
                  <CardTitle>Verify Connection</CardTitle>
                  <CardDescription>Check that your device is registered</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="ml-11 space-y-3">
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Wait for the device to boot up</p>
                  <p className="text-sm text-muted-foreground">This may take 30-60 seconds</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Check your dashboard</p>
                  <p className="text-sm text-muted-foreground">Your device should appear in the device list</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Note your device UUID</p>
                  <p className="text-sm text-muted-foreground">
                    This is displayed on the device screen as a 6-digit Friendly ID
                  </p>
                </div>
              </div>
              <Link href="/dashboard">
                <Button className="mt-4">Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Step 6 */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  6
                </div>
                <div>
                  <CardTitle>Create Your First Screen</CardTitle>
                  <CardDescription>Start displaying content on your device</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="ml-11 space-y-3">
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Click on your device in the dashboard</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Click "Create New Screen"</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Choose a screen type (Clock, Weather, Quote, or Custom)</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium">Configure and save</p>
                  <p className="text-sm text-muted-foreground">
                    Your device will display the screen on its next refresh
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium mb-1">Device not appearing in dashboard?</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Verify the BYOS server URL is correct (no trailing slash)</li>
                  <li>Check that your device has internet connectivity</li>
                  <li>Look at the device screen for error messages</li>
                  <li>Try power cycling the device</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Can't connect to TRMNL WiFi network?</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Make sure the device is powered on and the battery is charged</li>
                  <li>The access point only stays active for a few minutes</li>
                  <li>Try resetting the device by holding the reset button</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Screen not updating?</p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Check that at least one screen is marked as "active"</li>
                  <li>Verify the device is checking in (look at "Last Seen" time)</li>
                  <li>Check the logs page for error messages</li>
                  <li>Try manually refreshing the device (button press if available)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Need more help?</p>
                <p className="text-sm text-muted-foreground">
                  Visit the{" "}
                  <a
                    href="https://docs.usetrmnl.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    TRMNL documentation
                  </a>{" "}
                  or check the{" "}
                  <a
                    href="https://github.com/usetrmnl/firmware"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    firmware repository
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href="https://docs.usetrmnl.com/go/diy/byod-s"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                TRMNL BYOD/S Documentation
              </a>
              <a
                href="https://wiki.seeedstudio.com/trmnl_7inch5_diy_kit_main_page/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Seeed Studio Hardware Guide
              </a>
              <a
                href="https://github.com/usetrmnl/firmware"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                TRMNL Firmware Repository
              </a>
              <a
                href="https://usetrmnl.com/flasher"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                TRMNL Web Flasher
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
