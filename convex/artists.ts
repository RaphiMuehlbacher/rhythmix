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


export const getArtistByCurrentUser = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const artist = await ctx.db.query("artists").withIndex("by_userId", (q) => q.eq("userId", userId)).unique();
		if (!artist) throw new Error("Something went wrong");

		return artist;
	}
})

export const createSongMinimal = mutation({
	args: {
		title: v.string(),
		artistId: v.id("artists"),
		lyrics: v.optional(v.string()),
	},
	handler: async (ctx, {title, artistId, lyrics}) => {
		return await ctx.db.insert("tracks", {
			title,
			artistId: artistId,
			duration: 0,
			lyrics: lyrics || "",
			coverUrl: "",
			audioUrl: "",
		});
	},
});

export const updateSongAfterUpload = mutation({
	args: {
		trackId: v.id("tracks"),
		duration: v.float64(),
		audioUrl: v.string(),
		coverUrl: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.trackId, {
			duration: args.duration,
			audioUrl: args.audioUrl,
			coverUrl: args.coverUrl,
		});
	},
});

type UploadResponse = {
	status: string;
	trackId: Id<"tracks">;
	duration: number;
	filePath: string;
	coverPath: string;
	audioUrl: string;
	coverUrl: string;
};

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
	handler: async (ctx, args): Promise<UploadResponse> => {
		const artist = await ctx.runQuery(api.artists.getArtistByCurrentUser);
		if (!artist) throw new Error("something went wrong");

		const trackId = await ctx.runMutation(api.artists.createSongMinimal, {
			title: args.title,
			artistId: artist._id,
			lyrics: args.lyrics,
		});

		const formData = new FormData();
		formData.append("song_id", String(trackId));

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
			trackId: Id<"tracks">;
			duration: number;
			filePath: string;
			coverPath: string;
		} = await res.json();

		const mediaSongId = data.trackId;
		const audioUrl = `https://rhythmix.redstphillip.uk/rhythmix/audio_files/${mediaSongId}/output.m3u8`;
		const coverFilename = data.coverPath.split("/").pop() ?? "cover.webp";
		const coverUrl = `https://rhythmix.redstphillip.uk/rhythmix/covers/${coverFilename}`;

		await ctx.runMutation(api.artists.updateSongAfterUpload, {
			trackId,
			duration: data.duration,
			audioUrl,
			coverUrl,
		});

		return {
			...data,
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
		formData.append("artist_id", String(artist._id));

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
		await ctx.runMutation(api.artists.updateArtistProfilePic, {profilePicUrl});

		return {profilePicUrl};
	},
});
