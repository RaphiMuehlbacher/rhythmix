import type {PlaylistTrackFull} from "../../../convex/playlists.ts";
import {CirclePlus, MoreHorizontal, Pause, Play, Trash} from "lucide-react";
import {usePlayerStore} from "@/stores/player-store.ts";
import type {Id} from "../../../convex/_generated/dataModel";
import {differenceInMonths, format, formatDistanceToNow} from "date-fns";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {useMutation} from "convex/react";
import {api} from "../../../convex/_generated/api";

export default function PlaylistTrack({playlistTrack, playlistId}: {
	playlistTrack: PlaylistTrackFull,
	playlistId: Id<"playlists">
}) {

	const currentTrack = usePlayerStore(state => state.window.current);
	const isPlaying = usePlayerStore(state => state.isPlaying);
	const context = usePlayerStore(state => state.context);

	const pause = usePlayerStore(state => state.pause);
	const resume = usePlayerStore(state => state.resume);
	const playPlaylist = usePlayerStore(state => state.playPlaylist);

	const removeTrack = useMutation(api.playlists.removeTrack);

	const trackIsSelected = context.type === "playlist" && context.id === playlistId && currentTrack?._id === playlistTrack.track._id;

	const handlePlay = async (order: number) => {
		if (isPlaying && trackIsSelected) {
			pause();
		} else if (trackIsSelected) {
			resume();
		} else {
			await playPlaylist(playlistId, order);
		}
	}

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

	return (
			<div
					className="grid grid-cols-[16px_1fr_1fr_40px_40px] gap-4 px-4 py-2 hover:bg-muted/50 rounded-md group transition-colors">

				<div className="flex items-center justify-center text-muted-foreground">
					<button
							className="cursor-pointer"
							onClick={() => handlePlay(playlistTrack.order)}
					>
						<span
								className={`group-hover:hidden text-sm font-semibold ${trackIsSelected ? 'text-green-500' : ''}`}>{playlistTrack.order + 1}
						</span>
						<span className="hidden group-hover:block text-foreground">
										{isPlaying && trackIsSelected ?
												<Pause size={18}/> : <Play size={18}/>}
						</span>
					</button>
				</div>

				<div className="flex items-center min-w-0 gap-3">
					<img src={playlistTrack.track.coverUrl} alt="" className="size-11 rounded"/>
					<div className="min-w-0">
						<div
								className={`font-medium truncate ${trackIsSelected ? 'text-green-500' : ''}`}
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
				<div className="flex items-center justify-center">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<MoreHorizontal size={22}
															className="text-muted-foreground hover:text-foreground cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"/>
						</DropdownMenuTrigger>

						<DropdownMenuContent className="w-40 font-semibold">
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>
									<div className="flex items-center gap-2 ">
										<CirclePlus size={15} className="text-neutral-400"/>
										<span className="text-neutral-300">Add to Playlist</span>
									</div>
								</DropdownMenuSubTrigger>
								<DropdownMenuPortal>
									<DropdownMenuSubContent>
										<DropdownMenuItem>Email</DropdownMenuItem>
										<DropdownMenuItem>Message</DropdownMenuItem>
										<DropdownMenuSeparator/>
										<DropdownMenuItem>More...</DropdownMenuItem>
									</DropdownMenuSubContent>
								</DropdownMenuPortal>
							</DropdownMenuSub>
							<DropdownMenuItem onClick={() => removeTrack({playlistTrackId: playlistTrack._id})}>
								<div className="flex items-center gap-2">
									<Trash size={15} className="text-neutral-400"/>
									<span className="text-neutral-300">Remove</span>
								</div>
							</DropdownMenuItem>

						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
	)

}