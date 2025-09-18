"use client";

import { useQuery } from "convex/react";
import ArtistForm from "@/components/artist/ArtistForm";
import { api } from "../../../convex/_generated/api";
import type {Id} from "../../../convex/_generated/dataModel";

export default function ProfileCard({ artistId }: { artistId: string }) {
  const artistData = useQuery(api.artist.getArtist, { id: artistId as Id<"artist"> });
  if (!artistData) return <p>Loading artist...</p>;

  return (
    <div className="bg-neutral-900 border-neutral-800 p-6 rounded-lg">
    <h2 className="text-white text-xl font-bold">Artist Profile</h2>
    <ArtistForm defaultValues={artistData} />
  </div>
  );
}
