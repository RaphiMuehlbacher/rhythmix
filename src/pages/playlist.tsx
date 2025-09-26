import {useParams} from "react-router";
import {useQuery} from "convex/react";
import {api} from "../../convex/_generated/api";
import type {Id} from "../../convex/_generated/dataModel";
import {Clock, MoreHorizontal, Play, Shuffle} from "lucide-react";
import {format, formatDistanceToNow, differenceInMonths, intervalToDuration} from 'date-fns';
import {usePlayerStore} from "@/stores/player-store.ts";

export default function Playlist() {
	const {playlistId} = useParams();

	const playTrack = usePlayerStore(state => state.playTrack);

	const user = useQuery(api.users.currentUser);
	const playlist = useQuery(api.playlists.get, {id: playlistId as Id<"playlists">});
	const playlistTracks = useQuery(api.playlists.getPlaylistTracks, playlist ? {playlistId: playlist._id} : "skip");


	if (!user || !playlist || !playlistTracks) return <h1>Loading...</h1>

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


	return (
			<div className="bg-background rounded-lg pt-16 px-7">
				<div className="flex items-end gap-6">
					<img src={playlist.playlistPicUrl} alt="" className="size-60 rounded-md"/>
					<div className="flex-1">
						<p className="text-6xl font-bold text-balance mb-6">{playlist.name}</p>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<span className="font-semibold text-foreground">{user.name}</span>
							<span>•</span>
							<span>{playlistTracks.length} songs</span>
							<span>•</span>
							<span>{formatPlaylistDuration(playlistDuration)}</span>
						</div>
					</div>
				</div>

				<div className="pt-7">
					<div className="flex items-center gap-6">
						<button
								className="flex items-center justify-center rounded-full bg-green-500 size-12 cursor-pointer transition-transform transform hover:scale-[1.03] duration-75 "
						>
							<svg viewBox="0 0 16 16" className="size-6 transition-transform transform hover:scale-[1.03] duration-75">
								<path
										d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
							</svg>
						</button>
						<Shuffle className="text-muted-foreground"/>
						<MoreHorizontal className="text-muted-foreground"/>
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
								<div
										key={playlistTrack._id}
										className={`grid grid-cols-[16px_1fr_1fr_40px_40px] gap-4 px-4 py-2 hover:bg-muted/30 rounded-md group transition-colors`}
								>
									<div className="flex items-center justify-center text-muted-foreground">

										<button className="cursor-pointer" onClick={() => playTrack(playlistTrack.track._id)}>
											<span className="group-hover:hidden text-sm font-semibold">{playlistTrack.order + 1}</span>
											<Play className="w-4 h-4 hidden group-hover:block text-foreground fill"/>
										</button>
									</div>

									<div className="flex items-center min-w-0 gap-3">
										<img src={playlistTrack.track.coverUrl} alt="" className="size-11 rounded"/>
										<div className="min-w-0">
											<div
													className={`font-medium truncate`}
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
	);
}
