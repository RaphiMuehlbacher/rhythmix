import {useAuthActions} from "@convex-dev/auth/react";
import {useMutation} from "convex/react";
import {api} from "../../convex/_generated/api";
import CreatePlaylistButton from "@/components/playlist/create-playlist-button.tsx";

export default function Sidebar() {
	const {signOut} = useAuthActions();
	const createPlaylist = useMutation(api.playlists.create);

	return (
			<div className="bg-background rounded-lg w-sm">
				<div>Sidebar</div>
				<button onClick={() => void signOut()}>Sign Out</button>
				<CreatePlaylistButton/>
			</div>
	);
}