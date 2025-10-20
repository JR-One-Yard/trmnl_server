import crypto from "crypto"

/**
 * Generate cryptographically secure API key using HMAC-SHA256
 * @param macAddress - Device MAC address
 * @returns Secure API key
 */
export function generateApiKey(macAddress: string): string {
  const secret = process.env.API_KEY_SECRET || crypto.randomBytes(32).toString("hex")
  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(macAddress + Date.now().toString())
  return hmac.digest("hex")
}

/**
 * Generate friendly device ID from MAC address
 * @param macAddress - Device MAC address
 * @returns Friendly ID in format TRMNL_XXXXXX
 */
export function generateFriendlyId(macAddress: string): string {
  const cleanMac = macAddress.replace(/[^a-fA-F0-9]/g, "").toUpperCase()
  const hash = crypto.createHash("sha256").update(cleanMac).digest("hex")
  return `TRMNL_${hash.substring(0, 6).toUpperCase()}`
}

/**
 * Normalize MAC address to standard format (XX:XX:XX:XX:XX:XX)
 * @param mac - MAC address in any format
 * @returns Normalized MAC address
 */
export function normalizeMacAddress(mac: string): string {
  const cleaned = mac.replace(/[^a-fA-F0-9]/g, "").toUpperCase()
  if (cleaned.length !== 12) {
    throw new Error("Invalid MAC address: must be 12 hexadecimal characters")
  }
  return cleaned.match(/.{2}/g)!.join(":")
}

/**
 * Validate MAC address format
 * @param mac - MAC address to validate
 * @returns True if valid MAC address format
 */
export function isValidMacAddress(mac: string): boolean {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
  return macRegex.test(mac)
}

/**
 * Generate secure session token
 * @returns Cryptographically secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Hash password using SHA-256
 * @param password - Plain text password
 * @returns Hashed password
 */
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

/**
 * Verify password against hash
 * @param password - Plain text password
 * @param hashedPassword - Hashed password to compare against
 * @returns True if password matches
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword
}
