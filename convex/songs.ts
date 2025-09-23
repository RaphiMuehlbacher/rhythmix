import {query} from "./_generated/server";
import { v } from "convex/values"


export const all = query({
	args: {},
	handler: async (ctx) => {
		const songs = await ctx.db.query("tracks").collect();

		return await Promise.all(songs.map(async (song) => {
			const artist = await ctx.db.get(song.artistId);
			return {
				...song,
				artist: artist?.name ?? "Unknown"
			}
		}))
	},
});

export const get = query({
	args: {trackId: v.id("tracks")},
	handler: async (ctx, args) => {
		const song = await ctx.db.get(args.trackId);
		if (!song) throw Error("something went wrong");

		const artist = await ctx.db.get(song.artistId);
		if (!artist) throw Error("something went wrong");

		return {...song, artist: artist};
	},
});

export const byArtist = query({
  args: { artistId: v.id("artist") },
  handler: async (ctx, { artistId }) => {
    const songs = await ctx.db
      .query("songs")
      .filter((q) => q.eq(q.field("artist"), artistId))
      .collect()

    const artist = await ctx.db.get(artistId)
    const artistName = artist?.name ?? "Unknown"

    // Keep original fields and add artistName; duration/plays not in schema
    return songs.map((s) => ({ ...s, artistName }))
  },
});