import {create} from "zustand";
import type {Id} from "../../convex/_generated/dataModel";
import Hls from "hls.js";
import {type ConvexReactClient} from "convex/react";
import {api} from "../../convex/_generated/api";
import type {TrackFull} from "../../convex/tracks.ts";

type PlayerStore = {
	audio: HTMLAudioElement,
	hls: Hls | null,

	convexClient: ConvexReactClient | null
	setConvexClient: (c: ConvexReactClient) => void,

	isPlaying: boolean;
	context: {
		type: "single" | "playlist",
		id: Id<"playlists"> | null
	}

	window: {
		previous: TrackFull[],
		current: TrackFull | null,
		next: TrackFull[],
	},

	currentIndex: number,

	progress: number,
	duration: number,
	volume: number,

	setVolume: (volume: number) => void,
	playTrack: (id: Id<"tracks">) => Promise<void>,
	playPlaylist: (id: Id<"playlists">, startIndex?: number) => Promise<void>,
	nextTrack: () => Promise<void>,
	previousTrack: () => Promise<void>,
	pause: () => void,
	resume: () => void,
	togglePlay: () => void,
	seek: (ms: number) => void,
};

export const usePlayerStore = create<PlayerStore>((set, get) => {
	const audio = new Audio();
	audio.addEventListener("timeupdate", () => set({progress: audio.currentTime * 1000}));
	audio.addEventListener("ended", () => get().nextTrack());

	return {
		audio,
		hls: null,
		convexClient: null,
		isPlaying: false,
		context: {
			type: "single",
			id: null,
		},
		window: {
			previous: [],
			current: null,
			next: [],
		},
		currentIndex: 0,
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
				window: {
					previous: [],
					current: track,
					next: [],
				},
				context: {
					type: "single",
					id: null
				},
				isPlaying: true,
				progress: 0,
				duration: audio.duration * 1000
			})
		},

		playPlaylist: async (playlistId: Id<"playlists">, startIndex = 0) => {
			const convex = get().convexClient;
			const chunk = await convex?.query(api.playlists.getPlaylistTracks, {playlistId, offset: startIndex, limit: 10});
			if (!chunk) throw new Error("Something went wrong");

			if (!get().hls) {
				const hlsInstance = new Hls({startFragPrefetch: true, maxBufferLength: 30});
				hlsInstance.attachMedia(audio);
				set({hls: hlsInstance});
			}

			get().hls?.loadSource(chunk[0].track.audioUrl);
			await audio.play();

			set({
				window: {
					previous: [],
					current: chunk[0].track,
					next: chunk.slice(1).map(playlistTrack => playlistTrack.track),
				},
				context: {
					type: "playlist",
					id: playlistId,
				},
				isPlaying: true,
				progress: 0,
				duration: audio.duration * 1000,
			})
		},

		nextTrack: async () => {
			const {window, currentIndex, context, convexClient} = get();
			if (window.next.length > 0) {
				const current = window.current!;
				const next = window.next[0];

				if (!get().hls) {
					const hlsInstance = new Hls({startFragPrefetch: true, maxBufferLength: 30});
					hlsInstance.attachMedia(audio);
					set({hls: hlsInstance});
				}

				get().hls?.loadSource(next.audioUrl);
				await audio.play();

				set({
					window: {
						previous: window.previous.concat(current),
						current: next,
						next: window.next.slice(1),
					},
					currentIndex: currentIndex + 1,
					progress: 0,
					duration: audio.duration * 1000,
					isPlaying: true
				});

				if (window.next.length <= 3 && context.type === "playlist" && context.id && convexClient) {
					const nextChunk = await convexClient.query(api.playlists.getPlaylistTracks, {
						playlistId: context.id,
						offset: currentIndex + window.next.length + 1,
						limit: 10
					});

					if (nextChunk.length > 0) {
						set(state => ({
							window: {
								...state.window,
								next: [...state.window.next, ...nextChunk.map(pt => pt.track)]
							}
						}));
					}
				}
			} else {
				get().pause();
			}
		},

		previousTrack: async () => {
			const {window, currentIndex} = get();
			if (window.previous.length > 0) {
				const current = window.current!;
				const next = window.previous[0];

				if (!get().hls) {
					const hlsInstance = new Hls({startFragPrefetch: true, maxBufferLength: 30});
					hlsInstance.attachMedia(audio);
					set({hls: hlsInstance});
				}

				get().hls?.loadSource(next.audioUrl);
				await audio.play();

				set({
					window: {
						previous: window.previous.slice(1),
						current: next,
						next: window.next.concat(current),
					},
					currentIndex: currentIndex - 1,
					progress: 0,
					duration: audio.duration * 1000,
					isPlaying: true
				});
			} else {
				get().pause();
			}
		}
	}
})
