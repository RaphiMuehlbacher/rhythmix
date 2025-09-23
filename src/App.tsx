import {Route, Routes} from "react-router";
import Home from "@/pages/home.tsx";
import Login from "@/pages/login.tsx";
import SignUp from "@/pages/sign-up.tsx";
import {ProtectedRoute} from "@/components/protected-route";
import PlayerStoreInjector from "@/components/player-store-injector.tsx";
import Artist from "@/pages/artist.tsx";

export default function App() {
	return (
			<>
				<PlayerStoreInjector/>
				<Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/artist" element={<ProtectedRoute><Artist /></ProtectedRoute>}/>

					<Route path="/login" element={<Login/>}/>
					<Route path="/sign-up" element={<SignUp/>}/>
				</Routes>
			</>
	)
}

