"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Edit2, Upload } from "lucide-react"

const artistFormSchema = z.object({
  name: z.string().min(1, "Artist name is required"),
  description: z.string().min(1, "Description is required"),
  profile_pic_url: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || typeof val === "string", "Invalid profile picture URL"),
})

export type ArtistFormValues = z.infer<typeof artistFormSchema>

interface ArtistFormProps {
  defaultValues: ArtistFormValues
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

  useEffect(() => {
    form.reset({
      name: defaultValues.name,
      description: defaultValues.description,
      profile_pic_url: defaultValues.profile_pic_url ?? "",
    })
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

  const previewSrc = useMemo(() => {
    if (profileImage) return URL.createObjectURL(profileImage)
    const currentUrl = form.getValues("profile_pic_url")
    return currentUrl && currentUrl.length > 0 ? currentUrl : "/placeholder.svg"
  }, [profileImage, form])

  useEffect(() => {
    return () => {
      if (profileImage) {
        URL.revokeObjectURL(previewSrc)
      }
    }
  }, [profileImage, previewSrc])

  const submitHandler = (values: ArtistFormValues) => {
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
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing((v) => !v)}
            className="text-gray-400 hover:text-white hover:bg-neutral-700"
            aria-label={isEditing ? "Stop editing" : "Edit profile"}
            title={isEditing ? "Stop editing" : "Edit profile"}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Profile Image Section with Drag & Drop */}
        <div className="flex flex-col items-center space-y-4 mb-2">
          <div
            className={`relative cursor-pointer transition-all duration-200 ${
              isEditing 
                ? dragActive 
                  ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-neutral-900 scale-105" 
                  : "hover:ring-2 hover:ring-gray-500 hover:ring-offset-2 hover:ring-offset-neutral-900"
                : ""
            }`}
            onDragEnter={isEditing ? handleDrag : undefined}
            onDragLeave={isEditing ? handleDrag : undefined}
            onDragOver={isEditing ? handleDrag : undefined}
            onDrop={isEditing ? handleDrop : undefined}
            onClick={isEditing ? () => profileImageRef.current?.click() : undefined}
          >
            <img
              src={previewSrc}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
            {isEditing && (
              <div className={`absolute inset-0 rounded-full flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity ${
                dragActive ? "opacity-100" : ""
              }`}>
                <Upload className="w-8 h-8 text-white" />
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
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:text-gray-100 hover:bg-neutral-800 bg-transparent"
                onClick={() => profileImageRef.current?.click()}
              >
                Change Profile Picture
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Click or drag & drop an image
              </p>
            </div>
          )}
        </div>

        <FormField
          control={form.control}
          name="profile_pic_url"
          render={({ field }) => (
            <input type="hidden" {...field} />
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Artist Name</FormLabel>
              <Input
                {...field}
                disabled={!isEditing}
                className="bg-neutral-800 border-neutral-700 text-white disabled:opacity-70"
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
                className="bg-neutral-800 border-neutral-700 text-white disabled:opacity-70 min-h-[100px]"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {isEditing && (
          <Button type="submit" className="w-full bg-neutral-700 hover:bg-neutral-500 text-white">
            Save Changes
          </Button>
        )}
      </form>
    </Form>
  )
}
