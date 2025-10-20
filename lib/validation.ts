import { z } from "zod"

/**
 * Device registration schema
 */
export const deviceRegistrationSchema = z.object({
  macAddress: z.string().regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, "Invalid MAC address format"),
  name: z.string().min(1).max(100).optional(),
  timezone: z.string().default("UTC"),
  screen: z.enum(["epd_2_9", "epd_4_2", "epd_7_5"]).optional(),
})

/**
 * Device update schema
 */
export const deviceUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  timezone: z.string().optional(),
  refresh_schedule: z.string().optional(),
  screen: z.enum(["epd_2_9", "epd_4_2", "epd_7_5"]).optional(),
})

/**
 * Login schema
 */
export const loginSchema = z.object({
  password: z.string().min(1, "Password is required"),
})

/**
 * Display request schema
 */
export const displayRequestSchema = z
  .object({
    friendly_id: z.string().optional(),
    mac_address: z
      .string()
      .regex(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, "Invalid MAC address format")
      .optional(),
  })
  .refine((data) => data.friendly_id || data.mac_address, "Either friendly_id or mac_address must be provided")

/**
 * Log entry schema
 */
export const logEntrySchema = z.object({
  friendly_id: z.string(),
  log_data: z.record(z.any()),
})
