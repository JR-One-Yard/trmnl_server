"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Switch } from "./ui/switch"
import type { Screen } from "@/lib/types"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface ScreenFormProps {
  deviceId: string
  screen?: Screen
}

export function ScreenForm({ deviceId, screen }: ScreenFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(screen?.name || "")
  const [type, setType] = useState(screen?.type || "clock")
  const [isActive, setIsActive] = useState(screen?.is_active ?? true)

  // Clock config
  const [clockFormat, setClockFormat] = useState(screen?.config?.format || "12h")

  // Weather config
  const [weatherLocation, setWeatherLocation] = useState(screen?.config?.location || "")
  const [weatherTemp, setWeatherTemp] = useState(screen?.config?.temperature || "72°F")
  const [weatherCondition, setWeatherCondition] = useState(screen?.config?.condition || "Sunny")

  // Quote config
  const [quote, setQuote] = useState(screen?.config?.quote || "")
  const [author, setAuthor] = useState(screen?.config?.author || "")

  // Custom config
  const [customTitle, setCustomTitle] = useState(screen?.config?.title || "")
  const [customContent, setCustomContent] = useState(screen?.config?.content || "")
  const [customBgColor, setCustomBgColor] = useState(screen?.config?.backgroundColor || "#FFFFFF")
  const [customTextColor, setCustomTextColor] = useState(screen?.config?.textColor || "#000000")

  // Calendar config
  const [calendarRefreshRate, setCalendarRefreshRate] = useState(screen?.config?.refresh_rate || 300)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = getSupabaseBrowserClient()

      let config = {}
      switch (type) {
        case "clock":
          config = { format: clockFormat }
          break
        case "weather":
          config = {
            location: weatherLocation,
            temperature: weatherTemp,
            condition: weatherCondition,
          }
          break
        case "quote":
          config = { quote, author }
          break
        case "custom":
          config = {
            title: customTitle,
            content: customContent,
            backgroundColor: customBgColor,
            textColor: customTextColor,
          }
          break
        case "calendar-week":
          config = {
            refresh_rate: calendarRefreshRate,
          }
          break
      }

      if (screen) {
        // Update existing screen
        const { error } = await supabase
          .from("screens")
          .update({
            name,
            type,
            config,
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", screen.id)

        if (error) throw error
      } else {
        // Create new screen
        const { error } = await supabase.from("screens").insert({
          device_id: deviceId,
          name,
          type,
          config,
          is_active: isActive,
        })

        if (error) throw error
      }

      router.push(`/device/${deviceId}`)
      router.refresh()
    } catch (error) {
      console.error("[v0] Screen form error:", error)
      alert("Failed to save screen. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Configure the screen name and type</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Screen Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Screen" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Screen Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clock">Clock</SelectItem>
                <SelectItem value="weather">Weather</SelectItem>
                <SelectItem value="quote">Quote</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="calendar-week">Calendar (Week View)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="active">Active</Label>
              <div className="text-sm text-muted-foreground">Display this screen on the device</div>
            </div>
            <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </CardContent>
      </Card>

      {type === "clock" && (
        <Card>
          <CardHeader>
            <CardTitle>Clock Settings</CardTitle>
            <CardDescription>Configure the clock display</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clockFormat">Time Format</Label>
              <Select value={clockFormat} onValueChange={setClockFormat}>
                <SelectTrigger id="clockFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12 Hour</SelectItem>
                  <SelectItem value="24h">24 Hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {type === "weather" && (
        <Card>
          <CardHeader>
            <CardTitle>Weather Settings</CardTitle>
            <CardDescription>Configure the weather display</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={weatherLocation}
                onChange={(e) => setWeatherLocation(e.target.value)}
                placeholder="San Francisco, CA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                value={weatherTemp}
                onChange={(e) => setWeatherTemp(e.target.value)}
                placeholder="72°F"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Input
                id="condition"
                value={weatherCondition}
                onChange={(e) => setWeatherCondition(e.target.value)}
                placeholder="Sunny"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {type === "quote" && (
        <Card>
          <CardHeader>
            <CardTitle>Quote Settings</CardTitle>
            <CardDescription>Configure the quote display</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quote">Quote</Label>
              <Textarea
                id="quote"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Enter your quote here..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author Name" />
            </div>
          </CardContent>
        </Card>
      )}

      {type === "custom" && (
        <Card>
          <CardHeader>
            <CardTitle>Custom Settings</CardTitle>
            <CardDescription>Configure your custom screen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customTitle">Title</Label>
              <Input
                id="customTitle"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Screen Title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customContent">Content</Label>
              <Textarea
                id="customContent"
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Screen content..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bgColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="bgColor"
                    type="color"
                    value={customBgColor}
                    onChange={(e) => setCustomBgColor(e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input value={customBgColor} onChange={(e) => setCustomBgColor(e.target.value)} className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={customTextColor}
                    onChange={(e) => setCustomTextColor(e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={customTextColor}
                    onChange={(e) => setCustomTextColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {type === "calendar-week" && (
        <Card>
          <CardHeader>
            <CardTitle>Calendar Settings</CardTitle>
            <CardDescription>Configure your weekly calendar view</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="refreshRate">Refresh Rate (seconds)</Label>
              <Input
                id="refreshRate"
                type="number"
                value={calendarRefreshRate}
                onChange={(e) => setCalendarRefreshRate(Number.parseInt(e.target.value))}
                placeholder="300"
                min="60"
              />
              <p className="text-sm text-muted-foreground">
                How often the device should refresh the calendar (minimum 60 seconds)
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Currently displaying mock calendar data. To connect your Google Calendar, follow
                the setup guide in CALENDAR_SETUP.md
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Saving..." : screen ? "Update Screen" : "Create Screen"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
