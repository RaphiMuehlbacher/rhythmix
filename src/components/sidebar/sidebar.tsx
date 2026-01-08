import {api} from "../../../convex/_generated/api";
import CreatePlaylistButton from "@/components/playlist/create-playlist-button.tsx";
import {useQuery} from "convex/react";
import SidebarPlaylist from "@/components/sidebar/sidebar-playlist.tsx";

export default function Sidebar() {
	const playlists = useQuery(api.playlists.getAllByUser);

	if (!playlists) return <h1>Loading...</h1>

	return (
			<div
					className="bg-background rounded-lg w-xs p-2 overflow-y-auto scrollbar scrollbar-track-transparent scrollbar-thumb-neutral-700">
				<div className="flex flex-col">
					<div className="relative flex justify-between items-center px-5 py-4">
						<button className="text-foreground text-md font-bold">
							Your Library
						</button>
						<CreatePlaylistButton/>
					</div>
					{playlists.map(playlist => <SidebarPlaylist playlist={playlist} key={playlist._id}/>)}
				</div>
			</div>
	);
}