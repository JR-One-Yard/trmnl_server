import { type NextRequest, NextResponse } from "next/server"
import { loginSchema } from "@/lib/validation"
import { logInfo, logWarn, logError } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Login attempt started")
    const body = await request.json()
    console.log("[v0] Request body parsed")

    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      console.log("[v0] Validation failed:", validation.error.errors)
      await logWarn("Login attempt with invalid request body", {
        errors: validation.error.errors,
      })
      return NextResponse.json({ error: "Invalid request", details: validation.error.errors }, { status: 400 })
    }

    const { password } = validation.data

    const correctPassword = process.env.DASHBOARD_PASSWORD

    if (!correctPassword) {
      console.log("[v0] DASHBOARD_PASSWORD not set")
      await logError("DASHBOARD_PASSWORD environment variable is not set")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    console.log("[v0] Checking password match")
    if (password === correctPassword) {
      console.log("[v0] Password correct, generating session token")
      const response = NextResponse.json({ success: true })

      response.cookies.set("trmnl-auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })

      console.log("[v0] Cookie set, logging success")
      logInfo("Successful login attempt").catch((err) => {
        console.error("[v0] Failed to log success:", err)
      })

      console.log("[v0] Returning success response")
      return response
    } else {
      console.log("[v0] Password incorrect")
      await logWarn("Failed login attempt - incorrect password")
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }
  } catch (error) {
    console.error("[v0] Login error:", error)
    await logError("Login error", { error: String(error) })
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
