import {defineSchema, defineTable} from "convex/server";
import {v} from "convex/values";
import {authTables} from "@convex-dev/auth/server";

export default defineSchema({
	...authTables,
	songs: defineTable({
		title: v.string(),
		artist: v.id("artists"),
		image: v.string(),
		audioUrl: v.string(),
	}),
	artists: defineTable({
		name: v.string()
	}),
	playbackStates: defineTable({
		user: v.id("users"),
		currentTrack: v.id("songs"),
	}).index("by_user", ["user"]),
});