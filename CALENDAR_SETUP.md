# Google Calendar Integration Setup

This document explains how to set up Google Calendar integration for your TRMNL BYOS server.

## Current Status

The calendar week view is currently using **mock data** to demonstrate the functionality. The PNG rendering pipeline is fully operational and working with your TRMNL device.

## Mock Data

The system currently displays sample events:
- Team sync (Tuesday 9:00-10:00)
- Client lunch (Wednesday 12:30-13:30)
- All-day offsite event

## Setting Up Real Google Calendar (Future)

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials

### 2. Configure OAuth

Add these environment variables to your Vercel project:

\`\`\`
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/api/oauth/google/callback
\`\`\`

### 3. Run Database Migration

Execute the SQL script to create OAuth tables:

\`\`\`sql
-- Already created in scripts/002_calendar_oauth.sql
-- Run this from your Supabase dashboard or v0 interface
\`\`\`

### 4. Implement OAuth Flow

The OAuth flow needs to be implemented in:
- `/api/oauth/google/authorize` - Initiates OAuth flow
- `/api/oauth/google/callback` - Handles OAuth callback
- `/api/oauth/google/refresh` - Refreshes expired tokens

### 5. Update Calendar Fetch Logic

Replace the mock data in `lib/calendar/fetch.ts` with real Google Calendar API calls:

\`\`\`typescript
export async function getWeekEvents(start: Date, end: Date): Promise<CalEvent[]> {
  // 1. Load access token from oauth_google_tokens
  // 2. Refresh if expired
  // 3. Fetch events from Google Calendar API
  // 4. Map to CalEvent format
  // 5. Return sorted events
}
\`\`\`

## Testing

### Test with Mock Data (Current)

1. Visit `/api/render-week` in your browser
2. You should see a PNG image with sample events
3. Your TRMNL device will display this image

### Test with Real Data (After Setup)

1. Complete OAuth setup
2. Authorize your Google account
3. Select calendars to display
4. Events will automatically appear on your device

## Timezone

All calendar logic uses **Australia/Sydney** timezone. To change this:

1. Update `lib/calendar/time.ts`
2. Modify the timezone logic in `getWeekBoundsSydney()`
3. Update date formatting in `renderWeekSvg.ts`

## Image Specifications

- **Resolution**: 800×480 pixels
- **Format**: PNG (grayscale)
- **Refresh**: Every 30 minutes (configurable)
- **Caching**: ETag-based with 304 responses

## Troubleshooting

### Image not displaying on device

1. Check Vercel logs for errors in `/api/render-week`
2. Verify the PNG is being generated (visit endpoint in browser)
3. Check device logs for download errors

### Events not showing

1. Verify mock data is being returned from `getWeekEvents()`
2. Check console logs for SVG generation errors
3. Ensure week boundaries are calculated correctly

### Performance issues

1. Add caching layer for calendar data
2. Implement incremental updates
3. Optimize SVG rendering

## Future Enhancements

- [ ] Multiple calendar support
- [ ] Event color coding
- [ ] All-day event highlighting
- [ ] Timezone selection in dashboard
- [ ] Calendar selection UI
- [ ] Event filtering
- [ ] Custom date ranges
