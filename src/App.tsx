import {Route, Routes} from "react-router";
import MainContent from "@/pages/main-content.tsx";
import Login from "@/pages/login.tsx";
import SignUp from "@/pages/sign-up.tsx";
import {ProtectedRoute} from "@/components/protected-route";
import PlayerStoreInjector from "@/components/player-store-injector.tsx";
import Artist from "@/pages/artist.tsx";
import {MainLayout} from "@/components/main-layout.tsx";
import Playlists from "@/pages/playlists.tsx";
import Playlist from "@/pages/playlist.tsx";

export default function App() {
	return (
			<>
				<PlayerStoreInjector/>
				<Routes>
					<Route element={<ProtectedRoute/>}>
						<Route element={<MainLayout/>}>
							<Route index element={<MainContent/>}/>
							<Route path="playlists" element={<Playlists/>}/>
							<Route path="playlists/:playlistId" element={<Playlist/>}/>
						</Route>
					</Route>

					<Route path="/artist-dashboard" element={<ProtectedRoute/>}>
						<Route index element={<Artist/>}/>
					</Route>

					<Route path="/login" element={<Login/>}/>
					<Route path="/sign-up" element={<SignUp/>}/>
				</Routes>
			</>
	)
}

