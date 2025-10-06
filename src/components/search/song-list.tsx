import type { TrackFull } from "../../../convex/tracks"
import { usePlayerStore } from "@/stores/player-store"
import { Play, Pause } from "lucide-react"

interface SongListProps {
  songs: TrackFull[]
}

export default function SongList({ songs }: SongListProps) {
  const currentTrack = usePlayerStore(state => state.window.current);
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const playTrack = usePlayerStore(state => state.playTrack);
  const pause = usePlayerStore(state => state.pause);
  const resume = usePlayerStore(state => state.resume);

  const handlePlay = async (trackId: string) => {
    const trackIsSelected = currentTrack?._id === trackId;

    if (isPlaying && trackIsSelected) {
      pause();
    } else if (trackIsSelected) {
      resume();
    } else {
      await playTrack(trackId);
    }
  }

  const formatTrackDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const paddedSeconds = seconds.toString().padStart(2, '0');
    return `${minutes}:${paddedSeconds}`;
  }

  return (
    <div className="space-y-1">
      {songs.map((song, index) => {
        const trackIsSelected = currentTrack?._id === song._id;

        return (
          <div
            key={song._id}
            className="grid grid-cols-[16px_1fr_40px] gap-4 px-4 py-2 hover:bg-muted/50 rounded-md group transition-colors"
          >
            <div className="flex items-center justify-center text-muted-foreground">
              <button
                className="cursor-pointer"
                onClick={() => handlePlay(song._id)}
              >
                <span
                  className={`group-hover:hidden text-sm font-semibold ${trackIsSelected ? 'text-green-500' : ''}`}
                >
                  {index + 1}
                </span>
                <span className="hidden group-hover:block text-foreground">
                  {isPlaying && trackIsSelected ? <Pause size={18} /> : <Play size={18} />}
                </span>
              </button>
            </div>

            <div className="flex items-center min-w-0 gap-3">
              <img src={song.coverUrl} alt="" className="size-11 rounded" />
              <div className="min-w-0">
                <div className={`font-medium truncate ${trackIsSelected ? 'text-green-500' : ''}`}>
                  {song.title}
                </div>
                <div className="text-sm text-muted-foreground truncate">{song.artist.name}</div>
              </div>
            </div>

            <div className="flex items-center justify-center text-muted-foreground text-sm">
              {formatTrackDuration(song.duration)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
