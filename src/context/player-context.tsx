import React, {
	createContext,
	useContext,
	useRef,
	useState,
	useEffect,
} from "react";
import Hls from "hls.js";

type PlayerContextType = {
	isPlaying: boolean;
	playTrack: (url: string) => void;
	pause: () => void;
	resume: () => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({children}: { children: React.ReactNode }) {
	const audioRef = useRef<HTMLAudioElement>(new Audio());
	const hlsRef = useRef<Hls | null>(null);

	const [isPlaying, setIsPlaying] = useState(false);

	useEffect(() => {
		hlsRef.current = new Hls({
			startFragPrefetch: true,
			maxBufferLength: 30,
		});
		hlsRef.current.attachMedia(audioRef.current);

		return () => {
			hlsRef.current?.destroy();
			audioRef.current.pause();
		};
	}, []);

	const playTrack = (url: string) => {
		if (!hlsRef.current) return;
		hlsRef.current.loadSource(url);

		audioRef.current.play();
		setIsPlaying(true);
	}

	const pause = () => {
		audioRef.current.pause();
		setIsPlaying(false);
	}

	const resume = () => {
		audioRef.current.play();
		setIsPlaying(true);
	}

	return (
			<PlayerContext.Provider
					value={{isPlaying, playTrack, pause, resume}}
			>
				{children}
			</PlayerContext.Provider>
	);
}

export function usePlayer() {
	const ctx = useContext(PlayerContext);
	if (!ctx) throw new Error("usePlayer must be used inside <PlayerProvider>");
	return ctx;
}
