import {create} from "zustand";
import type {Id} from "../../convex/_generated/dataModel";
import Hls from "hls.js";
import {type ConvexReactClient} from "convex/react";
import {api} from "../../convex/_generated/api";
import type {TrackFull} from "../../convex/tracks.ts";
import type {PlaylistTrackFull} from "../../convex/playlists.ts";

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
		previous: (PlaylistTrackFull | TrackFull)[],
		current: PlaylistTrackFull | TrackFull | null,
		next: (PlaylistTrackFull | TrackFull)[],
	},

	currentIndex: number,

	progress: number,
	duration: number,
	volume: number,

	isRightSidebarOpen: boolean,
	rightSidebarTab: "CurrentTrack" | "Queue" | "Lyrics",
	setRightSidebarTab: (tab: "CurrentTrack" | "Queue" | "Lyrics") => void,
	toggleRightSidebar: (tab?: "CurrentTrack" | "Queue" | "Lyrics") => void,

	setVolume: (volume: number) => void,
	playTrack: (id: Id<"tracks">) => Promise<void>,
	playTrackFromQueue: (trackId: Id<"tracks">) => Promise<void>,
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

		isRightSidebarOpen: false,
		rightSidebarTab: "CurrentTrack",

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

		playTrackFromQueue: async (trackId: Id<"tracks">) => {
			const {window} = get();

			const queueIndex = window.next.findIndex(item => {
				const track = "track" in item ? item.track : item;
				return track._id === trackId;
			});

			if (queueIndex === -1) {
				await get().playTrack(trackId);
				return;
			}

			const selectedTrack = window.next[queueIndex];
			const tracksBeforeSelected = window.next.slice(0, queueIndex);
			const tracksAfterSelected = window.next.slice(queueIndex + 1);

			let audioUrl = "";
			if ("audioUrl" in selectedTrack) {
				audioUrl = selectedTrack.audioUrl;
			} else if ("track" in selectedTrack) {
				audioUrl = selectedTrack.track.audioUrl;
			}

			if (!get().hls) {
				const hlsInstance = new Hls({startFragPrefetch: true, maxBufferLength: 30});
				hlsInstance.attachMedia(audio);
				set({hls: hlsInstance});
			}

			get().hls?.loadSource(audioUrl);
			await audio.play();

			const newPrevious = [...window.previous];
			if (window.current) {
				newPrevious.push(window.current);
			}
			newPrevious.push(...tracksBeforeSelected);

			set({
				window: {
					previous: newPrevious,
					current: selectedTrack,
					next: tracksAfterSelected,
				},
				currentIndex: newPrevious.length,
				progress: 0,
				duration: audio.duration * 1000,
				isPlaying: true
			});
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
					current: chunk[0],
					next: chunk.slice(1),
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

				let audioUrl = "";
				if ("audioUrl" in next) {
					audioUrl = next.audioUrl;
				} else if ("track" in next) {
					audioUrl = next.track.audioUrl;
				}

				if (!get().hls) {
					const hlsInstance = new Hls({startFragPrefetch: true, maxBufferLength: 30});
					hlsInstance.attachMedia(audio);
					set({hls: hlsInstance});
				}

				get().hls?.loadSource(audioUrl);
				await audio.play();

				set({
					window: {
						previous: window.previous?.concat(current),
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
				const previous = window.previous[window.previous.length - 1]; // Take the last item, not the first

				let audioUrl = "";
				if ("audioUrl" in previous) {
					audioUrl = previous.audioUrl;
				} else if ("track" in previous) {
					audioUrl = previous.track.audioUrl;
				}

				if (!get().hls) {
					const hlsInstance = new Hls({startFragPrefetch: true, maxBufferLength: 30});
					hlsInstance.attachMedia(audio);
					set({hls: hlsInstance});
				}

				get().hls?.loadSource(audioUrl);
				await audio.play();

				set({
					window: {
						previous: window.previous.slice(0, -1), // Remove the last item
						current: previous,
						next: [current, ...window.next], // Add current to the front of next
					},
					currentIndex: currentIndex - 1,
					progress: 0,
					duration: audio.duration * 1000,
					isPlaying: true
				});
			} else {
				get().pause();
			}
		},

		setRightSidebarTab: (tab) => set({rightSidebarTab: tab}),

		toggleRightSidebar: (tab) => {
			const currentState = get();

			if (tab) {
				if (currentState.isRightSidebarOpen && currentState.rightSidebarTab === tab) {
					set({isRightSidebarOpen: false});
				} else {
					set({rightSidebarTab: tab, isRightSidebarOpen: true});
				}
			} else {
				set({isRightSidebarOpen: !currentState.isRightSidebarOpen});
			}
		},
	}
})
