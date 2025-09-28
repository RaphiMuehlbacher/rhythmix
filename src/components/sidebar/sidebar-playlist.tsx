import type {PlaylistFull} from "../../../convex/playlists.ts";
import {usePlayerStore} from "@/stores/player-store.ts";
import {useNavigate} from "react-router";
import {Pause, Play} from "lucide-react";

export default function SidebarPlaylist({playlist}: { playlist: PlaylistFull }) {
	const navigate = useNavigate()

	const pause = usePlayerStore(state => state.pause);
	const resume = usePlayerStore(state => state.resume);
	const playPlaylist = usePlayerStore(state => state.playPlaylist);

	const context = usePlayerStore(state => state.context);
	const isPlaying = usePlayerStore(state => state.isPlaying);

	const isCurrentPlaylist = context.type === "playlist" && context.id === playlist._id;

	const handlePlay = async () => {
		if (isPlaying && isCurrentPlaylist) {
			pause();
		} else if (isCurrentPlaylist) {
			resume();
		} else {
			await playPlaylist(playlist._id);
		}
	}

	return (
			<div
					className={`
							relative flex items-center group h-[70px] rounded-lg gap-1 hover:bg-muted/50
							${isCurrentPlaylist && 'bg-muted/40 hover:bg-muted-70'}
					`}
			>
				<div className="relative flex-shrink-0"
						 onClick={handlePlay}
				>
					<img
							className=
									"w-14 h-14 rounded-lg m-2 group-hover:brightness-60 object-cover object-center"
							src={playlist.playlistPicUrl}
							alt="PlaylistImage"
					/>

					<button
							className=
									"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:block hidden"

					>
						{isCurrentPlaylist && isPlaying ? (
								<Pause size={22} fill="white"/>
						) : (
								<Play size={22} fill="white"/>
						)}
					</button>
				</div>

				<div className="flex flex-col flex-grow cursor-pointer" onClick={() => navigate(`playlists/${playlist._id}`)}>
					<span className={`font-medium line-clamp-1 ${isCurrentPlaylist ? 'text-green-500' : ''}`}>
						{playlist.name}
					</span>
					<span className="text-sm font-medium text-zinc-400 line-clamp-1">
          {playlist.user.name}
        </span>
				</div>
			</div>
	)
}
