export default function SongCard({name, artist, image}: { name: string, artist: string, image: string }) {
	return (
			<div
					className={
						'flex flex-col p-[9px] rounded-md cursor-pointer hover:bg-neutral-800'
					}
			>
				<img width={300} height={300} className={'rounded-lg width-full'} src={image} alt={name}/>
				<p className={'font-[490] text-white line-clamp-2 mt-2'}>{name}</p>
				<p className={'text-zinc-400 text-sm line-clamp-2'}>{artist}</p>
			</div>
	);
}