import {Outlet} from "react-router";
import Sidebar from "@/components/sidebar.tsx";
import Player from "@/components/player/player.tsx";

export function MainLayout() {
	return (
			<div
					className="w-full h-screen bg-black text-foreground grid grid-rows-[12fr_1fr] grid-cols-[min-content_1fr] p-2 pb-0 gap-x-2">
				<Sidebar/>
				<Outlet/>
				<Player/>
			</div>
	)
}
