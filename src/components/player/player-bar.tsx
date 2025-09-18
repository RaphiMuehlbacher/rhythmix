import React, {useEffect, useState} from "react";
import {usePlayer} from "../../context/player-context";

export default function PlayerMusicBar() {
	const {progress, seek, duration} = usePlayer();

	const [dragPosition, setDragPosition] = useState<number | null>(null);
	const displayPosition = dragPosition ?? progress;
	const progressPercent = (displayPosition / duration) * 100;

	useEffect(() => {
		if (dragPosition === null) return;
		const handleMouseMove = (e: MouseEvent) => {
			setDragPosition(calculateNewPosition(e.clientX));
		};

		const handleMouseUp = (e: MouseEvent) => {
			const newPos = calculateNewPosition(e.clientX);
			setDragPosition(null);
			seek(newPos);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [dragPosition, seek]);

	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		setDragPosition(calculateNewPosition(e.clientX));
	};

	const msToMinutesAndSeconds = (ms: number) => {
		const minutes = Math.floor(ms / 60000);
		const seconds = Math.floor((ms % 60000) / 1000);
		return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
	}

	const calculateNewPosition = (clientX: number): number => {
		const barElement = document.querySelector('.progress-bar');
		if (!barElement) return 0;

		const barRect = barElement.getBoundingClientRect();
		const offsetX = clientX - barRect.left;
		const progressRatio = Math.min(Math.max(0, offsetX / barRect.width), 1);
		return progressRatio * duration;
	};

	return (
			<div className="flex items-center gap-2">
				<p className="text-zinc-400 text-[13px] relative top-[-2px]">
					{msToMinutesAndSeconds(displayPosition)}
				</p>
				<div
						className="relative w-[32vw] h-1 bg-zinc-600 rounded-lg group progress-bar"
						onMouseDown={handleMouseDown}
						style={{position: 'relative'}}
				>
					<div className="absolute -top-1 -bottom-1 left-0 right-0"/>

					<div
							className={`absolute top-0 left-0 h-full rounded-lg group-hover:bg-green-500 ${
									dragPosition !== null ? 'bg-green-500' : 'bg-white'
							}`}
							style={{width: `${progressPercent}%`}}
					></div>
					<div
							className={`absolute top-[-4px] w-3 h-3 bg-white rounded-full cursor-pointer ${
									dragPosition !== null ? '' : 'hidden group-hover:block'
							}`}
							style={{
								left: `${progressPercent}%`,
								transform: 'translateX(-50%)',
							}}
					></div>
				</div>
				<p className="text-zinc-400 text-[13px] relative top-[-2px]">
				</p>
			</div>
	);
};

