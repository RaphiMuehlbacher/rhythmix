import {query} from "./_generated/server";
import {v} from "convex/values";

export const all = query({
	args: {},
	handler: async (ctx) => {
		const songs = await ctx.db.query("songs").collect();

		return await Promise.all(songs.map(async (song) => {
			const artist = await ctx.db.get(song.artist);
			return {
				...song,
				artist: artist?.name ?? "Unknown"
			}
		}))
	},
});

export const get = query({
	args: {trackId: v.id("songs")},
	handler: async (ctx, args) => {
		const song = await ctx.db.get(args.trackId);
		if (!song) throw Error("something went wrong");

		const artist = await ctx.db.get(song.artist);
		if (!artist) throw Error("something went wrong");

		return {...song, artist: artist};
	},
});
