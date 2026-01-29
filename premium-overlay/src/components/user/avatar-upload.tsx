"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Loader2 } from "lucide-react"
import { uploadAvatarAction } from "@/actions/user"
import { FormMessage } from "@/components/auth/form-message"

interface AvatarUploadProps {
  currentAvatar?: string
  userName: string
}

export function AvatarUpload({ currentAvatar, userName }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append("avatar", file)

    try {
      const result = await uploadAvatarAction(null, formData)
      if (result.success) {
        setMessage({ text: result.message || "Avatar updated successfully", type: "success" })
      } else {
        setMessage({ text: result.error?.form || "Failed to upload avatar", type: "error" })
      }
    } catch {
      setMessage({ text: "An error occurred while uploading", type: "error" })
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={currentAvatar || "/placeholder.svg"} alt={userName} />
          <AvatarFallback className="text-lg">
            {userName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <Button
          size="sm"
          variant="secondary"
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
          onClick={triggerFileSelect}
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </Button>
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload avatar"
      />

      <div className="text-center">
        <Label className="text-sm text-muted-foreground">Click the camera icon to change your avatar</Label>
        <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max size 5MB.</p>
      </div>

      {message && (
        <FormMessage 
          state={message.type === "success" 
            ? { success: true, message: message.text }
            : { error: { message: message.text } }
          } 
        />
      )}
    </div>
  )
}
