import { createClient } from "@/lib/supabase/server"

export type LogLevel = "info" | "warn" | "error" | "debug"

export interface LogMetadata {
  [key: string]: any
}

/**
 * Log message to logs table with fallback to console
 * @param level - Log level
 * @param message - Log message
 * @param metadata - Optional metadata object
 * @param source - Optional source identifier
 */
export async function logToSystem(
  level: LogLevel,
  message: string,
  metadata?: LogMetadata,
  source = "api",
): Promise<void> {
  // Always log to console
  const consoleMessage = `[${level.toUpperCase()}] ${message}`

  switch (level) {
    case "error":
      console.error(consoleMessage, metadata || "")
      break
    case "warn":
      console.warn(consoleMessage, metadata || "")
      break
    case "debug":
      console.debug(consoleMessage, metadata || "")
      break
    default:
      console.log(consoleMessage, metadata || "")
  }

  // Try to log to database
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("logs").insert({
      level,
      message,
      source,
      metadata: metadata || null,
      trace: new Error().stack || null,
    })

    if (error) {
      console.error("Failed to write to logs table:", error)
    }
  } catch (error) {
    console.error("Failed to log to database:", error)
  }
}

/**
 * Log info message
 */
export async function logInfo(message: string, metadata?: LogMetadata): Promise<void> {
  await logToSystem("info", message, metadata)
}

/**
 * Log warning message
 */
export async function logWarn(message: string, metadata?: LogMetadata): Promise<void> {
  await logToSystem("warn", message, metadata)
}

/**
 * Log error message
 */
export async function logError(message: string, metadata?: LogMetadata): Promise<void> {
  await logToSystem("error", message, metadata)
}

/**
 * Log debug message
 */
export async function logDebug(message: string, metadata?: LogMetadata): Promise<void> {
  await logToSystem("debug", message, metadata)
}
