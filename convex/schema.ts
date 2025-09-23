import {defineSchema, defineTable} from "convex/server";
import {v} from "convex/values";
import {authTables} from "@convex-dev/auth/server";

export default defineSchema({
	...authTables,
	tracks: defineTable({
		title: v.string(),
		artistId: v.id("artists"),
		coverUrl: v.string(),
		audioUrl: v.string(),
	}),
	artists: defineTable({
		name: v.string()
	}),
	playbackStates: defineTable({
		userId: v.id("users"),
		currentTrackId: v.id("tracks"),
	}).index("by_userId", ["userId"]),
});