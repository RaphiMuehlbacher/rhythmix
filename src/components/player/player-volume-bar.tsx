import React, {useEffect, useState} from "react";
import {usePlayer} from "@/context/player-context.tsx";

export default function VolumeBar() {
	const {volume, setVolume} = usePlayer();
	const [lastVolume, setLastVolume] = useState(0);
	const [dragVolume, setDragVolume] = useState<number | null>(null);
	const displayVolume = dragVolume ?? volume;

	useEffect(() => {
		if (dragVolume === null) return;

		const handleMouseMove = (e: MouseEvent) => {
			const newPosition = calculateNewVolume(e.clientX);
			setDragVolume(newPosition);
			setVolume(newPosition);
		};

		const handleMouseUp = () => {
			setDragVolume(null);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [dragVolume]);

	const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
		e.preventDefault();
		const newVolume = calculateNewVolume(e.clientX);
		setDragVolume(newVolume);
		setVolume(newVolume);
	};

	const calculateNewVolume = (clientX: number): number => {
		const barElement = document.querySelector('.volume-bar');
		if (!barElement) return 0;

		const barRect = barElement.getBoundingClientRect();
		const offsetX = clientX - barRect.left;
		return Math.round(Math.min(Math.max(0, (offsetX / barRect.width) * 100), 100));
	};

	const handleMuteClick = () => {
		if (volume > 0) {
			setLastVolume(volume);
			setVolume(0);
		} else {
			setVolume(lastVolume);
		}
	};

	return (
			<div className="flex items-center gap-2 group">
				<button onClick={handleMuteClick}>
					{volume > 0 ? (
							<svg viewBox="0 0 16 16" className="size-4 fill-zinc-200">
								<path
										d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 6.087a4.502 4.502 0 0 0 0-8.474v1.65a2.999 2.999 0 0 1 0 5.175v1.649z"></path>
							</svg>
					) : (
							<svg viewBox="0 0 16 16" className="size-4 fill-zinc-200">
								<path
										d="M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z"></path>
								<path
										d="M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-1.906a4.73 4.73 0 0 1-1.5-.694v1.3L2.817 9.852a2.141 2.141 0 0 1-.781-2.92c.187-.324.456-.594.78-.782l5.8-3.35v1.3c.45-.313.956-.55 1.5-.694V1.5z"></path>
							</svg>
					)}
				</button>

				<div
						className="relative w-26 h-1 bg-zinc-600 rounded-lg group volume-bar"
						onMouseDown={handleMouseDown}
				>
					<div className="absolute -top-2 -bottom-2 left-0 right-0"/>
					<div
							className={`absolute top-0 left-0 h-full rounded-lg ${dragVolume !== null ? 'bg-green-500' : 'bg-white group-hover:bg-green-500'}`}
							style={{width: `${displayVolume}%`}}
					></div>
					<div
							className={`absolute top-[-4px] size-3 bg-white rounded-full cursor-pointer group-hover:block ${dragVolume ?? 'hidden'}`}
							style={{
								left: `${displayVolume}%`,
								transform: 'translateX(-50%)',
							}}

					></div>
					<div
							className="absolute h-3 -top-1 bg-transparent"
							onMouseDown={handleMouseDown}
					></div>
				</div>
			</div>
	);
};
