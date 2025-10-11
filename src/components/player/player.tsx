import PlayerSongInfo from "@/components/player/player-song-info.tsx";
import PlayerMain from "@/components/player/player-main.tsx";
import PlayerOptions from "@/components/player/player-options.tsx";
import {useEffect} from "react";
import {usePlayerStore} from "@/stores/player-store.ts";

export default function Player() {
	const togglePlay = usePlayerStore(state => state.togglePlay);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.code === "Space") {
				const active = document.activeElement as HTMLElement | null;
				const isTyping =
						active?.tagName === "INPUT" ||
						active?.tagName === "TEXTAREA" ||
						active?.isContentEditable;

				if (!isTyping) {
					event.preventDefault();
					togglePlay();
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [togglePlay]);

	return (
			<div className="col-span-3 flex justify-between items-center px-2 py-2">
				<PlayerSongInfo/>
				<PlayerMain/>
				<PlayerOptions/>
			</div>
	)
}