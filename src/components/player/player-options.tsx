import VolumeBar from "@/components/player/player-volume-bar.tsx";
import {usePlayerStore} from "@/stores/player-store.ts";

export default function PlayerOptions() {
	const isRightSidebarOpen = usePlayerStore(state => state.isRightSidebarOpen);
	const activeComponent = usePlayerStore(state => state.rightSidebarTab);
	const toggleRightSidebar = usePlayerStore(state => state.toggleRightSidebar);

	const handleTabClick = (tab: "CurrentTrack" | "Queue" | "Lyrics") => {
		if (isRightSidebarOpen && activeComponent === tab) {
			toggleRightSidebar();
		} else {
			toggleRightSidebar(tab);
		}
	};

	return (
			<div className="flex items-center justify-end gap-4">
				<button
						onClick={() => handleTabClick("CurrentTrack")}
						className="cursor-pointer group"
				>
					{isRightSidebarOpen && activeComponent === 'CurrentTrack' ? (
							<svg
									viewBox="0 0 16 16"
									className="size-4 group-disabled:fill-zinc-600 fill-green-500"
							>
								<path d="M11.196 8 6 5v6l5.196-3z"></path>
								<path
										d="M15.002 1.75A1.75 1.75 0 0 0 13.252 0h-10.5a1.75 1.75 0 0 0-1.75 1.75v12.5c0 .966.783 1.75 1.75 1.75h10.5a1.75 1.75 0 0 0 1.75-1.75V1.75zm-1.75-.25a.25.25 0 0 1 .25.25v12.5a.25.25 0 0 1-.25.25h-10.5a.25.25 0 0 1-.25-.25V1.75a.25.25 0 0 1 .25-.25h10.5z"></path>
							</svg>
					) : (
							<svg
									viewBox="0 0 16 16"
									className="size-4 fill-muted-foreground hover:fill-white group-disabled:fill-zinc-600"
							>
								<path d="M11.196 8 6 5v6l5.196-3z"></path>
								<path
										d="M15.002 1.75A1.75 1.75 0 0 0 13.252 0h-10.5a1.75 1.75 0 0 0-1.75 1.75v12.5c0 .966.783 1.75 1.75 1.75h10.5a1.75 1.75 0 0 0 1.75-1.75V1.75zm-1.75-.25a.25.25 0 0 1 .25.25v12.5a.25.25 0 0 1-.25.25h-10.5a.25.25 0 0 1-.25-.25V1.75a.25.25 0 0 1 .25-.25h10.5z"></path>
							</svg>
					)}
				</button>

				<button
						onClick={() => handleTabClick("Lyrics")}
						className="cursor-pointer group"
				>
					{isRightSidebarOpen && activeComponent === 'Lyrics' ? (
							<svg
									viewBox="0 0 16 16"
									className="size-4 fill-green-500 group-disabled:fill-zinc-600"
							>
								<path
										d="M13.426 2.574a2.831 2.831 0 0 0-4.797 1.55l3.247 3.247a2.831 2.831 0 0 0 1.55-4.797zM10.5 8.118l-2.619-2.62A63303.13 63303.13 0 0 0 4.74 9.075L2.065 12.12a1.287 1.287 0 0 0 1.816 1.816l3.06-2.688 3.56-3.129zM7.12 4.094a4.331 4.331 0 1 1 4.786 4.786l-3.974 3.493-3.06 2.689a2.787 2.787 0 0 1-3.933-3.933l2.676-3.045 3.505-3.99z"></path>
							</svg>
					) : (
							<svg
									viewBox="0 0 16 16"
									className="size-4 fill-muted-foreground hover:fill-white group-disabled:fill-zinc-600"
							>
								<path
										d="M13.426 2.574a2.831 2.831 0 0 0-4.797 1.55l3.247 3.247a2.831 2.831 0 0 0 1.55-4.797zM10.5 8.118l-2.619-2.62A63303.13 63303.13 0 0 0 4.74 9.075L2.065 12.12a1.287 1.287 0 0 0 1.816 1.816l3.06-2.688 3.56-3.129zM7.12 4.094a4.331 4.331 0 1 1 4.786 4.786l-3.974 3.493-3.06 2.689a2.787 2.787 0 0 1-3.933-3.933l2.676-3.045 3.505-3.99z"></path>
							</svg>
					)}
				</button>

				<button
						onClick={() => handleTabClick("Queue")}
						className="cursor-pointer group"
				>
					{isRightSidebarOpen && activeComponent === 'Queue' ? (
							<svg
									viewBox="0 0 16 16"
									className="size-4 fill-green-500 group-disabled:fill-zinc-600"
							>
								<path
										d="M15 15H1v-1.5h14V15zm0-4.5H1V9h14v1.5zm-14-7A2.5 2.5 0 0 1 3.5 1h9a2.5 2.5 0 0 1 0 5h-9A2.5 2.5 0 0 1 1 3.5zm2.5-1a1 1 0 0 0 0 2h9a1 1 0 1 0 0-2h-9z"></path>
							</svg>
					) : (
							<svg
									viewBox="0 0 16 16"
									className="size-4 fill-muted-foreground hover:fill-white group-disabled:fill-zinc-600"
							>
								<path
										d="M15 15H1v-1.5h14V15zm0-4.5H1V9h14v1.5zm-14-7A2.5 2.5 0 0 1 3.5 1h9a2.5 2.5 0 0 1 0 5h-9A2.5 2.5 0 0 1 1 3.5zm2.5-1a1 1 0 0 0 0 2h9a1 1 0 1 0 0-2h-9z"></path>
							</svg>
					)}
				</button>
				<VolumeBar/>
			</div>
	)
}
