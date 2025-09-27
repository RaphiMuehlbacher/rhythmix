import {useParams} from "react-router";
import {useMutation, useQuery} from "convex/react";
import {api} from "../../convex/_generated/api";
import type {Id} from "../../convex/_generated/dataModel";
import {Clock, MoreHorizontal, Pause, Pencil, Play, Shuffle, Trash} from "lucide-react";
import {format, formatDistanceToNow, differenceInMonths, intervalToDuration} from 'date-fns';
import {usePlayerStore} from "@/stores/player-store.ts";
import {
	DropdownMenu,
	DropdownMenuContent, DropdownMenuItem,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog, AlertDialogAction, AlertDialogCancel,
	AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from "@/components/ui/alert-dialog.tsx";
import EditPlaylistDialog from "@/components/playlist/edit-playlist-dialog";
import {useState} from "react";
import type {PlaylistTrackFull} from "../../convex/playlists.ts";

export default function Playlist() {
	const {playlistId} = useParams();
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	const playPlaylist = usePlayerStore(state => state.playPlaylist);
	const pause = usePlayerStore(state => state.pause);
	const resume = usePlayerStore(state => state.resume);

	const currentTrack = usePlayerStore(state => state.window.current);
	const context = usePlayerStore(state => state.context);
	const isPlaying = usePlayerStore(state => state.isPlaying);

	const deletePlaylist = useMutation(api.playlists.deletePlaylist);

	const user = useQuery(api.users.currentUser);
	const playlist = useQuery(api.playlists.get, {id: playlistId as Id<"playlists">});
	const playlistTracks = useQuery(api.playlists.getAllPlaylistTracks, playlist ? {playlistId: playlist._id} : "skip");


	if (!user || !playlist || !playlistTracks) return <h1>Loading...</h1>

	const correctPlaylist = context.type === "playlist" && playlist._id === context.id;
	const playlistDuration = playlistTracks.reduce((acc, t) => acc + (t.track.duration), 0);

	const formatTrackDuration = (ms: number) => {
		const totalSeconds = Math.floor(ms / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		const paddedSeconds = seconds.toString().padStart(2, '0');

		if (hours > 0) {
			const paddedMinutesForHour = minutes.toString().padStart(2, '0');
			return `${hours}:${paddedMinutesForHour}:${paddedSeconds}`;
		} else {
			return `${minutes}:${paddedSeconds}`;
		}
	}

	const formatUploadTime = (uploadTime: number) => {
		const now = new Date();
		const date = new Date(uploadTime);

		if (differenceInMonths(now, date) >= 1) {
			return format(date, 'MMM dd, yyyy');
		}


		return formatDistanceToNow(date, {addSuffix: true});
	}

	const formatPlaylistDuration = (ms: number) => {
		const duration = intervalToDuration({
			start: 0,
			end: ms
		});

		const parts = [];

		if (duration.hours) parts.push(`${duration.hours}hr`);
		if (duration.minutes) parts.push(`${duration.minutes}min`);
		if (duration.seconds || (!duration.hours && !duration.minutes))
			parts.push(`${duration.seconds}s`);

		return parts.join(' ');
	}

	const handlePlaylistClick = async (order?: number) => {
		if (isPlaying && correctPlaylist) {
			pause();
		} else if (correctPlaylist) {
			resume();
		} else {
			await playPlaylist(playlist._id, order);
		}
	}


	const playlistTrackIsPlaying = (playlistTrack: PlaylistTrackFull) => {
		return isPlaying && currentTrack?._id === playlistTrack.track._id && playlistTrack.playlistId === playlist._id;
	}

	return (
			<>
				<div className="bg-background rounded-lg pt-16 px-7">
					<div className="flex items-end gap-6">
						<img src={playlist.playlistPicUrl} alt="" className="size-60 rounded-md"/>
						<div className="flex-1">
							<p className="text-6xl font-bold text-balance mb-6">{playlist.name}</p>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<span className="font-semibold text-foreground">{user.name}</span>
								{playlistTracks.length > 0 &&
									<div>
										<span>•</span>
										<span>{playlistTracks.length} songs</span>
										<span>•</span>
										<span>{formatPlaylistDuration(playlistDuration)}</span>
									</div>
								}
							</div>
						</div>
					</div>

					<div className="pt-7">
						<div className="flex items-center gap-6">
							<button
									onClick={() => handlePlaylistClick()}
									className=
											"flex items-center justify-center rounded-full bg-green-500 size-12 p-2 transition-transform transform hover:scale-[1.03] duration-75"
							>
								{correctPlaylist && isPlaying ? (
										<svg
												viewBox="0 0 16 16"
												className="size-6 transition-transform transform hover:scale-[1.03] duration-75"
										>
											<path
													d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
										</svg>
								) : (
										<svg
												viewBox="0 0 24 24"
												className="size-6 transition-transform transform hover:scale-[1.03] duration-75"
										>
											<path
													d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path>
										</svg>

								)}
							</button>

							<Shuffle className="text-muted-foreground hover:text-foreground"/>
							<AlertDialog>
								<DropdownMenu>
									<DropdownMenuTrigger>
										<MoreHorizontal className="text-muted-foreground hover:text-foreground"/>
									</DropdownMenuTrigger>

									<DropdownMenuContent className="w-40 font-semibold">
										<DropdownMenuItem asChild>
											<AlertDialogTrigger className="w-full">
												<div className="flex items-center gap-2 ">
													<Trash size={15} className="text-neutral-400"/>
													<span className="text-neutral-300">Delete</span>
												</div>
											</AlertDialogTrigger>
										</DropdownMenuItem>

										<DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
											<div className="flex items-center gap-2">
												<Pencil size={15} className="text-neutral-400"/>
												<span className="text-neutral-300">Edit details</span>
											</div>
										</DropdownMenuItem>

									</DropdownMenuContent>

									<AlertDialogContent className="w-96">
										<AlertDialogHeader>
											<AlertDialogTitle>Delete this playlist?</AlertDialogTitle>
											<AlertDialogDescription>
												This will delete <span className="font-semibold">{playlist.name}</span>
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>
											<AlertDialogAction onClick={() => deletePlaylist({playlistId: playlist._id})}
																				 className="bg-secondary text-secondary-foreground hover:bg-secondary/80">Delete</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</DropdownMenu>
							</AlertDialog>
						</div>
					</div>
					<div className="pb-6">
						<div
								className="grid grid-cols-[16px_1fr_1fr_40px_40px] gap-4 px-4 py-3 text-sm font-semibold text-muted-foreground border-b border-border/50">
							<div className="text-center">#</div>
							<div>Title</div>
							<div className="hidden md:block">Date added</div>
							<div className="flex justify-center">
								<Clock className="w-4 h-4"/>
							</div>
						</div>
						<div className="mt-2">
							{playlistTracks.map(playlistTrack => (
									<div key={playlistTrack._id}
											 className="grid grid-cols-[16px_1fr_1fr_40px_40px] gap-4 px-4 py-2 hover:bg-muted/30 rounded-md group transition-colors">

										<div className="flex items-center justify-center text-muted-foreground">
											<button
													className="cursor-pointer"
													onClick={() => handlePlaylistClick(playlistTrack.order)}
											>
												<span
														className={`group-hover:hidden text-sm font-semibold ${currentTrack?._id === playlistTrack.track._id && playlistTrack.playlistId === playlist._id ? 'text-green-500' : ''}`}>{playlistTrack.order + 1}</span>
												<span className="hidden group-hover:block text-foreground">
												{playlistTrackIsPlaying(playlistTrack) ?
														<Pause size={18}/> : <Play size={18}/>}
													</span>
											</button>
										</div>

										<div className="flex items-center min-w-0 gap-3">
											<img src={playlistTrack.track.coverUrl} alt="" className="size-11 rounded"/>
											<div className="min-w-0">
												<div
														className={`font-medium truncate ${currentTrack?._id === playlistTrack.track._id && playlistTrack.playlistId === playlist._id ? 'text-green-500' : ''}`}
												>
													{playlistTrack.track.title}
												</div>
												<div className="text-sm text-muted-foreground truncate">{playlistTrack.track.artist.name}</div>
											</div>
										</div>

										<div
												className="hidden md:flex items-center text-muted-foreground text-sm">{formatUploadTime(playlistTrack._creationTime)}
										</div>

										<div
												className="flex items-center justify-center text-muted-foreground text-sm">{formatTrackDuration(playlistTrack.track.duration)}
										</div>
										<div className="hidden group-hover:flex items-center justify-center">
											<button className="cursor-pointer">
												<MoreHorizontal size={22}/>
											</button>
										</div>
									</div>
							))}
						</div>
					</div>
				</div>
				{playlist && (
						<EditPlaylistDialog
								open={editDialogOpen}
								onOpenChange={setEditDialogOpen}
								playlistId={playlist._id}
								currentName={playlist.name}
								currentPicUrl={playlist.playlistPicUrl}
						/>
				)}
			</>
	);
}
