import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Dropzone, DropzoneContent } from "@/components/ui/shadcn-io/dropzone"
import { Edit2 } from "lucide-react"
import {useAction, useMutation} from "convex/react";
import {api} from "../../../convex/_generated/api";

const artistFormSchema = z.object({
  name: z.string().min(1, "Artist name is required"),
  description: z.string().min(1, "Description is required"),
  profile_pic_url: z.string().trim().optional().or(z.literal("")),
})

export type ArtistFormValues = z.infer<typeof artistFormSchema>

interface ArtistFormProps {
  defaultValues: ArtistFormValues
}

export default function ArtistForm({ defaultValues }: ArtistFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | undefined>()

  const uploadProfilePic = useAction(api.artists.uploadArtistProfilePic);
  const updateProfilePic = useMutation(api.artists.updateArtistProfilePic);
  const updateArtist = useMutation(api.artists.updateArtist);

  const form = useForm<ArtistFormValues>({
    resolver: zodResolver(artistFormSchema),
    defaultValues,
  })


  useEffect(() => {
    const url = form.getValues("profile_pic_url") || defaultValues.profile_pic_url
    if (!isEditing || file || !url) return;

    (async () => {
      try {
        const res = await fetch(url, { mode: "cors" })
        const blob = await res.blob()
        const ext = blob.type.split("/")[1] || "jpg"
        const f = new File([blob], `current-avatar.${ext}`, { type: blob.type })
        setFile(f)
        setFilePreview(URL.createObjectURL(blob))
      } catch {
        // fallback: just show the remote URL directly
        setFilePreview(url)
      }
    })()

    return () => {
      if (filePreview?.startsWith("blob:")) URL.revokeObjectURL(filePreview)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing])

  // Handle dropping a new file
  const handleDrop = (files: File[]) => {
    if (files.length) {
      const f = files[0]
      setFile(f)
      const reader = new FileReader()
      reader.onload = (e) => {
        if (typeof e.target?.result === "string") setFilePreview(e.target.result)
      }
      reader.readAsDataURL(f)
    }
  }

  const submitHandler = async (values: ArtistFormValues) => {
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const { profilePicUrl } = await uploadProfilePic({image: arrayBuffer});
      await updateProfilePic({profilePicUrl});
    }

    await updateArtist({name: values.name, description: values.description})
    setIsEditing(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitHandler)} className="space-y-6">
        {/* Edit toggle button */}
        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing((v) => !v)}
            className="text-gray-400 hover:text-white hover:bg-neutral-700"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Profile picture */}
        <div className="relative w-32 h-32 mx-auto">
          {isEditing ? (
            <Dropzone
              accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
              maxFiles={1}
              onDrop={handleDrop}
              onError={console.error}
              src={file ? [file] : undefined}
              className="!p-0 !border-0 !bg-transparent rounded-full overflow-hidden cursor-pointer"
            >
              <DropzoneContent>
                <img
                  src={
                    filePreview ||
                    form.getValues("profile_pic_url") ||
                    defaultValues.profile_pic_url ||
                    "/placeholder.svg"
                  }
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
              </DropzoneContent>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                <Edit2 className="w-6 h-6 text-white" />
              </div>
            </Dropzone>
          ) : (
            <img
              src={form.getValues("profile_pic_url") || defaultValues.profile_pic_url || "/placeholder.svg"}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover"
            />
          )}
        </div>

        {/* Hidden field for profile_pic_url */}
        <FormField
          control={form.control}
          name="profile_pic_url"
          render={({ field }) => <input type="hidden" {...field} />}
        />

        {/* Artist name */}
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

        {/* Description */}
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
