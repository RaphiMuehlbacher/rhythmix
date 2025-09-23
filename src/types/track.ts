import type {Id} from "../../convex/_generated/dataModel";
import type {Artist} from "@/types/artist.ts";

export type Track = {
	id: Id<"tracks">,
	title: string,
	artist: Artist,
	coverUrl: string,
	audioUrl: string,
}

