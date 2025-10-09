import type { TrackFull } from "../../../convex/tracks";
import type { Artist } from "../../../convex/artists";
import { usePlayerStore } from "@/stores/player-store";
import { Play, Pause, CirclePlus } from "lucide-react";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger
} from "@/components/ui/context-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

const TOP_RESULT_HEIGHT = "h-[200px]";
const IMAGE_SIZE = "w-32 h-32";

interface TopResultProps {
	result: TrackFull | Artist;
	type: "track" | "artist";
}

export default function TopResult({ result, type }: TopResultProps) {
	const { playTrack } = usePlayerStore();
	const { pause } = usePlayerStore();
	const { resume } = usePlayerStore();
	const { isPlaying } = usePlayerStore();
	const { window } = usePlayerStore();

	const playlists = useQuery(api.playlists.getAllByUser);
	const addTrack = useMutation(api.playlists.addTrack);
	const [open, setOpen] = useState(false);

	const currentTrackId = window.current?._id;

	const isTrack = type === "track";
	const title = isTrack ? (result as TrackFull).title : (result as Artist).name;
	const subtitle = isTrack ? (result as TrackFull).artist.name : "Artist";
	const image = isTrack ? (result as TrackFull).coverUrl : (result as Artist).profilePicUrl;
	const imageStyle = isTrack ? "rounded-lg" : "rounded-full";

	const isCurrentTrack = isTrack && currentTrackId === result._id;
	const showPlayButton = isPlaying && isCurrentTrack;

	const handlePlayButtonClick = async () => {
		if (!isTrack) return;

		if (isPlaying && isCurrentTrack) {
			pause();
		} else if (isCurrentTrack) {
			resume();
		} else {
			// Cast to TrackFull since we've verified isTrack is true
			await playTrack((result as TrackFull)._id);
		}
	};

	// If it's not a track or playlists haven't loaded, render without context menu
	if (!isTrack || !playlists) {
		return (
			<div className={`bg-neutral-900 rounded-lg px-6 py-2 hover:bg-neutral-800 cursor-pointer group transition-colors flex items-center ${TOP_RESULT_HEIGHT}`}>
				<div className="flex items-center gap-6 w-full">
					<img
						src={image || "/placeholder.svg"}
						alt={title}
						className={`${IMAGE_SIZE} ${imageStyle} object-cover shadow-lg flex-shrink-0`}
					/>

					<div className="flex-1 min-w-0">
						<h2 className="text-white text-3xl font-bold mb-2 line-clamp-2">
							{title}
						</h2>

						<div className="flex items-center gap-2 mb-4">
							<span className="bg-neutral-800 text-white text-xs px-2 py-1 rounded-full">
								{type === "track" ? "Track" : "Artist"}
							</span>
							<span className="text-zinc-400">{subtitle}</span>
						</div>

						{isTrack && (
							<button
								onClick={handlePlayButtonClick}
								className="bg-green-500 hover:bg-green-400 hover:scale-105 text-black font-semibold px-8 py-3 rounded-full transition-all inline-flex items-center gap-2"
							>
								{showPlayButton ? (
									<Pause className="w-5 h-5" fill="currentColor" />
								) : (
									<Play className="w-5 h-5" fill="currentColor" />
								)}
								<span>{showPlayButton ? "Pause" : "Play"}</span>
							</button>
						)}
					</div>
				</div>
			</div>
		);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<ContextMenu>
				<ContextMenuTrigger>
					<div className={`bg-neutral-900 rounded-lg px-6 py-2 hover:bg-neutral-800 cursor-pointer group transition-colors flex items-center ${TOP_RESULT_HEIGHT}`}>
						<div className="flex items-center gap-6 w-full">
							<img
								src={image || "/placeholder.svg"}
								alt={title}
								className={`${IMAGE_SIZE} ${imageStyle} object-cover shadow-lg flex-shrink-0`}
							/>

							<div className="flex-1 min-w-0">
								<h2 className="text-white text-3xl font-bold mb-2 line-clamp-2">
									{title}
								</h2>

								<div className="flex items-center gap-2 mb-4">
									<span className="bg-neutral-800 text-white text-xs px-2 py-1 rounded-full">
										{type === "track" ? "Track" : "Artist"}
									</span>
									<span className="text-zinc-400">{subtitle}</span>
								</div>

								<button
									onClick={handlePlayButtonClick}
									className="bg-green-500 hover:bg-green-400 hover:scale-105 text-black font-semibold px-8 py-3 rounded-full transition-all inline-flex items-center gap-2"
								>
									{showPlayButton ? (
										<Pause className="w-5 h-5" fill="currentColor" />
									) : (
										<Play className="w-5 h-5" fill="currentColor" />
									)}
									<span>{showPlayButton ? "Pause" : "Play"}</span>
								</button>
							</div>
						</div>
					</div>
				</ContextMenuTrigger>
				<ContextMenuContent className="w-52">
					<ContextMenuItem>
						<PopoverTrigger asChild>
							<div className="flex items-center gap-2">
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
							{playlists.map((playlist) => (
								<CommandItem
									key={playlist._id}
									value={playlist.name}
									onSelect={async (currentValue) => {
										const selectedPlaylist = playlists.find(p => p.name === currentValue);
										if (selectedPlaylist) {
											setOpen(false);
											await addTrack({
												playlistId: selectedPlaylist._id,
												trackId: result._id
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
	);
}
