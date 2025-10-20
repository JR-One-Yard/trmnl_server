/**
 * Validate required environment variables
 * Throws error if any required variables are missing
 */
export function validateEnvironment(): void {
  const required = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "DASHBOARD_PASSWORD", "API_KEY_SECRET"]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        "Please check your .env file and ensure all required variables are set.",
    )
  }
}

/**
 * Get environment variable with validation
 * @param key - Environment variable key
 * @param defaultValue - Optional default value
 * @returns Environment variable value
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key]

  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required but not set`)
  }

  return value || defaultValue!
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production"
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development"
}
