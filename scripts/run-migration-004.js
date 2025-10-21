import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("[v0] Missing Supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Read the SQL file content
const sqlContent = `
-- Add missing columns to devices table if they don't exist
DO $$ 
BEGIN
  -- Add friendly_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devices' AND column_name = 'friendly_id') THEN
    ALTER TABLE devices ADD COLUMN friendly_id TEXT;
    COMMENT ON COLUMN devices.friendly_id IS 'Human-readable device identifier (e.g., TRMNL-ABCD)';
  END IF;

  -- Add mac_address column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devices' AND column_name = 'mac_address') THEN
    ALTER TABLE devices ADD COLUMN mac_address TEXT;
    COMMENT ON COLUMN devices.mac_address IS 'Device MAC address';
  END IF;

  -- Add api_key column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devices' AND column_name = 'api_key') THEN
    ALTER TABLE devices ADD COLUMN api_key TEXT;
    COMMENT ON COLUMN devices.api_key IS 'API key for device authentication';
  END IF;

  -- Add screen column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devices' AND column_name = 'screen') THEN
    ALTER TABLE devices ADD COLUMN screen TEXT DEFAULT 'default';
    COMMENT ON COLUMN devices.screen IS 'Screen type/configuration';
  END IF;

  -- Add refresh_schedule column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devices' AND column_name = 'refresh_schedule') THEN
    ALTER TABLE devices ADD COLUMN refresh_schedule TEXT DEFAULT '0 */6 * * *';
    COMMENT ON COLUMN devices.refresh_schedule IS 'Cron expression for refresh schedule';
  END IF;

  -- Add timezone column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devices' AND column_name = 'timezone') THEN
    ALTER TABLE devices ADD COLUMN timezone TEXT DEFAULT 'UTC';
    COMMENT ON COLUMN devices.timezone IS 'Device timezone';
  END IF;

  -- Add battery_voltage column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devices' AND column_name = 'battery_voltage') THEN
    ALTER TABLE devices ADD COLUMN battery_voltage NUMERIC(4,2);
    COMMENT ON COLUMN devices.battery_voltage IS 'Battery voltage in volts';
  END IF;

  -- Add rssi column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devices' AND column_name = 'rssi') THEN
    ALTER TABLE devices ADD COLUMN rssi INTEGER;
    COMMENT ON COLUMN devices.rssi IS 'WiFi signal strength (RSSI)';
  END IF;
END $$;

-- Populate friendly_id and mac_address for existing devices if they're null
UPDATE devices 
SET 
  friendly_id = COALESCE(friendly_id, 'TRMNL-' || UPPER(SUBSTRING(device_id::text, 1, 4))),
  mac_address = COALESCE(mac_address, UPPER(REPLACE(device_id::text, '-', ':'))),
  api_key = COALESCE(api_key, encode(gen_random_bytes(32), 'hex'))
WHERE friendly_id IS NULL OR mac_address IS NULL OR api_key IS NULL;

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_devices_friendly_id ON devices(friendly_id);
CREATE INDEX IF NOT EXISTS idx_devices_mac_address ON devices(mac_address);
CREATE INDEX IF NOT EXISTS idx_devices_api_key ON devices(api_key);

-- Add unique constraints
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'devices_friendly_id_key') THEN
    ALTER TABLE devices ADD CONSTRAINT devices_friendly_id_key UNIQUE (friendly_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'devices_mac_address_key') THEN
    ALTER TABLE devices ADD CONSTRAINT devices_mac_address_key UNIQUE (mac_address);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'devices_api_key_key') THEN
    ALTER TABLE devices ADD CONSTRAINT devices_api_key_key UNIQUE (api_key);
  END IF;
END $$;

-- Add friendly_id to logs table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'logs' AND column_name = 'friendly_id') THEN
    ALTER TABLE logs ADD COLUMN friendly_id TEXT;
    COMMENT ON COLUMN logs.friendly_id IS 'Reference to device friendly_id';
  END IF;
END $$;

-- Create index on logs.friendly_id
CREATE INDEX IF NOT EXISTS idx_logs_friendly_id ON logs(friendly_id);
`

console.log("[v0] Starting database migration...")

try {
  // Execute the SQL
  const { data, error } = await supabase.rpc("exec_sql", { sql: sqlContent })

  if (error) {
    // If exec_sql doesn't exist, try direct query
    console.log("[v0] Trying direct SQL execution...")
    const { error: directError } = await supabase.from("_sql").select("*").limit(0)

    if (directError) {
      console.log("[v0] Note: Direct SQL execution requires Supabase SQL Editor or pg client")
      console.log("[v0] Migration SQL is ready in scripts/004_fix_devices_schema.sql")
      console.log("[v0] Please run it in your Supabase SQL Editor at:")
      console.log(`[v0] ${supabaseUrl.replace(".supabase.co", ".supabase.co/project/_/sql")}`)
    }
  } else {
    console.log("[v0] ✅ Migration completed successfully!")
    console.log(
      "[v0] Added columns: friendly_id, mac_address, api_key, screen, refresh_schedule, timezone, battery_voltage, rssi",
    )
    console.log("[v0] Created indexes and unique constraints")
  }
} catch (err) {
  console.error("[v0] Migration error:", err.message)
  console.log("[v0] You can manually run the SQL in Supabase SQL Editor")
  console.log("[v0] The SQL file is available at: scripts/004_fix_devices_schema.sql")
}
