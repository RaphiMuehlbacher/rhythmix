import { action, mutation, query } from "./_generated/server";
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

// Minimal insert: only required fields (audio_url and image are optional in your schema)
export const createSongMinimal = mutation({
  args: {
    title: v.string(),
    artist_id: v.id("artist"),
  },
  handler: async (ctx, { title, artist_id }) => {
    const songId = await ctx.db.insert("songs", {
      title,
      artist: artist_id,
      duration: 0,
      // audio_url and image omitted (optional)
    });
    return songId;
  },
});

export const updateSongAfterUpload = mutation({
  args: {
    song_id: v.id("songs"),
    duration: v.float64(),
    audioUrl: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, { song_id, duration, audioUrl, imageUrl }) => {
    await ctx.db.patch(song_id, {
      duration,
      audioUrl: audioUrl,
      image: imageUrl,
    });
  },
});

export const uploadSong = action({
  args: {
    title: v.string(),
    artist_id: v.id("artist"),
    image: v.bytes(), // cover image binary
    audio: v.bytes(), // audio file (mp3) binary
    imageFilename: v.optional(v.string()),
    audioFilename: v.optional(v.string()),
    imageMimeType: v.optional(v.string()),
    audioMimeType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1) Create song row first (Convex doc ID will be our song_id for the media server)
    const songId = await ctx.runMutation("artist:createSongMinimal", {
      title: args.title,
      artist_id: args.artist_id,
    });

    // 2) Build multipart form-data for the existing backend
    const formData = new FormData();
    formData.append("song_id", String(songId)); // send Convex ID as-is

    const audioBlob = new Blob([args.audio], {
      type: args.audioMimeType ?? "audio/mpeg",
    });
    formData.append("file", audioBlob, args.audioFilename ?? "audio.mp3");

    const coverBlob = new Blob([args.image], {
      type: args.imageMimeType ?? "image/webp",
    });
    formData.append("cover", coverBlob, args.imageFilename ?? "cover.webp");

    // 3) Call your existing uploader (unchanged backend)
    const res = await fetch("https://rhythmix.redstphillip.uk/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(
        `Upload failed with status ${res.status} ${res.statusText}${errText ? `: ${errText}` : ""}`
      );
    }

    // Backend returns filesystem paths — keep backend as-is and derive public URLs here
    const data: {
      status: string;
      song_id: string;     // will be the Convex doc ID we sent
      duration: number;    // extracted by backend via mutagen
      filepath: string;    // e.g. /home/.../audio_files/{song_id}/just-dance.mp3
      coverpath: string;   // e.g. /home/.../covers/{song_id}.webp  (backend controls filename)
    } = await res.json();

    // 4) Construct the public URLs in the format you want, without changing the backend
    const mediaSongId = data.song_id; // this is your Convex ID
    const audioUrl = `https://rhythmix.redstphillip.uk/rhythmix/audio_files/${mediaSongId}/output.m3u8`;

    // Use the actual filename the backend wrote (basename of coverpath)
    const coverFilename = data.coverpath.split("/").pop() ?? "cover.webp";
    const imageUrl = `https://rhythmix.redstphillip.uk/rhythmix/covers/${coverFilename}`;

    // 5) Update the DB row
    await ctx.runMutation("artist:updateSongAfterUpload", {
      song_id: songId,
      duration: data.duration,
      audioUrl,
      imageUrl,
    });

    // Return server response plus the URLs we computed for the client
    return {
      song_id: songId,
      upload: {
        ...data,
        audioUrl: audioUrl,
        image: imageUrl,
      },
    };
  },
});