export interface Device {
  id: string
  device_id: string
  name: string | null
  firmware_version: string | null
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

export interface Screen {
  id: string
  device_id: string
  name: string
  type: string
  config: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Log {
  id: string
  device_id: string
  level: "info" | "warning" | "error" | "debug"
  message: string
  metadata: Record<string, any>
  created_at: string
}

export interface SetupRequest {
  firmware_version?: string
  device_info?: Record<string, any>
}

export interface DisplayResponse {
  image_url?: string
  refresh_rate?: number
  merge_variables?: Record<string, any>
}

export interface LogRequest {
  level: "info" | "warning" | "error" | "debug"
  message: string
  metadata?: Record<string, any>
}
