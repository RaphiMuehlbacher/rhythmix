import MainContent from "@/components/main-content.tsx";
import Player from "@/components/player/player.tsx";
import Sidebar from "@/components/sidebar.tsx";

export default function Home() {
	return (
			<div
					className="w-full h-screen bg-black text-white grid grid-rows-[12fr_1fr] grid-cols-[min-content_1fr] p-2 pb-0 gap-x-2">
				<Sidebar/>
				<MainContent/>
				<Player/>
			</div>
	)
}

