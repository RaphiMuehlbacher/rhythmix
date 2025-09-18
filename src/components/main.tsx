import SongCard from "@/components/song-card.tsx";
import {useQuery} from "convex/react";
import {api} from "../../convex/_generated/api";

export default function Main() {
	const songs = useQuery(api.songs.get);
	if (songs == undefined) {
		return <h1>Error</h1>
	}

	return <div className="bg-primary rounded-lg">
		<div
				className={
					'grid lg:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] grid-rows-1 auto-rows-[0px] overflow-y-hidden h-min'
				}
		>
			{songs.slice(0, 10).map((track) => (
					<SongCard
							name={track.title}
							artist={track.artist}
							image={track.image}
							audioUrl={track.audioUrl}
							key={track._id}
					/>
			))}
		</div>
	</div>
}