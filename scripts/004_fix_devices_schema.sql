-- Fix devices table schema to add missing TRMNL-specific columns
-- This script is idempotent and can be run multiple times safely

-- Add new columns to devices table (only if they don't exist)
DO $$ 
BEGIN
  -- Add friendly_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='devices' AND column_name='friendly_id') THEN
    ALTER TABLE devices ADD COLUMN friendly_id VARCHAR(20);
  END IF;

  -- Add mac_address column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='devices' AND column_name='mac_address') THEN
    ALTER TABLE devices ADD COLUMN mac_address VARCHAR(17);
  END IF;

  -- Add api_key column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='devices' AND column_name='api_key') THEN
    ALTER TABLE devices ADD COLUMN api_key VARCHAR(64);
  END IF;

  -- Add screen column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='devices' AND column_name='screen') THEN
    ALTER TABLE devices ADD COLUMN screen VARCHAR(20) DEFAULT 'epd_2_9';
  END IF;

  -- Add refresh_schedule column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='devices' AND column_name='refresh_schedule') THEN
    ALTER TABLE devices ADD COLUMN refresh_schedule VARCHAR(50) DEFAULT '*/5 * * * *';
  END IF;

  -- Add timezone column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='devices' AND column_name='timezone') THEN
    ALTER TABLE devices ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC';
  END IF;

  -- Add battery_voltage column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='devices' AND column_name='battery_voltage') THEN
    ALTER TABLE devices ADD COLUMN battery_voltage DECIMAL(4,2);
  END IF;

  -- Add rssi column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='devices' AND column_name='rssi') THEN
    ALTER TABLE devices ADD COLUMN rssi INTEGER;
  END IF;
END $$;

-- Update existing devices to have friendly_id and mac_address based on device_id
-- Only update rows where these fields are NULL
UPDATE devices 
SET 
  mac_address = COALESCE(mac_address, device_id),
  friendly_id = COALESCE(friendly_id, 'TRMNL_' || UPPER(SUBSTRING(MD5(device_id::text), 1, 6)))
WHERE mac_address IS NULL OR friendly_id IS NULL;

-- Create unique indexes (only if they don't exist)
CREATE UNIQUE INDEX IF NOT EXISTS idx_devices_friendly_id_unique ON devices(friendly_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_devices_mac_address_unique ON devices(mac_address);
CREATE UNIQUE INDEX IF NOT EXISTS idx_devices_api_key_unique ON devices(api_key);

-- Create regular indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_devices_friendly_id ON devices(friendly_id);
CREATE INDEX IF NOT EXISTS idx_devices_mac_address ON devices(mac_address);
CREATE INDEX IF NOT EXISTS idx_devices_api_key ON devices(api_key);

-- Update logs table to use friendly_id
DO $$ 
BEGIN
  -- Add friendly_id column to logs if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='logs' AND column_name='friendly_id') THEN
    ALTER TABLE logs ADD COLUMN friendly_id VARCHAR(20);
  END IF;
END $$;

-- Create index on friendly_id in logs
CREATE INDEX IF NOT EXISTS idx_logs_friendly_id ON logs(friendly_id);

-- Add comments for documentation
COMMENT ON COLUMN devices.friendly_id IS 'Human-readable device identifier (TRMNL_XXXXXX)';
COMMENT ON COLUMN devices.mac_address IS 'Device MAC address or unique identifier';
COMMENT ON COLUMN devices.api_key IS 'Cryptographically secure API key for device authentication';
COMMENT ON COLUMN devices.screen IS 'E-paper display type (epd_2_9, epd_4_2, epd_7_5)';
COMMENT ON COLUMN devices.refresh_schedule IS 'Cron expression for refresh schedule';
COMMENT ON COLUMN devices.timezone IS 'Device timezone (IANA format)';
COMMENT ON COLUMN devices.battery_voltage IS 'Current battery voltage in volts';
COMMENT ON COLUMN devices.rssi IS 'WiFi signal strength (RSSI)';
