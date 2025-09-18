import PlayerSongInfo from "@/components/player/player-song-info.tsx";
import PlayerMain from "@/components/player/player-main.tsx";
import PlayerOptions from "@/components/player/player-options.tsx";

export default function Player() {
	return (
			<div className="col-span-3 flex justify-between items-center px-1">
				<PlayerSongInfo/>
				<PlayerMain/>
				<PlayerOptions/>
			</div>
	)
}