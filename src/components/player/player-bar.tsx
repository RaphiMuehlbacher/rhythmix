import React, {useEffect, useState} from "react";

const PlayerMusicBar = () => {
	const duration = 224_000;

	const [position, setPosition] = useState(0);
	const [isDragging, setIsDragging] = useState(false);

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (isDragging) {
				const newPosition = calculateNewPosition(e.clientX);
				setPosition(newPosition);
			}
		};

		const handleMouseUp = (e: MouseEvent) => {
			if (isDragging) {
				const newPosition = calculateNewPosition(e.clientX);
				setPosition(newPosition);
				setIsDragging(false);
			}
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [isDragging]);

	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		setIsDragging(true);
		const newPosition = calculateNewPosition(e.clientX);
		setPosition(newPosition);
	};

	const msToMinutesAndSeconds = (ms: number) => {
		const minutes: number = Math.floor(ms / 60000);
		const seconds: number = Math.floor((ms % 60000) / 1000);
		return seconds === 60
				? minutes + 1 + ':00'
				: minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
	};

	const calculateNewPosition = (clientX: number): number => {
		const barElement = document.querySelector('.progress-bar');
		if (!barElement) return 0;

		const barRect = barElement.getBoundingClientRect();
		const offsetX = clientX - barRect.left;
		const progressRatio = Math.min(Math.max(0, offsetX / barRect.width), 1);
		return progressRatio * duration;
	};

	const calculateWidth = () => {
		return (position / duration) * 100;
	};

	return (
			<div className="flex items-center gap-2">
				<p className="text-zinc-400 text-[13px] relative top-[-2px]">
					{msToMinutesAndSeconds(position)}
				</p>
				<div
						className="relative w-[32vw] h-1 bg-zinc-600 rounded-lg group progress-bar"
						onMouseDown={handleMouseDown}
						style={{position: 'relative'}}
				>
					<div className="absolute -top-1 -bottom-1 left-0 right-0"/>

					<div
							className={`absolute top-0 left-0 h-full rounded-lg group-hover:bg-green-500 ${
									isDragging ? 'bg-green-500' : 'bg-white'
							}`}
							style={{width: `${calculateWidth()}%`}}
					></div>
					<div
							className={`absolute top-[-4px] w-3 h-3 bg-white rounded-full cursor-pointer ${
									isDragging ? '' : 'hidden group-hover:block'
							}`}
							style={{
								left: `${calculateWidth()}%`,
								transform: 'translateX(-50%)',
							}}
					></div>
				</div>
				<p className="text-zinc-400 text-[13px] relative top-[-2px]">
					{msToMinutesAndSeconds(duration)}
				</p>
			</div>
	);
};

export default PlayerMusicBar;
