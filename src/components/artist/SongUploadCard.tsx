import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Music } from "lucide-react"
import SongForm from "@/components/artist/SongForm"

export default function SongUploadCard() {
  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Music className="w-5 h-5" />
          Upload New Song
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SongForm />
      </CardContent>
    </Card>
  )
}
