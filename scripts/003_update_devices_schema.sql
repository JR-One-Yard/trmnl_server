-- Update devices table to match Phase 1 security requirements
-- This migration adds crypto-based security fields and TRMNL-specific columns

-- Add new columns to devices table
ALTER TABLE devices
ADD COLUMN IF NOT EXISTS friendly_id VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS mac_address VARCHAR(17) UNIQUE,
ADD COLUMN IF NOT EXISTS api_key VARCHAR(64) UNIQUE,
ADD COLUMN IF NOT EXISTS screen VARCHAR(20) DEFAULT 'epd_2_9',
ADD COLUMN IF NOT EXISTS refresh_schedule VARCHAR(50) DEFAULT '*/5 * * * *',
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS battery_voltage DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS rssi INTEGER;

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_devices_friendly_id ON devices(friendly_id);
CREATE INDEX IF NOT EXISTS idx_devices_mac_address ON devices(mac_address);
CREATE INDEX IF NOT EXISTS idx_devices_api_key ON devices(api_key);

-- Update existing devices to have friendly_id and mac_address based on device_id
-- This is a one-time migration for existing data
UPDATE devices 
SET 
  mac_address = device_id,
  friendly_id = 'TRMNL_' || UPPER(SUBSTRING(MD5(device_id), 1, 6))
WHERE mac_address IS NULL AND device_id IS NOT NULL;

-- Add constraints
ALTER TABLE devices
ALTER COLUMN friendly_id SET NOT NULL,
ALTER COLUMN mac_address SET NOT NULL,
ALTER COLUMN api_key SET NOT NULL;

-- Add check constraint for MAC address format
ALTER TABLE devices
ADD CONSTRAINT check_mac_address_format 
CHECK (mac_address ~ '^([0-9A-F]{2}:){5}[0-9A-F]{2}$');

-- Add check constraint for screen type
ALTER TABLE devices
ADD CONSTRAINT check_screen_type 
CHECK (screen IN ('epd_2_9', 'epd_4_2', 'epd_7_5'));

-- Update logs table to use friendly_id instead of device_id
ALTER TABLE logs
ADD COLUMN IF NOT EXISTS friendly_id VARCHAR(20);

-- Create index on friendly_id in logs
CREATE INDEX IF NOT EXISTS idx_logs_friendly_id ON logs(friendly_id);

-- Add foreign key constraint
ALTER TABLE logs
ADD CONSTRAINT fk_logs_friendly_id 
FOREIGN KEY (friendly_id) 
REFERENCES devices(friendly_id) 
ON DELETE CASCADE;

-- Add comments
COMMENT ON COLUMN devices.friendly_id IS 'Human-readable device identifier (TRMNL_XXXXXX)';
COMMENT ON COLUMN devices.mac_address IS 'Normalized MAC address (XX:XX:XX:XX:XX:XX)';
COMMENT ON COLUMN devices.api_key IS 'Cryptographically secure API key (HMAC-SHA256)';
COMMENT ON COLUMN devices.screen IS 'E-paper display type';
COMMENT ON COLUMN devices.refresh_schedule IS 'Cron expression for refresh schedule';
COMMENT ON COLUMN devices.timezone IS 'Device timezone (IANA format)';
COMMENT ON COLUMN devices.battery_voltage IS 'Current battery voltage in volts';
COMMENT ON COLUMN devices.rssi IS 'WiFi signal strength (RSSI)';
