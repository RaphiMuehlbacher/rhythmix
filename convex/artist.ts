import {query} from "./_generated/server";

export const getArtist = query<{ id: string }>(async (ctx, {id: artistID}) => {
  const artist = await ctx.db.get(artistID);
  if (!artist) return null;
  return {
    name: artist.name ?? "Unknown Artist",
    description: artist.description ?? "",
  };
});
