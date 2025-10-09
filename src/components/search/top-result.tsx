import type { TrackFull } from "../../../convex/tracks";
import type { Artist } from "../../../convex/artists";
import { usePlayerStore } from "@/stores/player-store";
import { Play, Pause } from "lucide-react";

const TOP_RESULT_HEIGHT = "h-[200px]";
const IMAGE_SIZE = "w-32 h-32";

interface TopResultProps {
	result: TrackFull | Artist;
	type: "track" | "artist";
}

export default function TopResult({ result, type }: TopResultProps) {
	const { playTrack, pause, resume, isPlaying, window } = usePlayerStore();
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
			await playTrack(result._id);
		}
	};

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
