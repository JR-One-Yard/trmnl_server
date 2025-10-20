#!/bin/bash
# test-api.sh - TRMNL API endpoint validation script
# Usage: ./scripts/test-api.sh [BASE_URL]

set -e

# Configuration
BASE_URL="${1:-http://localhost:3000}"
MAC_ADDRESS="AA:BB:CC:DD:EE:FF"
TEST_API_KEY=""

echo "=========================================="
echo "TRMNL API Testing Suite"
echo "=========================================="
echo "Base URL: $BASE_URL"
echo "Test MAC: $MAC_ADDRESS"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Setup endpoint (device registration)
echo "=========================================="
echo "Test 1: Device Setup (POST /api/setup)"
echo "=========================================="
SETUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/setup" \
  -H "Content-Type: application/json" \
  -H "ID: $MAC_ADDRESS" \
  -d '{
    "device_name": "Test TRMNL Device",
    "firmware_version": "1.0.0",
    "screen": "epd_2_9",
    "timezone": "America/New_York"
  }')

echo "Response:"
echo "$SETUP_RESPONSE" | jq '.'

# Extract API key and friendly ID
TEST_API_KEY=$(echo "$SETUP_RESPONSE" | jq -r '.api_key // empty')
FRIENDLY_ID=$(echo "$SETUP_RESPONSE" | jq -r '.friendly_id // empty')
STATUS=$(echo "$SETUP_RESPONSE" | jq -r '.status')

if [ "$STATUS" = "created" ] || [ "$STATUS" = "updated" ]; then
  echo -e "${GREEN}✓ Setup successful${NC}"
  echo "API Key: $TEST_API_KEY"
  echo "Friendly ID: $FRIENDLY_ID"
else
  echo -e "${RED}✗ Setup failed${NC}"
  exit 1
fi

echo ""
sleep 1

# Test 2: Display endpoint with MAC + API key
echo "=========================================="
echo "Test 2: Display Request (GET /api/display)"
echo "=========================================="
echo "Authentication: MAC + API Key"
DISPLAY_RESPONSE=$(curl -s -X GET "$BASE_URL/api/display" \
  -H "Content-Type: application/json" \
  -H "ID: $MAC_ADDRESS" \
  -H "Access-Token: $TEST_API_KEY" \
  -H "Battery-Voltage: 4.2" \
  -H "Firmware-Version: 1.0.0" \
  -H "RSSI: -45")

echo "Response:"
echo "$DISPLAY_RESPONSE" | jq '.'

DISPLAY_STATUS=$(echo "$DISPLAY_RESPONSE" | jq -r '.status')
if [ "$DISPLAY_STATUS" = "ok" ]; then
  echo -e "${GREEN}✓ Display request successful${NC}"
  IMAGE_URL=$(echo "$DISPLAY_RESPONSE" | jq -r '.image_url')
  REFRESH_RATE=$(echo "$DISPLAY_RESPONSE" | jq -r '.refresh_rate')
  echo "Image URL: $IMAGE_URL"
  echo "Refresh Rate: ${REFRESH_RATE}s"
else
  echo -e "${RED}✗ Display request failed${NC}"
fi

echo ""
sleep 1

# Test 3: Display endpoint with MAC only (fallback auth)
echo "=========================================="
echo "Test 3: Display Request - MAC Only"
echo "=========================================="
echo "Authentication: MAC only (fallback)"
DISPLAY_MAC_ONLY=$(curl -s -X GET "$BASE_URL/api/display" \
  -H "Content-Type: application/json" \
  -H "ID: $MAC_ADDRESS")

echo "Response:"
echo "$DISPLAY_MAC_ONLY" | jq '.'

DISPLAY_MAC_STATUS=$(echo "$DISPLAY_MAC_ONLY" | jq -r '.status')
if [ "$DISPLAY_MAC_STATUS" = "ok" ]; then
  echo -e "${GREEN}✓ MAC-only authentication successful${NC}"
else
  echo -e "${YELLOW}⚠ MAC-only authentication failed (expected if strict auth enabled)${NC}"
fi

echo ""
sleep 1

# Test 4: Display endpoint with API key only (fallback auth)
echo "=========================================="
echo "Test 4: Display Request - API Key Only"
echo "=========================================="
echo "Authentication: API Key only (fallback)"
DISPLAY_KEY_ONLY=$(curl -s -X GET "$BASE_URL/api/display" \
  -H "Content-Type: application/json" \
  -H "Access-Token: $TEST_API_KEY")

echo "Response:"
echo "$DISPLAY_KEY_ONLY" | jq '.'

DISPLAY_KEY_STATUS=$(echo "$DISPLAY_KEY_ONLY" | jq -r '.status')
if [ "$DISPLAY_KEY_STATUS" = "ok" ]; then
  echo -e "${GREEN}✓ API-key-only authentication successful${NC}"
else
  echo -e "${YELLOW}⚠ API-key-only authentication failed${NC}"
fi

echo ""
sleep 1

# Test 5: Log endpoint
echo "=========================================="
echo "Test 5: Log Entry (POST /api/log)"
echo "=========================================="
LOG_RESPONSE=$(curl -s -X POST "$BASE_URL/api/log" \
  -H "Content-Type: application/json" \
  -H "ID: $MAC_ADDRESS" \
  -H "Access-Token: $TEST_API_KEY" \
  -H "Battery-Voltage: 4.1" \
  -H "RSSI: -50" \
  -d '{
    "message": "Test log entry from API test script",
    "level": "info",
    "log_data": {
      "test": true,
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }
  }')

echo "Response:"
echo "$LOG_RESPONSE" | jq '.'

LOG_STATUS=$(echo "$LOG_RESPONSE" | jq -r '.status')
if [ "$LOG_STATUS" = "ok" ]; then
  echo -e "${GREEN}✓ Log entry successful${NC}"
else
  echo -e "${RED}✗ Log entry failed${NC}"
fi

echo ""
sleep 1

# Test 6: Setup health check
echo "=========================================="
echo "Test 6: Setup Health Check (GET /api/setup)"
echo "=========================================="
HEALTH_RESPONSE=$(curl -s -X GET "$BASE_URL/api/setup")

echo "Response:"
echo "$HEALTH_RESPONSE" | jq '.'

HEALTH_STATUS=$(echo "$HEALTH_RESPONSE" | jq -r '.status')
if [ "$HEALTH_STATUS" = "ok" ]; then
  echo -e "${GREEN}✓ Health check successful${NC}"
else
  echo -e "${RED}✗ Health check failed${NC}"
fi

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo "All tests completed!"
echo "Device MAC: $MAC_ADDRESS"
echo "Device Friendly ID: $FRIENDLY_ID"
echo "Device API Key: $TEST_API_KEY"
echo ""
echo "Next steps:"
echo "1. Check the dashboard at $BASE_URL/dashboard"
echo "2. View device details at $BASE_URL/device/[device-id]"
echo "3. Check logs at $BASE_URL/logs"
echo "=========================================="
