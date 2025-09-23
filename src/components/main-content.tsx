import SongCard from "@/components/song-card.tsx";
import {useQuery} from "convex/react";
import {api} from "../../convex/_generated/api";

export default function MainContent() {
	const tracks = useQuery(api.tracks.all);

	if (tracks == undefined) {
		return <h1>Error</h1>
	}

	return <div className="bg-primary rounded-lg">
		<div
				className={
					'grid lg:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] grid-rows-1 auto-rows-[0px] overflow-y-hidden h-min'
				}
		>
			{tracks.slice(0, 10).map((track) => (
					<SongCard
							id={track._id}
							title={track.title}
							artist={track.artist}
							image={track.coverUrl}
							key={track._id}
					/>
			))}
		</div>
	</div>
}