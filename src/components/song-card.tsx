import {usePlayerStore} from "@/stores/player-store";
import type {Track} from "../../convex/tracks.ts";
import type {Artist} from "../../convex/artists.ts";
import {cn} from "@/lib/utils.ts";

export default function SongCard({track, artist}: { track: Track, artist: Artist }) {
	const playTrack = usePlayerStore(state => state.playTrack);
	const pause = usePlayerStore(state => state.pause);
	const resume = usePlayerStore(state => state.resume);

	const isPlaying = usePlayerStore(state => state.isPlaying);
	const currentTrackId = usePlayerStore(state => state.window.current?._id);

	const correctTrack = currentTrackId === track._id;

	const handleClick = async () => {
		if (isPlaying && correctTrack) {
			pause();
		} else if (correctTrack) {
			resume();
		} else {
			await playTrack(track._id);
		}
	}

	return (
			<div className="flex flex-col p-[9px] rounded-md cursor-pointer hover:bg-neutral-800 group">
				<div className="relative">
					<img
							width={300}
							height={300}
							src={track.coverUrl}
							alt={track.title}
							className="w-full rounded-lg group"
					/>
					<button
							onClick={handleClick}
							className={cn(
									"flex items-center justify-center absolute bottom-2 right-2 rounded-full bg-green-500 size-12 p-2 transition-transform transform hover:scale-[1.03] duration-75",
									correctTrack && isPlaying ? "flex" : "hidden group-hover:flex"
							)}
					>
						{correctTrack && isPlaying ? (
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
				</div>
				<h3 className="font-semibold truncate mb-1">{track.title}</h3>
				<p className="text-sm text-neutral-400 truncate">{artist.name}</p>
			</div>
	);
}
