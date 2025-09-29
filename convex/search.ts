import { action, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import Fuse from "fuse.js";

type SearchItem = {
  id: string;
  type: "artist" | "track";
  name: string;
};

export const search = action({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const [artists, tracks] = await Promise.all([
      ctx.runQuery(internal.search.searchArtists, { searchTerm: args.searchTerm }),
      ctx.runQuery(internal.search.searchTracks, { searchTerm: args.searchTerm }),
    ]);
    const combined: SearchItem[] = [
      ...artists.map(a => ({
        id: `artist-${a._id}`,
        type: "artist" as const,
        name: a.name,
      })),
      ...tracks.map(t => ({
        id: `track-${t._id}`,
        type: "track" as const,
        name: t.title,
      })),
    ];

    const fuse = new Fuse<SearchItem>(combined, {
      keys: ["name"],
      threshold: 0.3,
    });
    const results = fuse.search(args.searchTerm, { limit: 5 });

    return results.map(r => r.item);
  },
});

export const searchTracks = internalQuery({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tracks")
      .withSearchIndex("search_body", (q) => q.search("title", args.searchTerm))
      .take(10);
  },
});

export const searchArtists = internalQuery({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("artists")
      .withSearchIndex("search_body", (q) => q.search("name", args.searchTerm))
      .take(10);
  },
});
