import type { TrackFull } from "../../../convex/tracks"
import type { Artist } from "../../../convex/artists"
import { usePlayerStore } from "@/stores/player-store"

interface TopResultProps {
  result: TrackFull | Artist
  type: "track" | "artist"
}

export default function TopResult({ result, type }: TopResultProps) {
  const playTrack = usePlayerStore(state => state.playTrack);
  const pause = usePlayerStore(state => state.pause);
  const resume = usePlayerStore(state => state.resume);
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const currentTrackId = usePlayerStore(state => state.window.current?._id);

  const isTrack = type === "track"
  const title = isTrack ? (result as TrackFull).title : (result as Artist).name
  const subtitle = isTrack ? (result as TrackFull).artist.name : "Artist"
  const image = isTrack ? (result as TrackFull).coverUrl : (result as Artist).profilePicUrl

  const correctTrack = isTrack && currentTrackId === result._id;

  const handleClick = async () => {
    if (!isTrack) return;

    if (isPlaying && correctTrack) {
      pause();
    } else if (correctTrack) {
      resume();
    } else {
      await playTrack(result._id);
    }
  }

  return (
    <div className="bg-neutral-900 rounded-lg px-6 py-2 hover:bg-neutral-800 cursor-pointer group transition-colors flex items-center h-[200px]">
      <div className="flex items-center gap-6 w-full">
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className={`w-32 h-32 ${isTrack ? "rounded-lg" : "rounded-full"} object-cover shadow-lg flex-shrink-0`}
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-white text-3xl font-bold mb-2 line-clamp-2">{title}</h2>
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-neutral-800 text-white text-xs px-2 py-1 rounded-full">{type === "track" ? "Track" : "Artist"}</span>
            <span className="text-zinc-400">{subtitle}</span>
          </div>
          {isTrack && (
          <button
            onClick={handleClick}
            className="bg-green-500 hover:bg-green-400 hover:scale-105 text-black font-semibold px-8 py-3 rounded-full transition-all"
          >
            <svg className="w-5 h-5 inline mr-2" fill="currentColor" viewBox="0 0 16 16">
              {isPlaying && correctTrack ? (
                <path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z" />
              ) : (
                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
              )}
            </svg>
            {isPlaying && correctTrack ? "Pause" : "Play"}
          </button>
        )}
        </div>
      </div>
    </div>
  )
}
