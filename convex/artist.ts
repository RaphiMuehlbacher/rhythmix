import {action, mutation, query} from "./_generated/server";
import { v } from "convex/values";
import {getAuthUserId} from "@convex-dev/auth/server";
import {api} from "./_generated/api";

export const get = query({
  args: { id: v.id("artist") },
  handler: async (ctx, args) => {
    const artist = await ctx.db.get(args.id);
    if (!artist) return null;

    return {
      id: artist._id,
      name: artist.name,
      description: artist.description,
      profilePicUrl: artist.profilePicUrl,
    };
  },
});


export const getArtistByCurrentUser = query({
  handler: async(ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const artist = await ctx.db.query("artist").withIndex("by_userId").unique();
    if (!artist) throw new Error("Something went wrong");

    return artist
  }
})

export const createSongMinimal = mutation({
  args: {
    title: v.string(),
    artistId: v.id("artist"),
    lyrics: v.optional(v.string()),
  },
  handler: async (ctx, { title, artistId, lyrics }) => {
    const songId = await ctx.db.insert("songs", {
      title,
      artist: artistId,
      duration: 0,
      lyrics: lyrics || "",
    });
    return songId;
  },
});

export const updateSongAfterUpload = mutation({
  args: {
    songId: v.id("songs"),
    duration: v.float64(),
    audioUrl: v.string(),
    coverUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.songId, {
      duration: args.duration,
      audioUrl: args.audioUrl,
      coverUrl: args.coverUrl,
    });
  },
});

export const uploadSong = action({
  args: {
    title: v.string(),
    lyrics: v.optional(v.string()),
    image: v.bytes(),
    audio: v.bytes(),
    imageFilename: v.optional(v.string()),
    audioFilename: v.optional(v.string()),
    imageMimeType: v.optional(v.string()),
    audioMimeType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const artist = await ctx.runQuery(api.artist.getArtistByCurrentUser);
    if (!artist) throw new Error("something went wrong");

    const songId = await ctx.runMutation(api.artist.createSongMinimal, {
      title: args.title,
      artist_id: artist.id,
      lyrics: args.lyrics,
    });

    const formData = new FormData();
    formData.append("song_id", String(songId));

    const audioBlob = new Blob([args.audio], {
      type: args.audioMimeType ?? "audio/mpeg",
    });
    formData.append("file", audioBlob, args.audioFilename ?? "audio.mp3");

    const coverBlob = new Blob([args.image], {
      type: args.imageMimeType ?? "image/webp",
    });
    formData.append("cover", coverBlob, args.imageFilename ?? "cover.webp");

    const res = await fetch("https://api-rhythmix.redstphillip.uk/upload-song", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(
        `Upload failed with status ${res.status} ${res.statusText}${errText ? `: ${errText}` : ""}`
      );
    }

    const data: {
      status: string;
      songId: string;
      duration: number;
      filePath: string;
      coverPath: string;
    } = await res.json();

    const mediaSongId = data.songId;
    const audioUrl = `https://rhythmix.redstphillip.uk/rhythmix/audio_files/${mediaSongId}/output.m3u8`;
    const coverFilename = data.coverPath.split("/").pop() ?? "cover.webp";
    const coverUrl = `https://rhythmix.redstphillip.uk/rhythmix/covers/${coverFilename}`;

    await ctx.runMutation(api.artist.updateSongAfterUpload, {
      songId,
      duration: data.duration,
      audioUrl,
      coverUrl,
    });

    return {
      songId: songId,
      upload: {
        ...data,
        audioUrl,
        coverUrl,
      },
    };
  },
});

// ---------------- PROFILE PICTURE ----------------

export const updateArtistProfilePic = mutation({
  args: {
    profilePicUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const artist = await ctx.runQuery(api.artist.getArtistByCurrentUser);
    if (!artist) throw new Error("something went wrong");


    await ctx.db.patch(artist.id, { profilePicUrl: args.profilePicUrl });
  },
});

export const updateArtist = mutation({
  args: {
    name: v.string(),
    description: v.string(),
  },
  handler: async (ctx, { name, description }) => {
    const artist = await ctx.runQuery(api.artist.getArtistByCurrentUser);
    if (!artist) throw new Error("something went wrong");

    await ctx.db.patch(artist.id, { name, description });
  },
});

export const uploadArtistProfilePic = action({
  args: {
    image: v.bytes(),
    imageFilename: v.optional(v.string()),
    imageMimeType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const artist = await ctx.runQuery(api.artist.getArtistByCurrentUser);
    if (!artist) throw new Error("something went wrong");

    const formData = new FormData();
    formData.append("artist_id", String(artist.id));

    const imageBlob = new Blob([args.image], {
      type: args.imageMimeType ?? "image/png",
    });
    formData.append("file", imageBlob, args.imageFilename ?? "profile.png");

    const res = await fetch("https://api-rhythmix.redstphillip.uk/upload-profile-picture", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(
        `Profile picture upload failed: ${res.status} ${res.statusText}${errText ? `: ${errText}` : ""}`
      );
    }

    const data: {
      status: string;
      artistId: string;
      filename: string;
    } = await res.json();

    const profilePicUrl = `https://rhythmix.redstphillip.uk/rhythmix/profile-images/${data.filename}`;
    await ctx.runMutation(api.artist.updateArtistProfilePic, {
      artistId: artist.id,
      profilePicUrl,
    });

    return { profilePicUrl };
  },
});
