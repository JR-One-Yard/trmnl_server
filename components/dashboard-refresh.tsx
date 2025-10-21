"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function DashboardRefresh() {
  const router = useRouter()

  useEffect(() => {
    // Refresh dashboard every 30 seconds to show real-time device activity
    const interval = setInterval(() => {
      router.refresh()
    }, 30000)

    return () => clearInterval(interval)
  }, [router])

  return null
}
