import Main from "@/components/main";
import Player from "@/components/player.tsx";
import Sidebar from "@/components/sidebar.tsx";

export default function Home() {
	return (
			<div className="w-full h-screen bg-black grid grid-rows-[12fr_1fr] grid-cols-[min-content_1fr] p-2 gap-x-2">
				<Sidebar/>
				<Main/>
				<Player/>
			</div>
	)
}

