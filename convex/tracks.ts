import {query} from "./_generated/server";
import {v} from "convex/values"
import type {Id} from "./_generated/dataModel";
import type {Artist} from "./artists.ts";


export type Track = {
	_id: Id<"tracks">,
	_creationTime: number,
	title: string,
	artistId: Id<"artists">
	duration: number,
	lyrics: string,
	coverUrl: string,
	audioUrl: string,
}

export type TrackFull = {
	artist: Artist,
} & Track

export const all = query({
	args: {},
	handler: async (ctx) => {
		const tracks = await ctx.db.query("tracks").collect();

		return await Promise.all(tracks.map(async (track) => {
			const artist = await ctx.db.get(track.artistId);
			return {
				...track,
				artist: artist,
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
	args: {artistId: v.id("artists")},
	handler: async (ctx, args) => {
		const tracks = await ctx.db
				.query("tracks")
				.withIndex("by_artistId", (q) => q.eq("artistId", args.artistId))
				.collect()

		const artist = await ctx.db.get(args.artistId)
		const artistName = artist?.name ?? "Unknown"

		return tracks.map((s) => ({...s, artistName}))
	},
});