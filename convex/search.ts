import { query } from "./_generated/server";
import { v } from "convex/values";

const MAX_SEARCH_RESULTS = 20;

export const getSearchResults = query({
	args: { searchTerm: v.string() },
	handler: async (ctx, args) => {
		const tracks = await ctx.db
			.query("tracks")
			.withSearchIndex("search_body", (q) => q.search("title", args.searchTerm))
			.take(MAX_SEARCH_RESULTS);

		const tracksWithArtists = await Promise.all(
			tracks.map(async (track) => {
				const artist = await ctx.db.get(track.artistId);
				return {
					...track,
					artist: artist,
				};
			})
		);

		const artists = await ctx.db
			.query("artists")
			.withSearchIndex("search_body", (q) => q.search("name", args.searchTerm))
			.take(MAX_SEARCH_RESULTS);

		return {
			tracks: tracksWithArtists,
			artists,
		};
	},
});
