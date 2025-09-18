"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Edit2 } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api" // adjust path if needed
import type { Id } from "../../../convex/_generated/dataModel"

export default function SongsList({ artistId }: { artistId: Id<"artist"> }) {
  const songs = useQuery(api.songs.byArtist, { artistId })

  return (
    <Card className="bg-gray-800 border-gray-700">
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
                className="flex items-center gap-4 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors group"
              >
                <img
                  src={song.image || "/placeholder.svg"}
                  alt={song.title}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-white">{song.title}</h3>
                  {/* Duration and plays aren't in schema; hardcode NA for now */}
                  <p className="text-sm text-gray-400">NA • NA plays</p>
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