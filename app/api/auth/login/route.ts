import { type NextRequest, NextResponse } from "next/server"
import { generateSessionToken } from "@/lib/security"
import { loginSchema } from "@/lib/validation"
import { logInfo, logWarn, logError } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      await logWarn("Login attempt with invalid request body", {
        errors: validation.error.errors,
      })
      return NextResponse.json({ error: "Invalid request", details: validation.error.errors }, { status: 400 })
    }

    const { password } = validation.data

    const correctPassword = process.env.DASHBOARD_PASSWORD

    if (!correctPassword) {
      await logError("DASHBOARD_PASSWORD environment variable is not set")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    if (password === correctPassword) {
      const sessionToken = generateSessionToken()

      const response = NextResponse.json({ success: true })

      response.cookies.set("trmnl-auth", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })

      await logInfo("Successful login attempt")
      return response
    } else {
      await logWarn("Failed login attempt - incorrect password")
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }
  } catch (error) {
    await logError("Login error", { error: String(error) })
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
