"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const artistFormSchema = z.object({
  name: z.string().min(1, "Artist name is required"),
  description: z.string().min(1, "Description is required"),
})

export type ArtistFormValues = z.infer<typeof artistFormSchema>

interface ArtistFormProps {
  defaultValues: ArtistFormValues
}

export default function ArtistForm({ defaultValues }: ArtistFormProps) {
  const form = useForm<ArtistFormValues>({
    resolver: zodResolver(artistFormSchema),
    defaultValues,
  })

  const onSubmit = (values: ArtistFormValues) => {
    console.log("Updated artist:", values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Artist Name</FormLabel>
              <Input {...field} className="bg-gray-700 border-gray-600 text-white" />
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
              <Textarea {...field} className="bg-gray-700 border-gray-600 text-white" />
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit" className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 rounded">
          Save Changes
        </button>
      </form>
    </Form>
  )
}
