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
	progress: number,
	duration: number,
	playTrack: (url: string) => void;
	pause: () => void;
	resume: () => void;
	togglePlay: () => void;
	seek: (ms: number) => void;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({children}: { children: React.ReactNode }) {
	const audioRef = useRef<HTMLAudioElement>(new Audio());
	const hlsRef = useRef<Hls | null>(null);

	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		hlsRef.current = new Hls({
			startFragPrefetch: true,
			maxBufferLength: 30,
		});
		hlsRef.current.attachMedia(audioRef.current);

		const handleTimeUpdate = () => {
			setProgress(audioRef.current.currentTime * 1000);
		}

		audioRef.current.addEventListener("timeupdate", handleTimeUpdate);

		return () => {
			hlsRef.current?.destroy();
			audioRef.current.pause();
			audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
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

	const togglePlay = () => {
		if (isPlaying) {
			pause();
		} else {
			resume();
		}
	}

	const seek = (ms: number) => {
		audioRef.current.currentTime = ms / 1000;
		setProgress(ms);
	}

	return (
			<PlayerContext.Provider
					value={{
						isPlaying,
						playTrack,
						pause,
						resume,
						togglePlay,
						progress: progress,
						duration: audioRef.current.duration * 1000,
						seek,
					}}
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
