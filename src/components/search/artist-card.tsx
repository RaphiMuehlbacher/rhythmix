import type { Artist } from "../../../convex/artists"

interface ArtistCardProps {
  artist: Artist
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <div className="flex flex-col p-[9px] rounded-md cursor-pointer hover:bg-neutral-800 group">
      <div className="relative">
        <img
          width={180}
          height={180}
          className="rounded-full w-full aspect-square object-cover"
          src={artist.profilePicUrl || "/placeholder.svg"}
          alt={artist.name}
        />
        <button className="hidden group-hover:flex items-center justify-center absolute bottom-2 right-2 rounded-full bg-green-500 size-12 p-2 transition-transform transform hover:scale-[1.03] duration-75">
          <svg viewBox="0 0 16 16" className="size-6 transition-transform transform hover:scale-[1.03] duration-75">
            <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path>
          </svg>
        </button>
      </div>
      <p className="font-medium text-white line-clamp-2 mt-2">{artist.name}</p>
      <p className="font-medium text-zinc-400 text-sm line-clamp-2">Artist</p>
    </div>
  )
}
