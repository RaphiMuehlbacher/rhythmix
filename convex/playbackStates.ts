import {mutation, query} from "./_generated/server";
import {v} from "convex/values";
import {getAuthUserId} from "@convex-dev/auth/server";

export const playTrack = mutation({
	args: {
		trackId: v.id("tracks"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const existingPlayback = await ctx.db.query("playbackStates").withIndex("by_userId", (q) => q.eq("userId", userId)).unique();
		const newPlayback = {userId, currentTrackId: args.trackId};

		if (existingPlayback) {
			await ctx.db.patch(existingPlayback._id, newPlayback);
		} else {
			await ctx.db.insert("playbackStates", newPlayback);
		}
	}
})


export const get = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		return await ctx.db.query("playbackStates").withIndex("by_userId", (q) => q.eq("userId", userId)).unique();
	}
})