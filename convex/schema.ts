import {defineSchema, defineTable} from "convex/server";
import {v} from "convex/values";
import {authTables} from "@convex-dev/auth/server";

export default defineSchema({
	...authTables,
	tracks: defineTable({
		title: v.string(),
		artistId: v.id("artists"),
		duration: v.float64(),
		lyrics: v.string(),
		coverUrl: v.string(),
		audioUrl: v.string(),
	}).index("by_artistId", ["artistId"]),

	artists: defineTable({
		userId: v.id("users"),
		name: v.string(),
		description: v.string(),
		profilePicUrl: v.string(),
	}).index("by_userId", ["userId"]),

	playbackStates: defineTable({
		userId: v.id("users"),
		currentTrackId: v.id("tracks"),
	}).index("by_userId", ["userId"]),

	playlists: defineTable({
		name: v.string(),
		userId: v.id("users"),
		playlistPicUrl: v.string(),
	}).index("by_userId", ["userId"]),

	playlistsTracks: defineTable({
		playlistId: v.id("playlists"),
		trackId: v.id("tracks"),
		order: v.number(),
	}).index("by_playlistId", ["playlistId"]).index("by_playlistId_trackId", ["playlistId", "trackId"]),
});
