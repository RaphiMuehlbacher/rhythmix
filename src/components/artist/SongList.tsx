import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Edit2 } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"

export default function SongsList() {
  const artist = useQuery(api.artist.getArtistByCurrentUser);
  if (!artist) throw new Error("not authenticated");

  const songs = useQuery(api.songs.byArtist, {artistId: artist._id});

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-white">Your Songs</CardTitle>
        <p className="text-gray-400">Manage your uploaded tracks</p>
      </CardHeader>
      <CardContent>
        {!songs && <p className="text-gray-400">Loading songs…</p>}
        {songs?.length === 0 && <p className="text-gray-400">No songs yet.</p>}

        {songs && songs.length > 0 && (
          <div className="space-y-3">
            {songs.map((song) => (
              <div
                key={song._id}
                className="flex items-center gap-4 p-3 rounded-lg bg-neutral-800/50 hover:bg-neutral-800 transition-colors group"
              >
                <img
                  src={song.coverUrl || "/placeholder.svg"}
                  alt={song.title}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-white">{song.title}</h3>
                  <p className="text-sm text-gray-400">
                    {Math.floor(song.duration / 1000 / 60)}:
                    {String(Math.round((song.duration / 1000) % 60)).padStart(2, "0")} • NA plays
                  </p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}