"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Upload, Music } from "lucide-react"
import { useState } from "react"
import FileUpload from "@/components/artist/FileUpload"

import { useAction } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"

const songFormSchema = z.object({
  title: z.string().min(1, "Song title is required"),
  lyrics: z.string().optional(), // Ignored for now
})

type SongFormValues = z.infer<typeof songFormSchema>

// Hardcoded artist id (temporary)
const ARTIST_ID = "j574dnpwv03zg4hmgfz662ahrn7qvgr5" as Id<"artist">

export default function SongForm() {
  const [songCoverFile, setSongCoverFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const uploadSong = useAction(api.artist.uploadSong)

  const form = useForm<SongFormValues>({
    resolver: zodResolver(songFormSchema),
    defaultValues: { title: "", lyrics: "" },
  })

  const onSubmit = async (values: SongFormValues) => {
    setError(null)
    setSuccess(null)

    if (!songCoverFile) {
      setError("Please select a cover image.")
      return
    }
    if (!audioFile) {
      setError("Please select an audio file.")
      return
    }

    try {
      setSubmitting(true)

      // Convert files to ArrayBuffer for Convex v.bytes()
      const [imageArrayBuffer, audioArrayBuffer] = await Promise.all([
        songCoverFile.arrayBuffer(),
        audioFile.arrayBuffer(),
      ])

      await uploadSong({
        title: values.title,
        artist_id: ARTIST_ID, // hardcoded
        image: imageArrayBuffer,
        audio: audioArrayBuffer,
        imageFilename: songCoverFile.name,
        audioFilename: audioFile.name,
        imageMimeType: songCoverFile.type || "image/webp",
        audioMimeType: audioFile.type || "audio/mpeg",
      })

      setSuccess("Song uploaded successfully.")
      form.reset()
      setSongCoverFile(null)
      setAudioFile(null)
    } catch (e: any) {
      setError(e?.message ?? "Failed to upload song. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Song Name</FormLabel>
              <Input {...field} className="bg-neutral-800 border-neutral-700 text-white" />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Kept visible but ignored in submit */}
        <FormField
          control={form.control}
          name="lyrics"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Lyrics</FormLabel>
              <Textarea
                {...field}
                className="bg-neutral-800 border-neutral-700 text-white h-28 overflow-y-auto resize-none"
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FileUpload
          label="Song Cover"
          accept="image/*"
          icon={<Upload className="w-8 h-8 text-gray-400 mx-auto" />}
          file={songCoverFile}
          onFileSelect={setSongCoverFile}
        />

        <FileUpload
          label="Audio File"
          accept="audio/*,.mp3,.wav,.flac"
          icon={<Music className="w-8 h-8 text-gray-400 mx-auto" />}
          file={audioFile}
          onFileSelect={setAudioFile}
        />

        {error && (
          <p className="text-red-500 text-sm" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-500 text-sm" role="status">
            {success}
          </p>
        )}

        <Button
          type="submit"
          className="w-full bg-neutral-700 hover:bg-neutral-500 text-white disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? "Uploading..." : "Upload Song"}
        </Button>
      </form>
    </Form>
  )
}