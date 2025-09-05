import {query} from "./_generated/server";

export const get = query({
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