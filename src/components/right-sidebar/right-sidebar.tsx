import {usePlayerStore} from "@/stores/player-store.ts";
import {Play, Pause, MoreHorizontal, CirclePlus, X} from "lucide-react";
import type {Id} from "../../../convex/_generated/dataModel";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {useMutation, useQuery} from "convex/react";
import {api} from "../../../convex/_generated/api";
import {useState} from "react";

export default function RightSidebar() {
	const isOpen = usePlayerStore(state => state.isRightSidebarOpen);
	const activeTab = usePlayerStore(state => state.rightSidebarTab);
	const priorityQueue = usePlayerStore(state => state.priorityQueue);
	const playlistQueue = usePlayerStore(state => state.playlistQueue);
	const currentTrack = usePlayerStore(state => state.window.current);
	const isPlaying = usePlayerStore(state => state.isPlaying);
	const context = usePlayerStore(state => state.context);

	const playTrack = usePlayerStore(state => state.playTrack);
	const playTrackFromQueue = usePlayerStore(state => state.playTrackFromQueue);
	const pause = usePlayerStore(state => state.pause);
	const resume = usePlayerStore(state => state.resume);

	const playlists = useQuery(api.playlists.getAllByUser);
	const currentPlaylist = useQuery(
			api.playlists.get,
			context.type === "playlist" && context.id ? {id: context.id} : "skip"
	);
	const addTrack = useMutation(api.playlists.addTrack);
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);


	const track = currentTrack && ("track" in currentTrack ? currentTrack.track : currentTrack);
	const artist = track?.artist;

	const relatedTracks = useQuery(
			api.tracks.byArtist,
			track?.artistId ? {artistId: track.artistId} : "skip"
	);

	if (!isOpen) return null;

	const otherSongs = relatedTracks
			? relatedTracks.filter(t => t._id !== track?._id).slice(0, 3)
			: [];

	const priorityTracks = priorityQueue
	const playlistTracks = playlistQueue.map(item => ("track" in item ? item.track : item));

	const handlePlay = async (trackId: Id<"tracks">) => {
		const trackIsSelected = track?._id === trackId;

		if (isPlaying && trackIsSelected) {
			pause();
		} else if (trackIsSelected) {
			resume();
		} else {
			await playTrack(trackId);
		}
	};

	return (
			<div className="w-80 bg-background rounded-lg flex flex-col overflow-hidden">
				<div className="flex items-center justify-between p-4 ">
					<h2 className="text-lg font-semibold">
						{activeTab === "CurrentTrack" && "Current Track"}
						{activeTab === "Queue" && "Queue"}
						{activeTab === "Lyrics" && "Lyrics"}
					</h2>
					<button
							onClick={() => usePlayerStore.setState({isRightSidebarOpen: false})}
							className="text-muted-foreground hover:text-foreground transition-colors"
					>
						<X size={20}/>
					</button>
				</div>

				{activeTab === "CurrentTrack" && (
						<div
								className="flex-1 overflow-y-auto scrollbar scrollbar-track-transparent scrollbar-thumb-neutral-700 p-4">
							{track && artist ? (
									<div className="flex flex-col gap-4">
										<img
												src={track.coverUrl}
												alt={track.title}
												className="w-full aspect-square rounded-lg object-cover"
										/>
										<div>
											<h2 className="text-2xl font-bold mb-1">{track.title}</h2>
											<p className="text-sm text-muted-foreground">{artist.name}</p>
										</div>
										<div>
											<div className="bg-muted/30 rounded-lg p-4 cursor-pointer">
												<h3 className="text-sm font-semibold mb-3">About the artist</h3>
												<div className="flex items-center gap-3 mb-3">
													{artist.profilePicUrl && (
															<img
																	src={artist.profilePicUrl}
																	alt={artist.name}
																	className="size-16 rounded-full object-cover"
															/>
													)}
													<div className="flex-1">
														<p className="text-base font-semibold">{artist.name}</p>
														<p className="text-xs text-muted-foreground">7 listeners</p>
													</div>
												</div>
												{artist.description && (
														<p className="px-2 text-xs text-muted-foreground mt-2">
															{artist.description}
														</p>
												)}
											</div>
										</div>
									</div>
							) : (
									<div className="flex items-center justify-center h-full">
										<p className="text-muted-foreground">No track selected</p>
									</div>
							)}

							{otherSongs.length > 0 && (
									<div className="mt-6">
										<div className="bg-muted/30 rounded-lg p-4">
											<h3 className="text-sm font-semibold mb-3">Related Songs</h3>
											<div className="flex flex-col gap-1">
												{otherSongs.map((relatedTrack) => (
														<div
																key={relatedTrack._id}
																className="flex items-center gap-3 px-2 py-2 hover:bg-muted/50 rounded-md group transition-colors -mx-2"
														>
															<div className="relative flex-shrink-0 cursor-pointer"
																	 onClick={() => playTrack(relatedTrack._id)}>
																<img src={relatedTrack.coverUrl} alt={relatedTrack.title}
																		 className="size-12 rounded group-hover:brightness-75 transition-all"/>
																<button
																		className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:block"
																>
																	<Play size={18} fill="white"/>
																</button>
															</div>
															<div className="min-w-0 flex-1">
																<div className="text-sm font-medium truncate">
																	{relatedTrack.title}
																</div>
																<div className="text-xs text-muted-foreground truncate">{artist?.name}</div>
															</div>
															<div className="flex items-center justify-center">
																{playlists && (
																		<DropdownMenu open={openDropdown === `related-${relatedTrack._id}`}
																									onOpenChange={(isOpen) => setOpenDropdown(isOpen ? `related-${relatedTrack._id}` : null)}>
																			<DropdownMenuTrigger asChild>
																				<MoreHorizontal
																						size={20}
																						className="text-muted-foreground hover:text-foreground cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
																				/>
																			</DropdownMenuTrigger>

																			<DropdownMenuContent className="w-40 font-semibold">
																				<DropdownMenuSub>
																					<DropdownMenuSubTrigger>
																						<div className="flex items-center gap-2">
																							<CirclePlus size={15} className="text-neutral-400"/>
																							<span className="text-neutral-300">Add to Playlist</span>
																						</div>
																					</DropdownMenuSubTrigger>
																					<DropdownMenuSubContent className="p-0">
																						<Command>
																							<CommandInput
																									placeholder="Filter playlists..."
																									autoFocus={true}
																									className="h-9"
																							/>
																							<CommandList>
																								<CommandEmpty>No Playlist found</CommandEmpty>
																								<CommandGroup>
																									{playlists.map((playlist) => (
																											<CommandItem
																													key={playlist._id}
																													value={playlist.name}
																													onSelect={async (currentValue) => {
																														const selectedPlaylist = playlists.find(p => p.name === currentValue)
																														if (selectedPlaylist) {
																															setOpenDropdown(null)
																															await addTrack({
																																playlistId: selectedPlaylist._id,
																																trackId: relatedTrack._id
																															})
																														}
																													}}
																											>
																												<div className="flex items-center gap-2">
																													<img src={playlist.playlistPicUrl} alt="" width={24}
																															 height={24}
																															 className="rounded"/>
																													<span>{playlist.name}</span>
																												</div>
																											</CommandItem>
																									))}
																								</CommandGroup>
																								<CommandEmpty>No Playlist found</CommandEmpty>
																							</CommandList>
																						</Command>
																					</DropdownMenuSubContent>
																				</DropdownMenuSub>
																			</DropdownMenuContent>
																		</DropdownMenu>
																)}
															</div>
														</div>
												))}
											</div>
										</div>
									</div>
							)}
						</div>
				)}

				{/* Queue Tab */}
				{activeTab === "Queue" && (
						<div className="flex-1 overflow-y-auto scrollbar scrollbar-track-transparent scrollbar-thumb-neutral-700">
							<div className="px-4">
								{currentTrack && track && (
										<div className="mb-5">
											<h3 className="text-sm font-semibold text-muted-foreground mb-2">Now Playing</h3>
											{(() => {
												const dropdownId = `current-${track._id}`;
												return (
														<div
																key={track._id}
																className="flex items-center gap-3 px-2 py-2 hover:bg-muted/50 rounded-md group transition-colors -mx-2"
														>
															<div className="relative flex-shrink-0 cursor-pointer"
																	 onClick={() => handlePlay(track._id)}>
																<img src={track.coverUrl} alt={track.title}
																		 className="size-10 rounded group-hover:brightness-75 transition-all"/>
																<button
																		className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:block"
																>
																	{isPlaying ? <Pause size={18} fill="white"/> :
																			<Play size={18} fill="white"/>}
																</button>
															</div>
															<div className="min-w-0 flex-1">
																<div
																		className="text-sm font-medium truncate text-green-500">
																	{track.title}
																</div>
																<div className="text-xs text-muted-foreground truncate">{artist?.name}</div>
															</div>
															<div className="flex items-center justify-center">
																{playlists && (
																		<DropdownMenu open={openDropdown === dropdownId}
																									onOpenChange={(isOpen) => setOpenDropdown(isOpen ? dropdownId : null)}>
																			<DropdownMenuTrigger asChild>
																				<MoreHorizontal
																						size={20}
																						className="text-muted-foreground hover:text-foreground cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
																				/>
																			</DropdownMenuTrigger>

																			<DropdownMenuContent className="w-40 font-semibold">
																				<DropdownMenuSub>
																					<DropdownMenuSubTrigger>
																						<div className="flex items-center gap-2">
																							<CirclePlus size={15} className="text-neutral-400"/>
																							<span className="text-neutral-300">Add to Playlist</span>
																						</div>
																					</DropdownMenuSubTrigger>
																					<DropdownMenuSubContent className="p-0">
																						<Command>
																							<CommandInput
																									placeholder="Filter playlists..."
																									autoFocus={true}
																									className="h-9"
																							/>
																							<CommandList>
																								<CommandEmpty>No Playlist found</CommandEmpty>
																								<CommandGroup>
																									{playlists.map((playlist) => (
																											<CommandItem
																													key={playlist._id}
																													value={playlist.name}
																													onSelect={async (currentValue) => {
																														const selectedPlaylist = playlists.find(p => p.name === currentValue)
																														if (selectedPlaylist) {
																															setOpenDropdown(null)
																															await addTrack({
																																playlistId: selectedPlaylist._id,
																																trackId: track._id
																															})
																														}
																													}}
																											>
																												<div className="flex items-center gap-2">
																													<img src={playlist.playlistPicUrl} alt="" width={24}
																															 height={24}
																															 className="rounded"/>
																													<span>{playlist.name}</span>
																												</div>
																											</CommandItem>
																									))}
																								</CommandGroup>
																							</CommandList>
																						</Command>
																					</DropdownMenuSubContent>
																				</DropdownMenuSub>
																			</DropdownMenuContent>
																		</DropdownMenu>
																)}
															</div>
														</div>
												);
											})()}
										</div>
								)}
								{priorityTracks.length > 0 && (
										<div>
											<h3 className="text-sm font-semibold text-muted-foreground mb-2">Next in queue</h3>
											{priorityTracks.map((queueTrack, index) => {
												const dropdownId = `queue-${index}-${queueTrack._id}`;
												return (
														<div
																key={`${index}-${queueTrack._id}`}
																className="flex items-center gap-3 px-2 py-2 hover:bg-muted/50 rounded-md group transition-colors -mx-2"
														>
															<div className="relative flex-shrink-0 cursor-pointer"
																	 onClick={() => playTrackFromQueue(queueTrack._id)}>
																<img src={queueTrack.coverUrl} alt={queueTrack.title}
																		 className="size-10 rounded group-hover:brightness-75 transition-all"/>
																<button
																		className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:block"
																>
																	<Play size={18} fill="white"/>
																</button>
															</div>
															<div className="min-w-0 flex-1">
																<div
																		className="text-sm font-medium truncate ">
																	{queueTrack.title}
																</div>
																<div className="text-xs text-muted-foreground truncate">{queueTrack.artist.name}</div>
															</div>
															<div className="flex items-center justify-center">
																{playlists && (
																		<DropdownMenu open={openDropdown === dropdownId}
																									onOpenChange={(isOpen) => setOpenDropdown(isOpen ? dropdownId : null)}>
																			<DropdownMenuTrigger asChild>
																				<MoreHorizontal
																						size={20}
																						className="text-muted-foreground hover:text-foreground cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
																				/>
																			</DropdownMenuTrigger>

																			<DropdownMenuContent className="w-40 font-semibold">
																				<DropdownMenuSub>
																					<DropdownMenuSubTrigger>
																						<div className="flex items-center gap-2">
																							<CirclePlus size={15} className="text-neutral-400"/>
																							<span className="text-neutral-300">Add to Playlist</span>
																						</div>
																					</DropdownMenuSubTrigger>
																					<DropdownMenuSubContent className="p-0">
																						<Command>
																							<CommandInput
																									placeholder="Filter Pla..."
																									autoFocus={true}
																									className="h-9"
																							/>
																							<CommandList>
																								<CommandEmpty>No Playlist found</CommandEmpty>
																								<CommandGroup>
																									{playlists.map((playlist) => (
																											<CommandItem
																													key={playlist._id}
																													value={playlist.name}
																													onSelect={async (currentValue) => {
																														const selectedPlaylist = playlists.find(p => p.name === currentValue)
																														if (selectedPlaylist) {
																															setOpenDropdown(null)
																															await addTrack({
																																playlistId: selectedPlaylist._id,
																																trackId: queueTrack._id
																															})
																														}
																													}}
																											>
																												<div className="flex items-center gap-2">
																													<img src={playlist.playlistPicUrl} alt="" width={24}
																															 height={24}
																															 className="rounded"/>
																													<span>{playlist.name}</span>
																												</div>
																											</CommandItem>
																									))}
																								</CommandGroup>
																							</CommandList>
																						</Command>
																					</DropdownMenuSubContent>
																				</DropdownMenuSub>
																			</DropdownMenuContent>
																		</DropdownMenu>
																)}
															</div>
														</div>
												);
											})}
										</div>
								)
								}
								{playlistTracks.length > 0 && (
										<div>
											<h3 className="text-sm font-semibold text-muted-foreground mb-2">
												{currentPlaylist ? `Next from: ${currentPlaylist.name}` : "Next from Playlist"}
											</h3>
											{playlistTracks.map((queueTrack, index) => {
												const dropdownId = `queue-${index}-${queueTrack._id}`;
												return (
														<div
																key={`${index}-${queueTrack._id}`}
																className="flex items-center gap-3 px-2 py-2 hover:bg-muted/50 rounded-md group transition-colors -mx-2"
														>
															<div className="relative flex-shrink-0 cursor-pointer"
																	 onClick={() => playTrackFromQueue(queueTrack._id)}>
																<img src={queueTrack.coverUrl} alt={queueTrack.title}
																		 className="size-10 rounded group-hover:brightness-75 transition-all"/>
																<button
																		className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:block"
																>
																	<Play size={18} fill="white"/>
																</button>
															</div>
															<div className="min-w-0 flex-1">
																<div
																		className="text-sm font-medium truncate ">
																	{queueTrack.title}
																</div>
																<div className="text-xs text-muted-foreground truncate">{queueTrack.artist.name}</div>
															</div>
															<div className="flex items-center justify-center">
																{playlists && (
																		<DropdownMenu open={openDropdown === dropdownId}
																									onOpenChange={(isOpen) => setOpenDropdown(isOpen ? dropdownId : null)}>
																			<DropdownMenuTrigger asChild>
																				<MoreHorizontal
																						size={20}
																						className="text-muted-foreground hover:text-foreground cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
																				/>
																			</DropdownMenuTrigger>

																			<DropdownMenuContent className="w-40 font-semibold">
																				<DropdownMenuSub>
																					<DropdownMenuSubTrigger>
																						<div className="flex items-center gap-2">
																							<CirclePlus size={15} className="text-neutral-400"/>
																							<span className="text-neutral-300">Add to Playlist</span>
																						</div>
																					</DropdownMenuSubTrigger>
																					<DropdownMenuSubContent className="p-0">
																						<Command>
																							<CommandInput
																									placeholder="Filter Pla..."
																									autoFocus={true}
																									className="h-9"
																							/>
																							<CommandList>
																								<CommandEmpty>No Playlist found</CommandEmpty>
																								<CommandGroup>
																									{playlists.map((playlist) => (
																											<CommandItem
																													key={playlist._id}
																													value={playlist.name}
																													onSelect={async (currentValue) => {
																														const selectedPlaylist = playlists.find(p => p.name === currentValue)
																														if (selectedPlaylist) {
																															setOpenDropdown(null)
																															await addTrack({
																																playlistId: selectedPlaylist._id,
																																trackId: queueTrack._id
																															})
																														}
																													}}
																											>
																												<div className="flex items-center gap-2">
																													<img src={playlist.playlistPicUrl} alt="" width={24}
																															 height={24}
																															 className="rounded"/>
																													<span>{playlist.name}</span>
																												</div>
																											</CommandItem>
																									))}
																								</CommandGroup>
																							</CommandList>
																						</Command>
																					</DropdownMenuSubContent>
																				</DropdownMenuSub>
																			</DropdownMenuContent>
																		</DropdownMenu>
																)}
															</div>
														</div>
												);
											})}
										</div>
								)
								}
							</div>
						</div>
				)}

				{activeTab === "Lyrics" && (
						<div
								className="flex-1 overflow-y-auto scrollbar scrollbar-track-transparent scrollbar-thumb-neutral-700 p-4 pt-0">
							{track ? (
									<>
										{track.lyrics && track.lyrics.trim() !== "" ? (
												<div className="mt-4">
													<pre className="whitespace-pre-wrap text-sm leading-7 font-sans">
														{track.lyrics}
													</pre>
												</div>
										) : (
												<div className="flex items-center justify-center h-64">
													<div className="text-center">
														<svg
																viewBox="0 0 16 16"
																className="size-12 fill-neutral-600 mx-auto mb-4"
														>
															<path
																	d="M13.426 2.574a2.831 2.831 0 0 0-4.797 1.55l3.247 3.247a2.831 2.831 0 0 0 1.55-4.797zM10.5 8.118l-2.619-2.62A63303.13 63303.13 0 0 0 4.74 9.075L2.065 12.12a1.287 1.287 0 0 0 1.816 1.816l3.06-2.688 3.56-3.129zM7.12 4.094a4.331 4.331 0 1 1 4.786 4.786l-3.974 3.493-3.06 2.689a2.787 2.787 0 0 1-3.933-3.933l2.676-3.045 3.505-3.99z"></path>
														</svg>
														<p className="text-muted-foreground text-sm">No Lyrics found</p>
													</div>
												</div>
										)}
									</>
							) : (
									<div className="flex items-center justify-center h-full">
										<p className="text-muted-foreground">No Track selected</p>
									</div>
							)}
						</div>
				)}
			</div>
	);
}
