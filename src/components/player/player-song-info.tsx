import {usePlayerStore} from "@/stores/player-store.ts";

export default function PlayerSongInfo() {
	const track = usePlayerStore(store => store.track);

	if (!track) {
		return <h1>Select a song</h1>;
	}

	return (
			<div className="flex items-center justify-start gap-3">
				<img className="size-15 rounded" src={track.coverUrl}
						 alt={track.title}/>
				<div>
					<p className="text-[15px]">{track.title}</p>
					<p className="text-xs font-semibold text-zinc-400 line-clamp-1">{track.artist.name}</p>
				</div>
			</div>
	)
}
