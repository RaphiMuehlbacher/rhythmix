export default function PlayerSongInfo() {
	const imageUrl = "https://i.scdn.co/image/ab67616d00001e02bef362b164cb7ebc1b1d8eb7";
	const title = "Airwaves";
	const artist = "Pashanim";

	return (
			<div className="flex items-center justify-start gap-3 ml-1">
				<img className="size-15 rounded" src={imageUrl}
						 alt={title}/>
				<div>
					<p className="text-[15px]">{title}</p>
					<p className="text-xs font-semibold text-zinc-400 line-clamp-1">{artist}</p>
				</div>
			</div>
	)
}
