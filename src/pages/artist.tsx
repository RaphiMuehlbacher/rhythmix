import ProfileCard from "@/components/artist/ProfileCard"
import SongUploadCard from "@/components/artist/SongUploadCard"
import SongsList from "@/components/artist/SongList.tsx";

export default function ArtistPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold">Artist Dashboard</h1>
          <p className="text-gray-400">Manage your profile and upload new music</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProfileCard />
          <SongUploadCard />
        </div>
         <SongsList/>
      </div>
    </div>
  )
}
