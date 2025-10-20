# Phase 2: API Standardization - Implementation Complete

## Overview
Phase 2 implements core TRMNL device API endpoints with proper authentication, fallback mechanisms, and device status tracking.

## Implemented Endpoints

### 1. `/api/setup` - Device Registration
**Method:** POST  
**Headers:**
- `ID`: Device MAC address (required)

**Request Body:**
\`\`\`json
{
  "device_name": "My TRMNL Device",
  "firmware_version": "1.0.0",
  "screen": "epd_2_9",
  "timezone": "America/New_York"
}
\`\`\`

**Response Format:**
\`\`\`json
{
  "status": "created" | "updated" | "error",
  "api_key": "generated-api-key",
  "friendly_id": "TRMNL_XXXXXX",
  "image_url": "https://your-app.com/api/render?device_id=...",
  "filename": "TRMNL_XXXXXX.png",
  "message": "Device registered successfully"
}
\`\`\`

**Features:**
- Validates MAC address format
- Generates cryptographically secure API key
- Creates friendly device ID (TRMNL_XXXXXX format)
- Returns image URL with cache-busting
- Always returns 200 status for device compatibility

---

### 2. `/api/display` - Display Content Delivery
**Method:** GET  
**Headers:**
- `ID`: Device MAC address (optional)
- `Access-Token`: Device API key (optional)
- `Battery-Voltage`: Battery voltage in volts (optional)
- `Firmware-Version`: Firmware version string (optional)
- `RSSI`: WiFi signal strength in dBm (optional)

**Response Format:**
\`\`\`json
{
  "status": "ok" | "error",
  "image_url": "https://your-app.com/api/render?device_id=...&t=1234567890",
  "filename": "TRMNL_XXXXXX.png",
  "refresh_rate": 300,
  "reset_firmware": false,
  "update_firmware": false,
  "firmware_url": null,
  "special_function": null,
  "message": "Success"
}
\`\`\`

**Authentication Fallback Chain:**
1. **MAC + API Key** (preferred) - Exact match on both
2. **MAC Only** - Updates API key if provided
3. **API Key Only** - Updates MAC if provided
4. **Mock Device Creation** - Creates temporary device for testing

**Features:**
- Multi-level authentication fallback
- Device status tracking (battery, RSSI, firmware)
- Dynamic refresh rate calculation based on timezone
- Cache-busting timestamps in image URLs
- Always returns 200 status for device compatibility

---

### 3. `/api/log` - Device Log Processing
**Method:** POST  
**Headers:**
- `ID`: Device MAC address (optional)
- `Access-Token`: Device API key (optional)
- `Battery-Voltage`: Battery voltage in volts (optional)
- `Firmware-Version`: Firmware version string (optional)
- `RSSI`: WiFi signal strength in dBm (optional)

**Request Body:**
\`\`\`json
{
  "message": "Log message",
  "level": "info" | "warn" | "error" | "debug",
  "log_data": {
    "custom_field": "value"
  }
}
\`\`\`

**Response Format:**
\`\`\`json
{
  "status": "ok" | "error",
  "message": "Log entry recorded successfully"
}
\`\`\`

**Features:**
- Same authentication fallback as display endpoint
- Device metrics updating
- Structured log storage
- Always returns 200 status for device compatibility

---

## Security Implementation

### Crypto-Based Functions
All security functions use Node.js crypto module:

1. **API Key Generation** (`generateApiKey`)
   - HMAC-SHA256 with secret salt
   - Includes MAC address and timestamp
   - 64-character hexadecimal output

2. **Friendly ID Generation** (`generateFriendlyId`)
   - SHA-256 hash of MAC address
   - Format: `TRMNL_XXXXXX` (6 uppercase hex chars)
   - Deterministic based on MAC

3. **MAC Address Normalization** (`normalizeMacAddress`)
   - Converts any format to `XX:XX:XX:XX:XX:XX`
   - Validates 12 hexadecimal characters
   - Uppercase output

4. **Mock MAC Generation** (`generateMockMacAddress`)
   - SHA-256 hash of API key
   - Used for fallback authentication
   - Enables testing without physical devices

---

## Helper Functions

### Timezone & Refresh Rate
Located in `lib/helpers.ts`:

1. **`calculateNextUpdate(refreshSchedule, timezone)`**
   - Uses Luxon for timezone-aware calculations
   - Parses refresh schedule (seconds or cron)
   - Returns ISO timestamp of next expected update

2. **`calculateRefreshRate(timezone, baseRefreshRate)`**
   - Dynamic refresh based on time of day
   - Slower refresh during night hours (11 PM - 6 AM)
   - Faster refresh during peak hours (7 AM - 10 PM)

3. **`generateImageUrl(baseUrl, deviceId, timestamp)`**
   - Adds cache-busting timestamp parameter
   - Ensures fresh image delivery
   - Prevents browser/CDN caching issues

4. **`parseDeviceStatus(headers)`**
   - Extracts battery, firmware, RSSI from headers
   - Type-safe parsing with fallbacks
   - Returns structured status object

---

## Database Schema

### Devices Table
\`\`\`sql
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friendly_id TEXT UNIQUE NOT NULL,
  mac_address TEXT UNIQUE NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  screen TEXT DEFAULT 'epd_2_9',
  refresh_schedule TEXT DEFAULT '300',
  timezone TEXT DEFAULT 'UTC',
  firmware_version TEXT,
  battery_voltage NUMERIC,
  rssi INTEGER,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

### Logs Table
\`\`\`sql
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friendly_id TEXT NOT NULL REFERENCES devices(friendly_id),
  log_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

---

## Testing

### Quick Test Script
Run the included test script:
\`\`\`bash
chmod +x scripts/test-api.sh
./scripts/test-api.sh http://localhost:3000
\`\`\`

### Manual Testing with cURL

**1. Register Device:**
\`\`\`bash
curl -X POST http://localhost:3000/api/setup \
  -H "Content-Type: application/json" \
  -H "ID: AA:BB:CC:DD:EE:FF" \
  -d '{
    "device_name": "Test Device",
    "firmware_version": "1.0.0",
    "timezone": "America/New_York"
  }'
\`\`\`

**2. Request Display:**
\`\`\`bash
curl -X GET http://localhost:3000/api/display \
  -H "ID: AA:BB:CC:DD:EE:FF" \
  -H "Access-Token: YOUR_API_KEY" \
  -H "Battery-Voltage: 4.2" \
  -H "RSSI: -45"
\`\`\`

**3. Send Log:**
\`\`\`bash
curl -X POST http://localhost:3000/api/log \
  -H "Content-Type: application/json" \
  -H "ID: AA:BB:CC:DD:EE:FF" \
  -H "Access-Token: YOUR_API_KEY" \
  -d '{
    "message": "Test log entry",
    "level": "info"
  }'
\`\`\`

---

## Environment Variables

Required environment variables (see `.env.example`):

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Security
API_KEY_SECRET=your-secret-key-for-hmac
DASHBOARD_PASSWORD=your-dashboard-password

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
\`\`\`

---

## Key Features

### 1. Device Compatibility
- Always returns 200 status code
- Graceful error handling
- Fallback authentication mechanisms
- Mock device creation for testing

### 2. Security
- Crypto-based API key generation
- MAC address validation and normalization
- Multi-level authentication
- Structured logging with metadata

### 3. Device Status Tracking
- Battery voltage monitoring
- WiFi signal strength (RSSI)
- Firmware version tracking
- Last seen timestamps

### 4. Timezone Support
- Dynamic refresh rates based on local time
- Timezone-aware scheduling
- Luxon for robust date/time handling

### 5. Structured Logging
- System logs in database
- Device logs with metadata
- Error tracking with context
- Console fallback for development

---

## Next Steps

Phase 2 is complete! The API endpoints are production-ready with:
- ✅ Device registration and authentication
- ✅ Multi-level fallback authentication
- ✅ Device status tracking
- ✅ Timezone-aware refresh rates
- ✅ Structured logging
- ✅ Comprehensive error handling

Ready for Phase 3: Image rendering and plugin system implementation.
