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

const songFormSchema = z.object({
  title: z.string().min(1, "Song title is required"),
  lyrics: z.string().optional(),
})

type SongFormValues = z.infer<typeof songFormSchema>

export default function SongForm() {
  const [songCoverFile, setSongCoverFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)

  const form = useForm<SongFormValues>({
    resolver: zodResolver(songFormSchema),
    defaultValues: { title: "", lyrics: "" },
  })

  const onSubmit = (values: SongFormValues) => {
    console.log("Song uploaded:", { ...values, songCoverFile, audioFile })
    form.reset()
    setSongCoverFile(null)
    setAudioFile(null)
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
              <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lyrics"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Lyrics</FormLabel>
              <Textarea {...field} className="bg-gray-700 border-gray-600 text-white min-h-[120px]" />
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

        <Button type="submit" className="w-full bg-gray-600 hover:bg-gray-500 text-white">
          Upload Song
        </Button>
      </form>
    </Form>
  )
}
