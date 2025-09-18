import {query} from "./_generated/server";
import { v } from "convex/values";

export const getArtist = query({
  args: { id: v.id("artist") },
  handler: async (ctx, { id: artistID }) => {
    const artist = await ctx.db.get(artistID);
    if (!artist) return null;
    return {
      name: artist.name ?? "Unknown Artist",
      description: artist.description ?? "",
      profile_pic_url: artist.profile_pic_url ?? "",
    };
  },
});
