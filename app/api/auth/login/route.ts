import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // Check password against environment variable
    const correctPassword = process.env.DASHBOARD_PASSWORD || "trmnl2024"

    if (password === correctPassword) {
      const response = NextResponse.json({ success: true })

      // Set authentication cookie (expires in 7 days)
      response.cookies.set("trmnl-auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })

      return response
    } else {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
