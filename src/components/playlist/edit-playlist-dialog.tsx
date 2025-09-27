import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Dropzone, DropzoneContent, DropzoneEmptyState} from "@/components/ui/shadcn-io/dropzone";
import {useState, useEffect} from "react";
import {Edit2} from "lucide-react";
import {useMutation} from "convex/react";
import {api} from "../../../convex/_generated/api";
import type {Id} from "../../../convex/_generated/dataModel";
import defaultPlaylistImage from "@/assets/default-playlist-image.webp";

interface EditPlaylistDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	playlistId: Id<"playlists">;
	currentName: string;
	currentPicUrl: string;
}

const formSchema = z.object({
	name: z.string().min(1, "Enter a name"),
});

type FormSchema = z.infer<typeof formSchema>;

export default function EditPlaylistDialog({
																						 open,
																						 onOpenChange,
																						 playlistId,
																						 currentName,
																						 currentPicUrl
																					 }: EditPlaylistDialogProps) {
	const [file, setFile] = useState<File | undefined>();
	const [filePreview, setFilePreview] = useState<string>(currentPicUrl);

	const updatePlaylist = useMutation(api.playlists.update);

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: currentName,
		}
	});

	useEffect(() => {
		form.reset({name: currentName});
		setFilePreview(currentPicUrl);
	}, [currentName, currentPicUrl]);

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

	const onSubmit = async (values: FormSchema) => {
		let playlistPicUrl = currentPicUrl;

		if (file) {
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

		await updatePlaylist({
			playlistId,
			newName: values.name,
			newPlaylistPicUrl: playlistPicUrl,
		});

		setFile(undefined);
		onOpenChange(false);
	};

	return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="w-80">
					<DialogHeader className="flex items-center">
						<DialogTitle>Edit Playlist</DialogTitle>
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
									className="group relative size-40 overflow-hidden rounded-md p-0"
							>
								<DropzoneContent className="absolute inset-0">
									{filePreview && (
											<img
													src={filePreview}
													alt="Cover"
													className="absolute inset-0 w-full h-full object-cover"
											/>
									)}
								</DropzoneContent>

								<DropzoneEmptyState className="absolute inset-0">
									<img
											src={currentPicUrl || defaultPlaylistImage}
											alt="Empty"
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
								Save Changes
							</Button>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
	);
}
