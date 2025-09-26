import type {Id} from "../../convex/_generated/dataModel";
import {usePlayerStore} from "@/stores/player-store.ts";

export default function SongCard({id, title, artist, image}: {
	id: Id<"tracks">,
	title: string,
	artist: string,
	image: string,
}) {

	const playTrack = usePlayerStore(state => state.playTrack);

	return (
			<div className="flex flex-col p-[9px] rounded-md cursor-pointer hover:bg-accent group">
				<div className="relative">
					<img width={300} height={300} className="rounded-lg w-full group" src={image} alt={title}/>
					<button
							onClick={() => playTrack(id)}
							className="hidden group-hover:flex items-center justify-center absolute bottom-2 right-2 rounded-full bg-green-500 size-12 p-2 transition-transform transform hover:scale-[1.03] duration-75"
					>
						<svg viewBox="0 0 16 16" className="size-6 transition-transform transform hover:scale-[1.03] duration-75">
							<path
									d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
						</svg>
					</button>
				</div>
				<p className="font-medium text-foreground line-clamp-2 mt-2">{title}</p>
				<p className="font-medium text-muted-foreground text-sm line-clamp-2">{artist}</p>
			</div>
	);
}
