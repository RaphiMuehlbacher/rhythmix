import {create} from "zustand";
import type {Id} from "../../convex/_generated/dataModel";
import Hls from "hls.js";
import type {Track} from "@/types/track.ts";
import {type ConvexReactClient} from "convex/react";
import {api} from "../../convex/_generated/api";

type PlayerStore = {
	audio: HTMLAudioElement;
	hls: Hls | null;

	convexClient: ConvexReactClient | null
	setConvexClient: (c: ConvexReactClient) => void,

	isPlaying: boolean;
	track: Track | null;
	progress: number;
	duration: number;
	volume: number;

	setVolume: (volume: number) => void;
	playTrack: (id: Id<"tracks">) => Promise<void>;
	pause: () => void;
	resume: () => void;
	togglePlay: () => void;
	seek: (ms: number) => void;
};

export const usePlayerStore = create<PlayerStore>((set, get) => {
	const audio = new Audio();
	audio.addEventListener("timeupdate", () => set({progress: audio.currentTime * 1000}));

	return {
		audio,
		hls: null,
		convexClient: null,
		track: null,
		isPlaying: false,
		trackId: null,
		progress: 0,
		duration: 0,
		volume: audio.volume * 100,

		setConvexClient: (c) => set({convexClient: c}),

		setVolume: (volume: number) => {
			audio.volume = volume / 100;
			set({volume});
		},

		pause: () => {
			audio.pause();
			set({isPlaying: false});
		},

		resume: () => {
			audio.play();
			set({isPlaying: true});
		},

		togglePlay: () => {
			if (get().isPlaying) {
				get().pause();
			} else {
				get().resume();
			}
		},

		seek: (ms: number) => {
			audio.currentTime = ms / 1000;
			set({progress: ms});
		},

		playTrack: async (id: Id<"tracks">) => {
			const convex = get().convexClient;
			const track = await convex?.query(api.tracks.get, {trackId: id});
			if (!track) throw new Error("Something went wrong");

			if (!get().hls) {
				const hlsInstance = new Hls({startFragPrefetch: true, maxBufferLength: 30});
				hlsInstance.attachMedia(audio);
				set({hls: hlsInstance});
			}

			get().hls?.loadSource(track.audioUrl);
			await audio.play();

			set({
				track: {
					id: track._id,
					title: track.title,
					artist: {id: track.artist._id, name: track.artist.name},
					audioUrl: track.audioUrl,
					coverUrl: track.coverUrl,
				},
				progress: 0,
				duration: audio.duration * 1000
			})
		}
	}
})
