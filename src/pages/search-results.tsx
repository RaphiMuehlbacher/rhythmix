"use client"

import { useParams } from "react-router"
import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import TopResult from "@/components/search/top-result"
import SongList from "@/components/search/song-list"
import SongCard from "@/components/song-card"
import ArtistCard from "@/components/search/artist-card"

export default function ResultsPage() {
  const { searchTerm } = useParams<{ searchTerm: string }>()

  // Execute search with the search term
  const searchResults = useQuery(api.search.getSearchResults, searchTerm ? { searchTerm } : "skip")

  // Fetch all tracks and artists for recommendations
  const allTracks = useQuery(api.tracks.all)
  const allArtists = useQuery(api.artists.all)

  // Determine top result to fetch artist tracks if needed
  const topResultIsTrack = searchResults && searchResults.tracks.length > 0
  const topResultIsArtist = searchResults && searchResults.artists.length > 0 && searchResults.tracks.length === 0
  const topResultArtistId = topResultIsTrack
    ? searchResults.tracks[0].artistId
    : (topResultIsArtist ? searchResults.artists[0]._id : undefined)

  // Fetch tracks by artist if top result is a track with no other search results, or if top result is an artist
  const artistTracks = useQuery(
    api.tracks.byArtist,
    topResultArtistId ? { artistId: topResultArtistId } : "skip"
  )

  // Loading state
  if (!searchTerm || searchResults === undefined || !allTracks || !allArtists) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    )
  }

  const { tracks: searchedTracks, artists: searchedArtists } = searchResults

  // No results state
  if (searchedTracks.length === 0 && searchedArtists.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
                    <h1 className="text-zinc-400">No results found for "{searchTerm}". Try a different search term.</h1>
        </div>
      </div>
    )
  }

  // Determine top result (prefer track, fallback to artist)
  const topResult = searchedTracks.length > 0 ? searchedTracks[0] : searchedArtists[0]
  const topResultType = searchedTracks.length > 0 ? "track" : "artist"

  // Get top songs for the right side
  let topSongs = searchedTracks.slice(1, 4)

  // Fill up to 3 songs with artist's tracks when top result is a track
  if (topResultType === "track" && artistTracks && topSongs.length < 3) {
    const searchedTrackIds = new Set(searchedTracks.map(t => t._id))
    const additionalArtistSongs = artistTracks
      .filter(t => !searchedTrackIds.has(t._id))
      .slice(0, 3 - topSongs.length)
      .map(track => ({
        ...track,
        artist: searchedTracks[0].artist, // Use the same artist object
      }))
    topSongs = [...topSongs, ...additionalArtistSongs]
  }
  // Special case: If top result is an artist, fill up to 3 songs (search results first, then artist's songs)
  else if (topResultType === "artist" && artistTracks && topSongs.length < 3) {
    const searchedTrackIds = new Set(searchedTracks.map(t => t._id))
    const additionalArtistSongs = artistTracks
      .filter(t => !searchedTrackIds.has(t._id))
      .slice(0, 3 - topSongs.length)
      .map(track => ({
        ...track,
        artist: searchedArtists[0], // Use the top result artist
      }))
    topSongs = [...topSongs, ...additionalArtistSongs]
  }

  // Get recommended songs (from all tracks, excluding search results)
  const searchedTrackIds = new Set(searchedTracks.map(t => t._id))
  const recommendedSongs = allTracks
    .filter((t) => !searchedTrackIds.has(t._id))
    .slice(0, 6)

  // Get recommended artists (from all artists, excluding search results)
  const searchedArtistIds = new Set(searchedArtists.map(a => a._id))
  const recommendedArtists = allArtists
    .filter((a) => !searchedArtistIds.has(a._id))
    .slice(0, 6)

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">

        {/* Top Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          {/* Top Result */}
          <div>
            <h2 className="text-white text-2xl font-bold mb-4">Top result</h2>
            <TopResult result={topResult} type={topResultType} />
          </div>

          {/* Top Songs */}
          {topSongs.length > 0 && (
            <div>
              <h2 className="text-white text-2xl font-bold mb-4">Songs</h2>
              <div className="bg-neutral-900 rounded-lg px-6 py-2 h-[200px]">
                <SongList songs={topSongs} />
              </div>
            </div>
          )}
        </div>

        {/* All Searched Artists */}
        {searchedArtists.length > 0 && (
          <div className="mb-10">
            <h2 className="text-white text-2xl font-bold mb-6">Artists</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {searchedArtists.map((artist) => (
                <ArtistCard key={artist._id} artist={artist} />
              ))}
            </div>
          </div>
        )}

        {/* All Searched Songs (beyond top 3) */}
        {searchedTracks.length > 3 && (
          <div className="mb-10">
            <h2 className="text-white text-2xl font-bold mb-6">More songs</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {searchedTracks.slice(3).map((song) => (
                <SongCard key={song._id} track={song} artist={song.artist} />
              ))}
            </div>
          </div>
        )}

        {/* Recommended Songs Section */}
        {recommendedSongs.length > 0 && (
          <div className="mb-10">
            <h2 className="text-white text-2xl font-bold mb-6">Similar songs</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recommendedSongs.map((song) => (
                <SongCard key={song._id} track={song} artist={song.artist} />
              ))}
            </div>
          </div>
        )}

        {/* Recommended Artists Section */}
        {recommendedArtists.length > 0 && (
          <div>
            <h2 className="text-white text-2xl font-bold mb-6">Similar artists</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recommendedArtists.map((artist) => (
                <ArtistCard key={artist._id} artist={artist} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
