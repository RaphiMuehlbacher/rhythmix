import { Link } from "react-router";
import { Music, Settings } from "lucide-react";

export default function Topbar() {
	return (
		<div className="px-6 py-3 flex items-center gap-4 border-b border-neutral-800/50">
			<Link to="/" className="flex items-center hover:opacity-80 transition-opacity shrink-0">
				<Music className="size-6 text-primary" />
			</Link>

						<div className="max-w-lg w-full">
				<input
					type="text"
					placeholder="Search for songs or artists..."
					className="w-full px-4 py-1.5 bg-neutral-900 rounded-full text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
					disabled
				/>
			</div>

			<div className="ml-auto">
				<button className="flex items-center hover:opacity-80 transition-opacity shrink-0">
					<Settings className="size-5 text-neutral-400 hover:text-neutral-200 transition-colors" />
				</button>
			</div>
		</div>
	);
}
