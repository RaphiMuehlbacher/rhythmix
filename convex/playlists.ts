import {v} from "convex/values";
import {mutation, query} from "./_generated/server";
import {getAuthUserId} from "@convex-dev/auth/server";

export const get = query({
	args: {id: v.id("playlists")},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	}
})

export const getAllByUser = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		return ctx.db.query("playlists").withIndex("by_userId", (q) => q.eq("userId", userId)).collect()
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
	args: {playlistId: v.id("playlists")},
	handler: async (ctx, args) => {
		return await ctx.db
				.query("playlistsTracks")
				.withIndex("by_playlistId", (q) => q.eq("playlistId", args.playlistId))
				.collect();
	}
});

export const removeTrack = mutation({
	args: {
		playlistId: v.id("playlists"),
		trackId: v.id("tracks")
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const playlistTrack = await ctx.db
				.query("playlistsTracks")
				.withIndex("by_playlistId_trackId", (q) =>
						q.eq("playlistId", args.playlistId).eq("trackId", args.trackId))
				.first();

		if (playlistTrack) {
			await ctx.db.delete(playlistTrack._id);
		}
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

export const renamePlaylist = mutation({
	args: {
		playlistId: v.id("playlists"),
		newName: v.string()
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		await ctx.db.patch(args.playlistId, {
			name: args.newName
		});
	}
});