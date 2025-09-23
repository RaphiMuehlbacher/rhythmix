import {defineSchema, defineTable} from "convex/server";
import {v} from "convex/values";
import {authTables} from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  songs: defineTable({
    title: v.string(),
    artist: v.id("artist"),
    duration: v.float64(),
    lyrics: v.string(),
    audioUrl: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
  }),
  artist: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.string(),
    profilePicUrl: v.string(),
  }).index("by_userId", ["userId"]),
});