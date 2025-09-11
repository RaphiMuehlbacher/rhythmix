import Main from "@/components/main";
import Player from "@/components/player.tsx";
import Sidebar from "@/components/sidebar.tsx";
import {PlayerProvider} from "@/context/player-context.tsx";

export default function App() {
	return (
			<PlayerProvider>
				<div className="w-full h-screen bg-black grid grid-rows-[12fr_1fr] grid-cols-[min-content_1fr] p-2 gap-x-2">
					<Sidebar/>
					<Main/>
					<Player/>
				</div>
			</PlayerProvider>
	)
}

