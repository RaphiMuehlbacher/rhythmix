import { query } from "./_generated/server"
import { v } from "convex/values"

export const get = query({
  args: {},
  handler: async (ctx) => {
    const songs = await ctx.db.query("songs").collect()
    return await Promise.all(
      songs.map(async (song) => {
        const artist = await ctx.db.get(song.artist)
        return {
          ...song,
          artist: artist?.name ?? "Unknown",
        }
      })
    )
  },
})

// New: fetch only songs for a specific artist
export const byArtist = query({
  args: { artistId: v.id("artist") },
  handler: async (ctx, { artistId }) => {
    const songs = await ctx.db
      .query("songs")
      .filter((q) => q.eq(q.field("artist"), artistId))
      .collect()

    const artist = await ctx.db.get(artistId)
    const artistName = artist?.name ?? "Unknown"

    // Keep original fields and add artistName; duration/plays not in schema
    return songs.map((s) => ({ ...s, artistName }))
  },
})