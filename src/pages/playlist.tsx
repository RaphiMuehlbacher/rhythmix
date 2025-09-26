import {useParams} from "react-router";
import {useQuery} from "convex/react";
import {api} from "../../convex/_generated/api";
import type {Id} from "../../convex/_generated/dataModel";

export default function Playlist() {
	const {playlistId} = useParams();

	const playlist = useQuery(api.playlists.get, {id: playlistId as Id<"playlists">});
	const tracks = useQuery(api.playlists.getPlaylistTracks, playlist ? {playlistId: playlist._id} : "skip");

	if (!playlist || !tracks) return <h1>Loading...</h1>

	return <div className="bg-background rounded-lg">
		<div className="flex items-end gap-6">
			{playlist.name}
		</div>
	</div>
}
