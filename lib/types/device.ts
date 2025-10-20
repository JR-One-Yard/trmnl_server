export interface Device {
  id: string
  friendly_id: string
  mac_address: string
  api_key: string
  name: string
  screen: "epd_2_9" | "epd_4_2" | "epd_7_5"
  refresh_schedule: string
  timezone: string
  firmware_version?: string
  battery_voltage?: number
  rssi?: number
  last_seen_at?: string
  created_at: string
  updated_at: string
}

export interface DeviceRegistration {
  mac_address: string
  name?: string
  screen?: "epd_2_9" | "epd_4_2" | "epd_7_5"
  timezone?: string
  firmware_version?: string
}

export interface DeviceUpdate {
  name?: string
  screen?: "epd_2_9" | "epd_4_2" | "epd_7_5"
  timezone?: string
  refresh_schedule?: string
}

export interface LogEntry {
  id: string
  friendly_id: string
  level: "info" | "warn" | "error" | "debug"
  message: string
  metadata?: Record<string, any>
  created_at: string
}

export interface SystemLog {
  id: string
  level: "info" | "warn" | "error" | "debug"
  message: string
  source?: string
  metadata?: Record<string, any>
  trace?: string
  created_at: string
}

export interface SetupResponse {
  status: "created" | "updated" | "error"
  api_key?: string
  friendly_id?: string
  image_url?: string
  filename?: string
  message?: string
}

export interface DisplayResponse {
  status: "ok" | "error"
  image_url?: string
  filename?: string
  refresh_rate?: number
  reset_firmware?: boolean
  update_firmware?: boolean
  firmware_url?: string
  special_function?: string
  message?: string
}

export interface LogResponse {
  status: "ok" | "error"
  message: string
}

export interface SetupRequest {
  device_name?: string
  firmware_version?: string
  screen?: "epd_2_9" | "epd_4_2" | "epd_7_5"
  timezone?: string
}

export interface DisplayRequest {
  battery_voltage?: number
  firmware_version?: string
  rssi?: number
}

export interface LogRequest {
  message?: string
  level?: "info" | "warn" | "error" | "debug"
  log_data?: Record<string, any>
}
