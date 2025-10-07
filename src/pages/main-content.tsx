import SongCard from "@/components/song-card.tsx";
import {useQuery} from "convex/react";
import {api} from "../../convex/_generated/api";

export default function MainContent() {
	const tracks = useQuery(api.tracks.all);

	if (!tracks) {
		return <h1>Loading...</h1>;
	}

	return (
			<div className="bg-background rounded-lg space-y-8 p-4 h-full overflow-hidden">
				{/* First row: horizontal scroll with proper card sizes */}
				<div className="overflow-x-auto overflow-y-hidden scrollbar-hide">
					<div className="flex gap-4 pb-2 w-max">
						{tracks.slice(0, 10).map((track) => (
								<div key={track._id} className="flex-shrink-0 w-[200px]">
									<SongCard
											track={track}
											artist={track.artist}
									/>
								</div>
						))}
					</div>
				</div>

				{/* Empty rows below */}
				<div className="grid gap-6">
					{[...Array(3)].map((_, idx) => (
							<div
									key={idx}
									className="h-[220px] rounded-lg border border-dashed border-muted bg-muted/10"
							/>
					))}
				</div>
			</div>
	);
}
