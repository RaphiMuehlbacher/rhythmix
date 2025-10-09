"use client";

import { useParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import TopResult from "@/components/search/top-result";
import SongList from "@/components/song-list";
import SongCard from "@/components/song-card";
import ArtistCard from "@/components/artist-card";

const MAX_TOP_SONGS = 3;
const MAX_RECOMMENDED_SONGS = 6;
const MAX_RECOMMENDED_ARTISTS = 6;
const MIN_SONGS_FOR_MORE_SECTION = 4;

export default function SearchResultsPage() {
	const { searchTerm } = useParams<{ searchTerm: string }>();

	const searchResults = useQuery(
		api.search.getSearchResults,
		searchTerm ? { searchTerm } : "skip"
	);

	const allTracks = useQuery(api.tracks.all);
	const allArtists = useQuery(api.artists.all);

	const topResultIsTrack = searchResults && searchResults.tracks.length > 0;
	const topResultIsArtist = searchResults && searchResults.artists.length > 0 && searchResults.tracks.length === 0;
	const topResultArtistId = topResultIsTrack
		? searchResults.tracks[0].artistId
		: topResultIsArtist
		? searchResults.artists[0]._id
		: undefined;

	const artistTracks = useQuery(
		api.tracks.byArtist,
		topResultArtistId ? { artistId: topResultArtistId } : "skip"
	);

	if (!searchTerm || searchResults === undefined || !allTracks || !allArtists) {
		return (
			<div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
				<p className="text-zinc-400">Loading...</p>
			</div>
		);
	}

	const { tracks: searchedTracks, artists: searchedArtists } = searchResults;
	const hasNoResults = searchedTracks.length === 0 && searchedArtists.length === 0;

	if (hasNoResults) {
		return (
			<div className="min-h-screen bg-black text-white p-6">
				<div className="max-w-7xl mx-auto">
					<h1 className="text-zinc-400 text-xl">
						No results found for "{searchTerm}". Try a different search term.
					</h1>
				</div>
			</div>
		);
	}

	const topResult = searchedTracks.length > 0 ? searchedTracks[0] : searchedArtists[0];
	const topResultType = searchedTracks.length > 0 ? "track" : "artist";

	const getTopSongs = () => {
		let songs = searchedTracks.slice(1, MAX_TOP_SONGS + 1);

		if (artistTracks && songs.length < MAX_TOP_SONGS) {
			const searchedTrackIds = new Set(searchedTracks.map((t) => t._id));
			const additionalTracks = artistTracks
				.filter((t) => !searchedTrackIds.has(t._id))
				.slice(0, MAX_TOP_SONGS - songs.length)
				.map((track) => ({
					...track,
					artist: topResultType === "track" ? searchedTracks[0].artist : searchedArtists[0],
				}));
			songs = [...songs, ...additionalTracks];
		}

		return songs;
	};

	const topSongs = getTopSongs();

	const getRecommendations = () => {
		const searchedTrackIds = new Set(searchedTracks.map((t) => t._id));
		const searchedArtistIds = new Set(searchedArtists.map((a) => a._id));

		const recommendedSongs = allTracks
			.filter((t) => !searchedTrackIds.has(t._id))
			.slice(0, MAX_RECOMMENDED_SONGS);

		const recommendedArtists = allArtists
			.filter((a) => !searchedArtistIds.has(a._id))
			.slice(0, MAX_RECOMMENDED_ARTISTS);

		return { recommendedSongs, recommendedArtists };
	};

	const { recommendedSongs, recommendedArtists } = getRecommendations();

	return (
		<div className="min-h-screen bg-background text-white p-6">
			<div className="max-w-7xl mx-auto">
				<div className="grid lg:grid-cols-2 gap-6 mb-10">
					<section>
						<h2 className="text-white text-2xl font-bold mb-4">Top result</h2>
						<TopResult result={topResult} type={topResultType} />
					</section>

					{topSongs.length > 0 && (
						<section>
							<h2 className="text-white text-2xl font-bold mb-4">Songs</h2>
							<div className="bg-neutral-900 rounded-lg px-6 py-2 h-[200px]">
								<SongList songs={topSongs} />
							</div>
						</section>
					)}
				</div>

				{searchedArtists.length > 0 && (
					<section className="mb-10">
						<h2 className="text-white text-2xl font-bold mb-6">Artists</h2>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
							{searchedArtists.map((artist) => (
								<ArtistCard key={artist._id} artist={artist} />
							))}
						</div>
					</section>
				)}

				{searchedTracks.length >= MIN_SONGS_FOR_MORE_SECTION && (
					<section className="mb-10">
						<h2 className="text-white text-2xl font-bold mb-6">More songs</h2>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
							{searchedTracks.slice(MAX_TOP_SONGS).map((song) => (
								<SongCard key={song._id} track={song} artist={song.artist} />
							))}
						</div>
					</section>
				)}

				{recommendedSongs.length > 0 && (
					<section className="mb-10">
						<h2 className="text-white text-2xl font-bold mb-6">Similar songs</h2>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
							{recommendedSongs.map((song) => (
								<SongCard key={song._id} track={song} artist={song.artist} />
							))}
						</div>
					</section>
				)}

				{recommendedArtists.length > 0 && (
					<section>
						<h2 className="text-white text-2xl font-bold mb-6">Similar artists</h2>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
							{recommendedArtists.map((artist) => (
								<ArtistCard key={artist._id} artist={artist} />
							))}
						</div>
					</section>
				)}
			</div>
		</div>
	);
}
