"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Edit2 } from "lucide-react"

const artistFormSchema = z.object({
  name: z.string().min(1, "Artist name is required"),
  description: z.string().min(1, "Description is required"),
  // Accept empty or a URL string. Many backends may return empty string/null when not set.
  profile_pic_url: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || typeof val === "string", "Invalid profile picture URL"),
})

export type ArtistFormValues = z.infer<typeof artistFormSchema>

interface ArtistFormProps {
  // Provide name, description, and optionally profile_pic_url
  defaultValues: ArtistFormValues
  // Optional submit handler if you want to override default behavior
  onSubmit?: (values: ArtistFormValues, profileImageFile: File | null) => void
}

export default function ArtistForm({ defaultValues, onSubmit }: ArtistFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)

  const profileImageRef = useRef<HTMLInputElement>(null)

  const form = useForm<ArtistFormValues>({
    resolver: zodResolver(artistFormSchema),
    defaultValues: {
      name: defaultValues.name,
      description: defaultValues.description,
      profile_pic_url: defaultValues.profile_pic_url ?? "",
    },
  })

  // Keep form in sync if parent passes new defaultValues (e.g., after query loads)
  useEffect(() => {
    form.reset({
      name: defaultValues.name,
      description: defaultValues.description,
      profile_pic_url: defaultValues.profile_pic_url ?? "",
    })
    // Reset local image preview when upstream data changes
    setProfileImage(null)
  }, [defaultValues, form])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith("image/")) {
        setProfileImage(file)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setProfileImage(file)
    }
  }

  // Prefer preview of uploaded file, else fall back to existing URL, else placeholder
  const previewSrc = useMemo(() => {
    if (profileImage) return URL.createObjectURL(profileImage)
    const currentUrl = form.getValues("profile_pic_url")
    return currentUrl && currentUrl.length > 0 ? currentUrl : "/placeholder.svg"
  }, [profileImage, form])

  // Clean up object URL if created
  useEffect(() => {
    return () => {
      if (profileImage) {
        URL.revokeObjectURL(previewSrc)
      }
    }
  }, [profileImage, previewSrc])

  const submitHandler = (values: ArtistFormValues) => {
    // If you upload profileImage to storage, replace values.profile_pic_url with the returned URL.
    // For now we keep the existing URL and pass the File separately.
    if (onSubmit) {
      onSubmit(values, profileImage)
    } else {
      console.log("Updated artist:", values)
      console.log("Selected profile image File (not yet uploaded):", profileImage)
    }
    setIsEditing(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitHandler)} className="space-y-6">
        {/* Edit toggle */}
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing((v) => !v)}
            className="text-gray-400 hover:text-white hover:bg-gray-700"
            aria-label={isEditing ? "Stop editing" : "Edit profile"}
            title={isEditing ? "Stop editing" : "Edit profile"}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Profile Image Section */}
        <div className="flex flex-col items-center space-y-4 mb-2">
          <div className="relative group">
            <img
              src={previewSrc}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
            {isEditing && (
              <div
                className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => profileImageRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDrag}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
              >
                <Edit2 className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          <input
            ref={profileImageRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={!isEditing}
          />
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
              onClick={() => profileImageRef.current?.click()}
            >
              Change Profile Picture
            </Button>
          )}
        </div>

        {/* Hidden field to keep profile_pic_url in form state.
            If you want to allow manual URL input instead of upload, replace this with a visible Input. */}
        <FormField
          control={form.control}
          name="profile_pic_url"
          render={({ field }) => (
            <input type="hidden" {...field} />
          )}
        />

        {/* Artist Information */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Artist Name</FormLabel>
              <Input
                {...field}
                disabled={!isEditing}
                className="bg-gray-700 border-gray-600 text-white disabled:opacity-70"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Description</FormLabel>
              <Textarea
                {...field}
                disabled={!isEditing}
                className="bg-gray-700 border-gray-600 text-white disabled:opacity-70 min-h-[100px]"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditing && (
          <Button type="submit" className="w-full bg-gray-600 hover:bg-gray-500 text-white">
            Save Changes
          </Button>
        )}
      </form>
    </Form>
  )
}