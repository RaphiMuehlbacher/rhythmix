import {v} from "convex/values";
import {mutation, query} from "./_generated/server";
import {getAuthUserId} from "@convex-dev/auth/server";
import {api} from "./_generated/api";
import type {Id} from "./_generated/dataModel";
import type {TrackFull} from "./tracks.ts";
import type {User} from "./users.ts";

export type Playlist = {
	_id: Id<"playlists">
	_creationTime: number,
	userId: Id<"users">,
	name: string,
	playlistPicUrl: string,
}

export type PlaylistFull = {
	user: User
} & Playlist

export type PlaylistTrack = {
	_id: Id<"playlistsTracks">
	_creationTime: number,
	playlistId: Id<"playlists">,
	trackId: Id<"tracks">,
	order: number,
}

export type PlaylistTrackFull = {
	track: TrackFull,
} & PlaylistTrack


export const get = query({
	args: {id: v.id("playlists")},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	}
})

export const getAllByUser = query({
	handler: async (ctx): Promise<PlaylistFull[]> => {
		const user = await ctx.runQuery(api.users.currentUser);
		if (!user) throw new Error("Not authenticated");

		const playlists = await ctx.db.query("playlists").withIndex("by_userId", (q) => q.eq("userId", user._id)).collect();
		return playlists.map(playlist => ({
			user: user,
			...playlist,
		}));
	}
})

export const create = mutation({
	args: {name: v.string(), playlistPicUrl: v.string()},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		await ctx.db.insert("playlists", {userId, name: args.name, playlistPicUrl: args.playlistPicUrl});
	}
})

export const addTrack = mutation({
	args: {playlistId: v.id("playlists"), trackId: v.id("tracks")},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const tracks = await ctx.db.query("playlistsTracks").withIndex("by_playlistId", (q) => q.eq("playlistId", args.playlistId)).collect();
		const order = tracks.length > 0 ? Math.max(...tracks.map(t => t.order)) + 1 : 0;

		await ctx.db.insert("playlistsTracks", {
			playlistId: args.playlistId,
			trackId: args.trackId,
			order,
		});
	}
})


export const getPlaylistTracks = query({
	args: {playlistId: v.id("playlists"), offset: v.number(), limit: v.number()},
	handler: async (ctx, args): Promise<Array<PlaylistTrackFull>> => {
		const allPlaylistTracks = await ctx.db
				.query("playlistsTracks")
				.withIndex("by_playlistId", (q) => q.eq("playlistId", args.playlistId))
				.order("asc")
				.collect();

		const playlistTracks = allPlaylistTracks.slice(args.offset, args.offset + args.limit);

		const tracks = await Promise.all(
				playlistTracks.map(pt =>
						ctx.runQuery(api.tracks.get, {trackId: pt.trackId})
				)
		);

		return playlistTracks.map((pt, i) => ({
			...pt,
			track: tracks[i],
		}));
	}
});

export const getAllPlaylistTracks = query({
	args: {playlistId: v.id("playlists")},
	handler: async (ctx, args): Promise<Array<PlaylistTrackFull>> => {
		const playlistTracks = await ctx.db
				.query("playlistsTracks")
				.withIndex("by_playlistId", (q) => q.eq("playlistId", args.playlistId))
				.order("asc")
				.collect();

		const tracks = await Promise.all(
				playlistTracks.map(pt =>
						ctx.runQuery(api.tracks.get, {trackId: pt.trackId})
				)
		);

		return playlistTracks.map((pt, i) => ({
			...pt,
			track: tracks[i],
		}));
	}
});

export const removeTrack = mutation({
	args: {
		playlistTrackId: v.id("playlistsTracks"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		await ctx.db.delete(args.playlistTrackId);
	}
});

export const deletePlaylist = mutation({
	args: {playlistId: v.id("playlists")},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const playlistTracks = await ctx.db
				.query("playlistsTracks")
				.withIndex("by_playlistId", (q) => q.eq("playlistId", args.playlistId))
				.collect();

		for (const track of playlistTracks) {
			await ctx.db.delete(track._id);
		}

		await ctx.db.delete(args.playlistId);
	}
});

export const update = mutation({
	args: {
		playlistId: v.id("playlists"),
		newName: v.string(),
		newPlaylistPicUrl: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		await ctx.db.patch(args.playlistId, {
			name: args.newName,
			playlistPicUrl: args.newPlaylistPicUrl
		});
	}
});