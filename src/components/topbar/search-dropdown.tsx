import { Link } from "react-router";
import { Music, User } from "lucide-react";

const MAX_PREVIEW_TRACKS = 2;
const MAX_PREVIEW_ARTISTS = 1;
const IMAGE_SIZE = "size-10";

interface SearchResult {
	_id: string;
	title?: string;
	name?: string;
	coverUrl?: string;
	profilePicUrl?: string;
	artist?: {
		name: string;
	};
}

interface SearchDropdownProps {
	tracks: SearchResult[];
	artists: SearchResult[];
	onClose: () => void;
	selectedIndex: number;
}

export default function SearchDropdown({
	tracks,
	artists,
	onClose,
	selectedIndex
}: SearchDropdownProps) {
	const topTracks = tracks.slice(0, MAX_PREVIEW_TRACKS);
	const topArtists = artists.slice(0, MAX_PREVIEW_ARTISTS);
	const hasResults = topTracks.length > 0 || topArtists.length > 0;

	if (!hasResults) {
		return (
			<div className="absolute top-full left-0 right-0 mt-2 bg-neutral-800 rounded-lg shadow-xl overflow-hidden z-50">
				<div className="p-4 text-neutral-400 text-sm text-center">
					No results found
				</div>
			</div>
		);
	}

	const isSelected = (index: number) => selectedIndex === index;

	return (
		<div className="absolute top-full left-0 right-0 mt-2 bg-neutral-800 rounded-lg shadow-xl overflow-hidden z-50">
			<div className="py-2">
				{topTracks.map((track, index) => (
					<Link
						key={track._id}
						to={`/search/${encodeURIComponent(track.title || '')}`}
						onClick={onClose}
						className={`flex items-center gap-3 px-4 py-2 hover:bg-neutral-700 transition-colors ${
							isSelected(index) ? 'bg-neutral-700' : ''
						}`}
					>
						{track.coverUrl ? (
							<img
								src={track.coverUrl}
								alt={track.title || 'Track cover'}
								className={`${IMAGE_SIZE} rounded object-cover`}
							/>
						) : (
							<div className={`flex items-center justify-center ${IMAGE_SIZE} bg-neutral-900 rounded`}>
								<Music className="size-5 text-neutral-400" />
							</div>
						)}
						<div className="flex-1 min-w-0">
							<div className="text-sm font-medium text-white truncate">
								{track.title}
							</div>
							<div className="text-xs text-neutral-400 truncate">
								{track.artist?.name || 'Unknown Artist'}
							</div>
						</div>
					</Link>
				))}

				{topArtists.map((artist, index) => {
					const globalIndex = topTracks.length + index;
					return (
						<Link
							key={artist._id}
							to={`/search/${encodeURIComponent(artist.name || '')}`}
							onClick={onClose}
							className={`flex items-center gap-3 px-4 py-2 hover:bg-neutral-700 transition-colors ${
								isSelected(globalIndex) ? 'bg-neutral-700' : ''
							}`}
						>
							{artist.profilePicUrl ? (
								<img
									src={artist.profilePicUrl}
									alt={artist.name || 'Artist profile'}
									className={`${IMAGE_SIZE} rounded-full object-cover`}
								/>
							) : (
								<div className={`flex items-center justify-center ${IMAGE_SIZE} bg-neutral-900 rounded-full`}>
									<User className="size-5 text-neutral-400" />
								</div>
							)}
							<div className="flex-1 min-w-0">
								<div className="text-sm font-medium text-white truncate">
									{artist.name}
								</div>
								<div className="text-xs text-neutral-400">Artist</div>
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
