import type {Id} from "../../convex/_generated/dataModel";
import type {Artist} from "@/types/artist.ts";

export type Track = {
	id: Id<"songs">,
	title: string,
	artist: Artist,
	image: string,
	audioUrl: string,
}

