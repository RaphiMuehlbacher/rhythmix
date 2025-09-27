import {useMutation} from "convex/react";
import {api} from "../../../convex/_generated/api";
import {Edit2, Plus} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from "@/components/ui/dialog.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "../ui/button";
import {Dropzone, DropzoneContent, DropzoneEmptyState} from '@/components/ui/shadcn-io/dropzone';
import {useState} from "react";
import defaultPlaylistImage from "@/assets/default-playlist-image.webp";


const formSchema = z.object({
	name: z.string().min(1, "Enter a name"),
})

export default function CreatePlaylistButton() {
	const [file, setFile] = useState<File | undefined>();
	const [filePreview, setFilePreview] = useState<string | undefined>();
	const [open, setOpen] = useState(false);

	const createPlaylist = useMutation(api.playlists.create);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema), defaultValues: {
			name: "",
		}
	})

	const handleDrop = (files: File[]) => {
		const file = files[0];
		setFile(file);

		const reader = new FileReader();
		reader.onload = (e) => {
			if (typeof e.target?.result === 'string') {
				setFilePreview(e.target?.result);
			}
		};
		reader.readAsDataURL(file);
	};

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		let playlistPicUrl = null;
		if (!file) {
			playlistPicUrl = "https://rhythmix.redstphillip.uk/rhythmix/covers/ks75ztf2v9ypreryehdja559mx7r4pt3.jpeg";
		} else {
			const formData = new FormData();
			formData.append("file", file);

			const res = await fetch(`${import.meta.env.VITE_API_URL}/upload-playlist-cover`, {
				method: "POST",
				body: formData,
			});

			if (!res.ok) throw new Error("Upload failed");
			const data = await res.json();
			playlistPicUrl = data.filePath;
		}

		await createPlaylist({name: values.name, playlistPicUrl});
		form.reset();
		setFile(undefined);
		setOpen(false);
	}


	return (
			<div className="size-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90">
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger>
						<Plus className="text-muted-foreground hover:text-foreground hover:opacity-90"/>
					</DialogTrigger>
					<DialogContent className="w-80">
						<DialogHeader className="flex items-center">
							<DialogTitle>Create a Playlist</DialogTitle>
						</DialogHeader>
						<Form {...form}>
							<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="flex flex-col items-center gap-4"
							>
								<Dropzone
										accept={{"image/*": [".png", ".jpg", ".jpeg", ".webp"]}}
										maxFiles={1}
										onDrop={handleDrop}
										onError={console.error}
										src={file ? [file] : undefined}
										className="group relative size-40 overflow-hidden rounded-md p-0"
								>
									<DropzoneContent className="absolute inset-0">
										<img
												src={filePreview}
												alt="Profile"
												className="absolute inset-0 w-full h-full object-cover"
										/>
									</DropzoneContent>

									<DropzoneEmptyState className="absolute inset-0">
										<img
												src={defaultPlaylistImage}
												alt="Empty"
												// loading="eager"
												className="absolute inset-0 w-full h-full object-cover"
										/>
									</DropzoneEmptyState>

									<div
											className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
										<Edit2 className="w-6 h-6 text-white"/>
									</div>
								</Dropzone>

								<FormField
										control={form.control}
										name="name"
										render={({field}) => (
												<FormItem className="w-full">
													<FormLabel htmlFor="name">Name</FormLabel>
													<FormControl>
														<Input className="border-neutral-700" {...field} />
													</FormControl>
													<FormMessage className="text-xs text-red-500"/>
												</FormItem>
										)}
								/>
								<Button type="submit" variant="secondary" className="w-full">
									Create Playlist
								</Button>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
			</div>
	);
}
