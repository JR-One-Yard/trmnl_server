import type { CalEvent } from "./types"

// ---- Minimal single-user fetcher ----
// Start with "fake data" so you can verify the render on-device today.
// Swap `getWeekEvents` to Google Calendar once OAuth is wired.

export async function getWeekEvents(start: Date, end: Date): Promise<CalEvent[]> {
  // TODO: replace with Google Calendar API call; keep structure identical
  // Fake sample for proof of life:
  const d = (y: number, m: number, day: number, h: number, min: number) => new Date(Date.UTC(y, m, day, h - 11, min)) // crude AU/Sydney shift for demo

  const year = start.getFullYear()
  const month = start.getMonth()
  const monday = start.getDate()

  return [
    {
      id: "1",
      title: "Team sync",
      start: d(year, month, monday + 1, 9, 0),
      end: d(year, month, monday + 1, 10, 0),
      allDay: false,
      location: "Zoom",
      calendar: "Primary",
    },
    {
      id: "2",
      title: "Client lunch",
      start: d(year, month, monday + 2, 12, 30),
      end: d(year, month, monday + 2, 13, 30),
      allDay: false,
      location: "CBD",
      calendar: "Primary",
    },
    {
      id: "3",
      title: "All-day offsite",
      start: new Date(start), // interpreted as all-day in renderer
      end: new Date(end),
      allDay: true,
      calendar: "Ops",
    },
  ].sort((a, b) => a.start.getTime() - b.start.getTime())
}

/* ---------- Real Google fetch (stub notes) ----------
1) Load access token from oauth_google_tokens (refresh if expired)
2) For each selected calendar in gcal_calendars:
   GET https://www.googleapis.com/calendar/v3/calendars/{id}/events
   params: singleEvents=true, orderBy=startTime, timeMin, timeMax
3) Map to CalEvent, handling all-day:
   all-day has start.date / end.date (no dateTime)
4) Return merged, sorted list
------------------------------------------------------ */
