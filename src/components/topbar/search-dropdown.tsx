import { Link } from "react-router";
import { Music, User } from "lucide-react";

type SearchResult = {
	_id: string;
	title?: string;
	name?: string;
	coverUrl?: string;
	profilePicUrl?: string;
	artist?: {
		name: string;
	};
};
type SearchDropdownProps = {
	tracks: SearchResult[];
	artists: SearchResult[];
	onClose: () => void;
	selectedIndex: number;
};
export default function SearchDropdown({ tracks, artists, onClose, selectedIndex }: SearchDropdownProps) {
	const topTracks = tracks.slice(0, 2);
	const topArtist = artists.slice(0, 1);
	const allResults = [...topTracks, ...topArtist];
	if (allResults.length === 0) {
		return (
			<div className="absolute top-full left-0 right-0 mt-2 bg-neutral-800 rounded-lg shadow-xl overflow-hidden z-50">
				<div className="p-4 text-neutral-400 text-sm">No results found</div>
			</div>
		);
	}

	return (
		<div className="absolute top-full left-0 right-0 mt-2 bg-neutral-800 rounded-lg shadow-xl overflow-hidden z-50">
			<div className="py-2">
				{topTracks.map((track, index) => (
					<Link
						key={track._id}
						to={`/search/${encodeURIComponent(track.title || '')}`}
						onClick={onClose}
						className={`flex items-center gap-3 px-4 py-2 hover:bg-neutral-700 transition-colors ${
							selectedIndex === index ? 'bg-neutral-700' : ''
						}`}
					>
						{track.coverUrl ? (
							<img
								src={track.coverUrl}
								alt={track.title}
								className="size-10 rounded object-cover"
							/>
						) : (
							<div className="flex items-center justify-center size-10 bg-neutral-900 rounded">
								<Music className="size-5 text-neutral-400" />
							</div>
						)}
						<div className="flex-1 min-w-0">
							<div className="text-sm font-medium text-white truncate">{track.title}</div>
							<div className="text-xs text-neutral-400 truncate">{track.artist?.name}</div>
						</div>
					</Link>
				))}
				{topArtist.map((artist, index) => (
					<Link
						key={artist._id}
						to={`/search/${encodeURIComponent(artist.name || '')}`}
						onClick={onClose}
						className={`flex items-center gap-3 px-4 py-2 hover:bg-neutral-700 transition-colors ${
							selectedIndex === topTracks.length + index ? 'bg-neutral-700' : ''
						}`}
					>
						{artist.profilePicUrl ? (
							<img
								src={artist.profilePicUrl}
								alt={artist.name}
								className="size-10 rounded-full object-cover"
							/>
						) : (
							<div className="flex items-center justify-center size-10 bg-neutral-900 rounded-full">
								<User className="size-5 text-neutral-400" />
							</div>
						)}
						<div className="flex-1 min-w-0">
							<div className="text-sm font-medium text-white truncate">{artist.name}</div>
							<div className="text-xs text-neutral-400">Artist</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}


