import {Outlet} from "react-router";
import Sidebar from "@/components/sidebar/sidebar.tsx";
import Player from "@/components/player/player.tsx";
import Topbar from "@/components/topbar/topbar.tsx";

export function MainLayout() {
	return (
			<div className="w-full h-screen bg-black text-foreground flex flex-col">
				<div className="flex-1 grid grid-cols-[min-content_1fr] gap-2 p-2 pb-0 overflow-hidden">
					<Sidebar/>
					<div className="flex flex-col overflow-hidden bg-background rounded-lg">
						<Topbar/>
						<div className="flex-1 overflow-y-auto scrollbar scrollbar-track-transparent scrollbar-thumb-neutral-700">
							<Outlet/>
						</div>
					</div>
				</div>
				<Player/>
			</div>
	)
}
