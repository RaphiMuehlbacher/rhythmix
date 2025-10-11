import type {TrackFull} from "../../convex/tracks"
import {Play, Pause, MoreHorizontal, CirclePlus} from "lucide-react"
import {usePlayerStore} from "@/stores/player-store"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command"
import {useMutation, useQuery} from "convex/react"
import {api} from "../../convex/_generated/api"
import {useState} from "react"
import type {Id} from "../../convex/_generated/dataModel";

interface SongListProps {
	songs: TrackFull[]
}

export default function SongList({songs}: SongListProps) {
	const currentTrack = usePlayerStore(state => state.window.current)
	const isPlaying = usePlayerStore(state => state.isPlaying)
	const playTrack = usePlayerStore(state => state.playTrack)
	const pause = usePlayerStore(state => state.pause)
	const resume = usePlayerStore(state => state.resume)

	const playlists = useQuery(api.playlists.getAllByUser)
	const addTrack = useMutation(api.playlists.addTrack)
	const [openDropdown, setOpenDropdown] = useState<string | null>(null)

	const handlePlay = async (trackId: Id<"tracks">) => {
		const trackIsSelected = currentTrack?._id === trackId

		if (isPlaying && trackIsSelected) {
			pause()
		} else if (trackIsSelected) {
			resume()
		} else {
			await playTrack(trackId)
		}
	}

	if (!playlists) return null

	return (
			<div className="space-y-1">
				{songs.map((song, index) => {
					const trackIsSelected = currentTrack?._id === song._id

					return (
							<div
									key={song._id}
									className="grid grid-cols-[16px_1fr_40px] gap-4 px-2 py-2 hover:bg-muted/50 rounded-md group transition-colors"
							>
								<div className="flex items-center justify-center text-muted-foreground">
									<button
											className="cursor-pointer"
											onClick={() => handlePlay(song._id)}
									>
                <span
										className={`group-hover:hidden text-sm font-semibold ${trackIsSelected ? 'text-green-500' : ''}`}
								>
                  {index + 1}
                </span>
										<span className="hidden group-hover:block text-foreground">
                  {isPlaying && trackIsSelected ? <Pause size={18}/> : <Play size={18}/>}
                </span>
									</button>
								</div>

								<div className="flex items-center min-w-0 gap-3">
									<img src={song.coverUrl} alt="" className="size-11 rounded"/>
									<div className="min-w-0">
										<div className={`font-medium truncate ${trackIsSelected ? 'text-green-500' : ''}`}>
											{song.title}
										</div>
										<div className="text-sm text-muted-foreground truncate">{song.artist.name}</div>
									</div>
								</div>

								<div className="flex items-center justify-center">
									<DropdownMenu open={openDropdown === song._id}
																onOpenChange={(isOpen) => setOpenDropdown(isOpen ? song._id : null)}>
										<DropdownMenuTrigger asChild>
											<MoreHorizontal
													size={22}
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
															<CommandEmpty>No playlist found.</CommandEmpty>
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
																							trackId: song._id
																						})
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
												</DropdownMenuSubContent>
											</DropdownMenuSub>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
					)
				})}
			</div>
	)
}
