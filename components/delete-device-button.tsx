"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { Trash2 } from "lucide-react"

interface DeleteDeviceButtonProps {
  deviceId: string
  deviceName: string
}

export function DeleteDeviceButton({ deviceId, deviceName }: DeleteDeviceButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${deviceName}? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/device/${deviceId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete device")

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Error deleting device:", error)
      alert("Failed to delete device")
      setIsDeleting(false)
    }
  }

  return (
    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
      <Trash2 className="w-4 h-4 mr-2" />
      {isDeleting ? "Deleting..." : "Delete Device"}
    </Button>
  )
}
