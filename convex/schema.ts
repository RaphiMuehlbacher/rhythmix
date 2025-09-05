import {defineSchema, defineTable} from "convex/server";
import {v} from "convex/values";

export default defineSchema({
	songs: defineTable({
		title: v.string(),
		artist: v.id("artist"),
		image: v.string(),
	}),
	artist: defineTable({
		name: v.string()
	})
});