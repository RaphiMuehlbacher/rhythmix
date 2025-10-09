import { Link, useNavigate } from "react-router";
import { Music, Settings, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import SearchDropdown from "./search-dropdown";

const SEARCH_DEBOUNCE_MS = 300;
const MAX_DROPDOWN_TRACKS = 2;
const MAX_DROPDOWN_ARTISTS = 1;

export default function Topbar() {
	const [searchTerm, setSearchTerm] = useState("");
	const [showDropdown, setShowDropdown] = useState(false);
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(-1);

	const searchRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchTerm);
			setSelectedIndex(-1);
		}, SEARCH_DEBOUNCE_MS);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	const searchResults = useQuery(
		api.search.getSearchResults,
		debouncedSearch.length > 0 ? { searchTerm: debouncedSearch } : "skip"
	);

	useEffect(() => {
		const hasResults = debouncedSearch.length > 0 && searchResults;
		setShowDropdown(hasResults);
	}, [debouncedSearch, searchResults]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
				setShowDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		const handleGlobalKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key === "k") {
				event.preventDefault();
				inputRef.current?.focus();
			}
		};

		document.addEventListener("keydown", handleGlobalKeyDown);
		return () => document.removeEventListener("keydown", handleGlobalKeyDown);
	}, []);

	const getTotalResultsCount = () => {
		if (!searchResults) return 0;
		return Math.min(searchResults.tracks.length, MAX_DROPDOWN_TRACKS) + Math.min(searchResults.artists.length, MAX_DROPDOWN_ARTISTS);
	};

	const navigateToSelectedResult = () => {
		if (!searchResults) return;

		const topTracks = searchResults.tracks.slice(0, MAX_DROPDOWN_TRACKS);
		const topArtists = searchResults.artists.slice(0, MAX_DROPDOWN_ARTISTS);

		if (selectedIndex < topTracks.length) {
			const selectedTrack = topTracks[selectedIndex];
			navigate(`/search/${encodeURIComponent(selectedTrack.title)}`);
		} else {
			const artistIndex = selectedIndex - topTracks.length;
			const selectedArtist = topArtists[artistIndex];
			navigate(`/search/${encodeURIComponent(selectedArtist.name)}`);
		}
		closeSearch();
	};

	const closeSearch = () => {
		setShowDropdown(false);
		setSearchTerm("");
		setSelectedIndex(-1);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const totalResults = getTotalResultsCount();

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				setSelectedIndex((prev) => Math.min(prev + 1, totalResults - 1));
				break;

			case "ArrowUp":
				e.preventDefault();
				setSelectedIndex((prev) => Math.max(prev - 1, -1));
				break;

			case "Enter":
				if (selectedIndex >= 0 && totalResults > 0) {
					navigateToSelectedResult();
				} else if (searchTerm.trim().length > 0) {
					navigate(`/search/${encodeURIComponent(searchTerm)}`);
					closeSearch();
				}
				break;

			case "Escape":
				setShowDropdown(false);
				inputRef.current?.blur();
				break;
		}
	};

	return (
		<div className="px-6 py-3 flex items-center gap-4 border-b border-neutral-800/50">
			<Link
				to="/"
				className="flex items-center hover:opacity-80 transition-opacity shrink-0"
				aria-label="Home"
			>
				<Music className="size-6 text-primary" />
			</Link>

			<div className="max-w-lg w-full relative" ref={searchRef}>
				<div className="relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500 pointer-events-none" />
					<input
						ref={inputRef}
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Search for songs or artists..."
						className="w-full pl-10 pr-4 py-1.5 bg-neutral-900 rounded-full text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
						aria-label="Search"
					/>
				</div>

				{showDropdown && searchResults && (
					<SearchDropdown
						tracks={searchResults.tracks}
						artists={searchResults.artists}
						onClose={closeSearch}
						selectedIndex={selectedIndex}
					/>
				)}
			</div>

			<div className="ml-auto">
				<button
					className="flex items-center hover:opacity-80 transition-opacity shrink-0"
					aria-label="Settings"
				>
					<Settings className="size-5 text-neutral-400 hover:text-neutral-200 transition-colors" />
				</button>
			</div>
		</div>
	);
}
