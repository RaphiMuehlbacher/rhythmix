import {mutation, query} from "./_generated/server";
import {v} from "convex/values";

export const playTrack = mutation({
	args: {
		user: v.id("users"),
		track: v.id("songs"),
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db.query("playbackStates").withIndex("by_user", (q) => q.eq("user", args.user)).unique();
		const state = {user: args.user, currentTrack: args.track};

		if (existing) {
			await ctx.db.patch(existing._id, state);
		} else {
			await ctx.db.insert("playbackStates", state);
		}
	}
})


export const get = query({
	args: {
		user: v.id("users")
	},
	handler: async (ctx, args) => {
		return await ctx.db.query("playbackStates").withIndex("by_user", (q) => q.eq("user", args.user)).unique();
	}
})