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

	// Separate queues for priority and playlist
	priorityQueue: TrackFull[],
	playlistQueue: (PlaylistTrackFull | TrackFull)[],

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
	addToQueue: (id: Id<"tracks">) => Promise<void>,
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
		priorityQueue: [],
		playlistQueue: [],

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
			const {window, priorityQueue, playlistQueue} = get();

			// Combine both queues to search for the track
			const combinedQueue = [...priorityQueue, ...playlistQueue];

			const queueIndex = combinedQueue.findIndex(item => {
				const track = "track" in item ? item.track : item;
				return track._id === trackId;
			});

			if (queueIndex === -1) {
				await get().playTrack(trackId);
				return;
			}

			const selectedTrack = combinedQueue[queueIndex];

			// Determine if it's from priority queue or playlist queue
			const isPriorityTrack = queueIndex < priorityQueue.length;

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

			// Update queues based on where the track was found
			let newPriorityQueue: TrackFull[];
			let newPlaylistQueue: (PlaylistTrackFull | TrackFull)[];

			if (isPriorityTrack) {
				// Track is in priority queue
				// Add all tracks before the selected one to previous
				for (let i = 0; i < queueIndex; i++) {
					newPrevious.push(priorityQueue[i]);
				}
				// Remove everything up to and including the selected track from priority queue
				newPriorityQueue = priorityQueue.slice(queueIndex + 1);
				newPlaylistQueue = playlistQueue;
			} else {
				// Track is in playlist queue
				const playlistIndex = queueIndex - priorityQueue.length;
				// Add all priority queue tracks to previous
				newPrevious.push(...priorityQueue);
				// Add all playlist tracks before the selected one to previous
				for (let i = 0; i < playlistIndex; i++) {
					newPrevious.push(playlistQueue[i]);
				}
				// Clear priority queue and remove everything up to and including selected track from playlist queue
				newPriorityQueue = [];
				newPlaylistQueue = playlistQueue.slice(playlistIndex + 1);
			}

			set({
				window: {
					previous: newPrevious,
					current: selectedTrack,
					next: [],
				},
				priorityQueue: newPriorityQueue,
				playlistQueue: newPlaylistQueue,
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
					next: [],
				},
				priorityQueue: [],
				playlistQueue: chunk.slice(1).map(pt => pt.track),
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
			const {window, currentIndex, context, convexClient, priorityQueue, playlistQueue} = get();

			// Check priority queue first, then playlist queue
			let nextTrack: TrackFull | PlaylistTrackFull | null = null;
			let isPriorityTrack = false;

			if (priorityQueue.length > 0) {
				nextTrack = priorityQueue[0];
				isPriorityTrack = true;
			} else if (playlistQueue.length > 0) {
				nextTrack = playlistQueue[0];
			}

			if (nextTrack) {
				const current = window.current!;

				let audioUrl = "";
				if ("audioUrl" in nextTrack) {
					audioUrl = nextTrack.audioUrl;
				} else if ("track" in nextTrack) {
					audioUrl = nextTrack.track.audioUrl;
				}

				if (!get().hls) {
					const hlsInstance = new Hls({startFragPrefetch: true, maxBufferLength: 30});
					hlsInstance.attachMedia(audio);
					set({hls: hlsInstance});
				}

				get().hls?.loadSource(audioUrl);
				await audio.play();

				const newPriorityQueue = isPriorityTrack ? priorityQueue.slice(1) : priorityQueue;
				const newPlaylistQueue = isPriorityTrack ? playlistQueue : playlistQueue.slice(1);

				set({
					window: {
						previous: window.previous?.concat(current),
						current: nextTrack,
						next: [],
					},
					priorityQueue: newPriorityQueue,
					playlistQueue: newPlaylistQueue,
					currentIndex: currentIndex + 1,
					progress: 0,
					duration: audio.duration * 1000,
					isPlaying: true
				});

				// Load more playlist tracks if needed (check the NEW queue length)
				if (newPlaylistQueue.length <= 3 && context.type === "playlist" && context.id && convexClient) {
					const nextChunk = await convexClient.query(api.playlists.getPlaylistTracks, {
						playlistId: context.id,
						offset: currentIndex + newPlaylistQueue.length + 1,
						limit: 10
					});

					if (nextChunk.length > 0) {
						set(state => ({
							playlistQueue: [...state.playlistQueue, ...nextChunk.map(pt => pt.track)]
						}));
					}
				}
			} else {
				get().pause();
			}
		},

		previousTrack: async () => {
			const {window, currentIndex, priorityQueue, playlistQueue} = get();
			if (window.previous.length > 0) {
				const current = window.current!;
				const previous = window.previous[window.previous.length - 1];

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

				// Extract the actual track from current (it might be wrapped in PlaylistTrackFull)
				const currentAsTrack = "track" in current ? current.track : current;

				// Check if current track exists in priority queue - if so, don't add it again
				const currentTrackId = currentAsTrack._id;
				const isInPriorityQueue = priorityQueue.some(t => t._id === currentTrackId);
				const isInPlaylistQueue = playlistQueue.some(t => {
					const trackToCheck = "track" in t ? t.track : t;
					return trackToCheck._id === currentTrackId;
				});

				// Only add back to queue if it's not already there
				let newPriorityQueue = priorityQueue;
				let newPlaylistQueue = playlistQueue;

				if (!isInPriorityQueue && !isInPlaylistQueue) {
					// Add to priority queue since it was manually played
					newPriorityQueue = [currentAsTrack, ...priorityQueue];
				}

				set({
					window: {
						previous: window.previous.slice(0, -1),
						current: previous,
						next: [],
					},
					priorityQueue: newPriorityQueue,
					playlistQueue: newPlaylistQueue,
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

		addToQueue: async (id: Id<"tracks">) => {
			const convex = get().convexClient;
			const track = await convex?.query(api.tracks.get, {trackId: id});
			if (!track) throw new Error("Something went wrong");

			set(state => ({
				priorityQueue: [...state.priorityQueue, track]
			}));
		},
	}
})
