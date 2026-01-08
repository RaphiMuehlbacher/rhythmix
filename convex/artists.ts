import {action, mutation, query} from "./_generated/server";
import {v} from "convex/values";
import {getAuthUserId} from "@convex-dev/auth/server";
import {api} from "./_generated/api";
import type {Id} from "./_generated/dataModel";

export type Artist = {
	_id: Id<"artists">
	_creationTime: number,
	userId: Id<"users">,
	description: string,
	name: string,
	profilePicUrl: string,
}

export const get = query({
	args: {id: v.id("artists")},
	handler: async (ctx, args) => {
		const artist = await ctx.db.get(args.id);
		if (!artist) return null;

		return artist;
	},
});

export const all = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("artists").collect();
	},
});

export const getArtistByCurrentUser = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const artist = await ctx.db.query("artists").withIndex("by_userId", (q) => q.eq("userId", userId)).unique();
		if (!artist) throw new Error("Something went wrong");

		return artist;
	}
})

export const createTrack = mutation({
	args: {
		title: v.string(),
		artistId: v.id("artists"),
		lyrics: v.optional(v.string()),
		duration: v.float64(),
		audioUrl: v.string(),
		coverUrl: v.string(),
	},
	handler: async (ctx, {title, artistId, lyrics, duration, audioUrl, coverUrl}) => {
		return await ctx.db.insert("tracks", {
			title,
			artistId,
			duration,
			lyrics: lyrics || "",
			coverUrl,
			audioUrl,
		});
	},
});

type UploadResponse = {
	status: string;
	trackId: Id<"tracks">;
	duration: number;
	audioUrl: string;
	coverUrl: string;
};

export const uploadTrack = action({
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
	handler: async (ctx, args): Promise<UploadResponse> => {
		const artist = await ctx.runQuery(api.artists.getArtistByCurrentUser);
		if (!artist) throw new Error("something went wrong");

		// Build form data without song_id - server generates UUID
		const formData = new FormData();

		const audioBlob = new Blob([args.audio], {
			type: args.audioMimeType ?? "audio/mpeg",
		});
		formData.append("file", audioBlob, args.audioFilename ?? "audio.mp3");

		const coverBlob = new Blob([args.image], {
			type: args.imageMimeType ?? "image/webp",
		});
		formData.append("cover", coverBlob, args.imageFilename ?? "cover.webp");

		// Upload to raspi server first
		const res = await fetch(`https://api-rhythmix.redstphillip.uk/upload-song`, {
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
			coverExt: string;
		} = await res.json();

		// Build URLs from the server-generated UUID
		const songId = data.songId;
		const audioUrl = `https://rhythmix.redstphillip.uk/rhythmix/audio_files/${songId}/output.m3u8`;
		// Use the exact extension the backend saved the cover with
		const coverUrl = `https://rhythmix.redstphillip.uk/rhythmix/covers/${songId}${data.coverExt}`;

		// Create track in database after successful upload
		const trackId = await ctx.runMutation(api.artists.createTrack, {
			title: args.title,
			artistId: artist._id,
			lyrics: args.lyrics,
			duration: data.duration,
			audioUrl,
			coverUrl,
		});

		return {
			status: data.status,
			trackId,
			duration: data.duration,
			audioUrl,
			coverUrl,
		};
	},
});

// ---------------- PROFILE PICTURE ----------------

export const updateArtistProfilePic = mutation({
	args: {
		profilePicUrl: v.string(),
	},
	handler: async (ctx, args) => {
		const artist = await ctx.runQuery(api.artists.getArtistByCurrentUser);
		if (!artist) throw new Error("something went wrong");

		await ctx.db.patch(artist._id, {profilePicUrl: args.profilePicUrl});
	},
});

export const updateArtist = mutation({
	args: {
		name: v.string(),
		description: v.string(),
	},
	handler: async (ctx, {name, description}) => {
		const artist = await ctx.runQuery(api.artists.getArtistByCurrentUser);
		if (!artist) throw new Error("something went wrong");

		await ctx.db.patch(artist._id, {name, description});
	},
});

export const uploadArtistProfilePic = action({
	args: {
		image: v.bytes(),
		imageFilename: v.optional(v.string()),
		imageMimeType: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const artist = await ctx.runQuery(api.artists.getArtistByCurrentUser);
		if (!artist) throw new Error("something went wrong");

		const formData = new FormData();

		const imageBlob = new Blob([args.image], {
			type: args.imageMimeType ?? "image/png",
		});
		formData.append("file", imageBlob, args.imageFilename ?? "profile.png");

    const res = await fetch(`https://api-rhythmix.redstphillip.uk/upload-profile-picture`, {
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
			filename: string;
		} = await res.json();

		const profilePicUrl = `https://rhythmix.redstphillip.uk/rhythmix/profile-images/${data.filename}`;
		await ctx.runMutation(api.artists.updateArtistProfilePic, {profilePicUrl});
		return {profilePicUrl};
	},
});
