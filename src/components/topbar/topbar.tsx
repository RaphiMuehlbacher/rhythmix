import { Link, useNavigate } from "react-router";
import { Music, Settings, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import SearchDropdown from "./search-dropdown";

export default function Topbar() {
	const [searchTerm, setSearchTerm] = useState("");
	const [showDropdown, setShowDropdown] = useState(false);
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const searchRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	// Debounce search term
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchTerm);
			setSelectedIndex(-1); // Reset selection when search changes
		}, 300);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	// Fetch search results
	const searchResults = useQuery(
		api.search.getSearchResults,
		debouncedSearch.length > 0 ? { searchTerm: debouncedSearch } : "skip"
	);

	// Show dropdown when we have results
	useEffect(() => {
		if (debouncedSearch.length > 0 && searchResults) {
			setShowDropdown(true);
		} else {
			setShowDropdown(false);
		}
	}, [debouncedSearch, searchResults]);

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
				setShowDropdown(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Global keyboard shortcut for Ctrl+K
	useEffect(() => {
		function handleGlobalKeyDown(event: KeyboardEvent) {
			if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
				event.preventDefault();
				inputRef.current?.focus();
			}
		}

		document.addEventListener("keydown", handleGlobalKeyDown);
		return () => document.removeEventListener("keydown", handleGlobalKeyDown);
	}, []);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!searchResults) return;

		const totalResults = Math.min(searchResults.tracks.length, 2) + Math.min(searchResults.artists.length, 1);

		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex((prev) => (prev < totalResults - 1 ? prev + 1 : prev));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
		} else if (e.key === "Enter") {
			if (selectedIndex >= 0 && totalResults > 0) {
				// Navigate to selected item
				const topTracks = searchResults.tracks.slice(0, 2);
				const topArtist = searchResults.artists.slice(0, 1);

				if (selectedIndex < topTracks.length) {
					const selectedTrack = topTracks[selectedIndex];
					navigate(`/search/${encodeURIComponent(selectedTrack.title)}`);
				} else {
					const artistIndex = selectedIndex - topTracks.length;
					const selectedArtist = topArtist[artistIndex];
					navigate(`/search/${encodeURIComponent(selectedArtist.name)}`);
				}
				handleClose();
			} else if (searchTerm.trim().length > 0) {
				// Navigate to search results page with current search term
				setShowDropdown(false);
				navigate(`/search/${encodeURIComponent(searchTerm)}`);
			}
		} else if (e.key === "Escape") {
			setShowDropdown(false);
			inputRef.current?.blur();
		}
	};

	const handleClose = () => {
		setShowDropdown(false);
		setSearchTerm("");
		setSelectedIndex(-1);
	};

	return (
		<div className="px-6 py-3 flex items-center gap-4 border-b border-neutral-800/50">
			<Link to="/" className="flex items-center hover:opacity-80 transition-opacity shrink-0">
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
					/>
				</div>
				{showDropdown && searchResults && (
					<SearchDropdown
						tracks={searchResults.tracks}
						artists={searchResults.artists}
						onClose={handleClose}
						selectedIndex={selectedIndex}
					/>
				)}
			</div>

			<div className="ml-auto">
				<button className="flex items-center hover:opacity-80 transition-opacity shrink-0">
					<Settings className="size-5 text-neutral-400 hover:text-neutral-200 transition-colors" />
				</button>
			</div>
		</div>
	);
}
