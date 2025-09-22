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
import { useDropzone } from "react-dropzone"

import { useAction } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"

const songFormSchema = z.object({
  title: z.string().min(1, "Song title is required"),
  lyrics: z.string().min(1, "Lyrics are required"),
})


type SongFormValues = z.infer<typeof songFormSchema>

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

  // Dropzone for cover image (.png, .jpg, .jpeg, .webp)
  const coverDropzone = useDropzone({
    accept: { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"], "image/webp": [".webp"] },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) setSongCoverFile(acceptedFiles[0])
    },
  })

  // Dropzone for audio file (.mp3, .wav, .flac, .m4a)
  const audioDropzone = useDropzone({
    accept: {
      "audio/mpeg": [".mp3"],
      "audio/wav": [".wav"],
      "audio/flac": [".flac"],
      "audio/mp4": [".m4a"],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) setAudioFile(acceptedFiles[0])
    },
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

      const [imageArrayBuffer, audioArrayBuffer] = await Promise.all([
        songCoverFile.arrayBuffer(),
        audioFile.arrayBuffer(),
      ])

      await uploadSong({
        title: values.title,
        lyrics: values.lyrics || "",
        artist_id: ARTIST_ID,
        image: imageArrayBuffer,
        audio: audioArrayBuffer,
        imageFilename: songCoverFile.name,
        audioFilename: audioFile.name,
        imageMimeType: songCoverFile.type,
        audioMimeType: audioFile.type,
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
        {/* Song title */}
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

        {/* Lyrics */}
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

        {/* Dropzone for cover image */}
        <div
          {...coverDropzone.getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
            coverDropzone.isDragActive ? "border-blue-400 bg-neutral-700" : "border-neutral-600 bg-neutral-800"
          }`}
        >
          <input {...coverDropzone.getInputProps()} />
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-400">
            {songCoverFile ? `Selected: ${songCoverFile.name}` : "Drag & drop a cover (.png, .jpg, .jpeg, .webp)"}
          </p>
        </div>

        {/* Dropzone for audio file */}
        <div
          {...audioDropzone.getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
            audioDropzone.isDragActive ? "border-green-400 bg-neutral-700" : "border-neutral-600 bg-neutral-800"
          }`}
        >
          <input {...audioDropzone.getInputProps()} />
          <Music className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-400">
            {audioFile ? `Selected: ${audioFile.name}` : "Drag & drop an audio file (.mp3, .wav, .flac, .m4a)"}
          </p>
        </div>

        {/* Messages */}
        {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
        {success && <p className="text-green-500 text-sm" role="status">{success}</p>}

        {/* Submit */}
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
