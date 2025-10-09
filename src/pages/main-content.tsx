import SongCard from "@/components/song-card.tsx";
import {useMutation, useQuery} from "convex/react";
import {api} from "../../convex/_generated/api";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger
} from "@/components/ui/context-menu";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {CirclePlus} from "lucide-react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command.tsx";
import {useState} from "react";

export default function MainContent() {
	const tracks = useQuery(api.tracks.all);
	const playlists = useQuery(api.playlists.getAllByUser);
	const addTrack = useMutation(api.playlists.addTrack);

	const [open, setOpen] = useState(false)

	if (!tracks || !playlists) {
		return <h1>Loading...</h1>;
	}

	return (
			<div className="bg-background rounded-lg space-y-8 p-4 h-full overflow-hidden">
				<div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
					<div className="flex gap-4 pb-2 w-max">
						{tracks.slice(0, 10).map((track) => (
								<Popover open={open} onOpenChange={setOpen} key={track._id}>
									<ContextMenu>
										<ContextMenuTrigger className="flex-shrink-0 w-[200px]">
											<SongCard
													track={track}
													artist={track.artist}
											/>
										</ContextMenuTrigger>

										<ContextMenuContent className="w-52">
											<ContextMenuItem>
												<PopoverTrigger asChild>
													<div className="flex items-center gap-2 ">
														<CirclePlus size={15} className="text-neutral-400"/>
														<span className="text-neutral-300">Add to Playlist</span>
													</div>
												</PopoverTrigger>
											</ContextMenuItem>
										</ContextMenuContent>
									</ContextMenu>
									<PopoverContent>
										<Command>
											<CommandInput
													placeholder="Filter playlists..."
													autoFocus={true}
													className="h-9"
											/>
											<CommandList>
												<CommandEmpty>No playlist found.</CommandEmpty>
												<CommandGroup>
													{playlists
															.map((playlist) => (
																	<CommandItem
																			key={playlist._id}
																			value={playlist.name}
																			onSelect={async (currentValue) => {
																				const selectedPlaylist = playlists.find(p => p.name === currentValue);
																				if (selectedPlaylist) {
																					setOpen(false);
																					await addTrack({
																						playlistId: selectedPlaylist._id,
																						trackId: track._id
																					});
																				}
																			}}
																	>
																		<div className="flex items-center gap-2">
																			<img src={playlist.playlistPicUrl} alt="" width={24} height={24}
																					 className="rounded"/>
																			<span>{playlist.name}</span>

																		</div>
																	</CommandItem>
															))}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>

						))}
					</div>
				</div>
			</div>
	);
}
