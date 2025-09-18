import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  songs: defineTable({
    title: v.string(),
    artist: v.id("artist"),
    image: v.string(),
  }),
  artist: defineTable({
    name: v.string(),
    description: v.string(),
  }),
});
