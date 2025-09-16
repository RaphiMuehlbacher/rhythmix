import {Route, Routes} from "react-router";
import Home from "@/pages/home.tsx";
import Login from "@/pages/login.tsx";
import SignUp from "@/pages/sign-up.tsx";
import {ProtectedRoute} from "./components/protected-route";

export default function App() {
	return (
			<Routes>
				<Route path="/" element={<ProtectedRoute><Home/></ProtectedRoute>}/>
				<Route path="/login" element={<Login/>}/>
				<Route path="/sign-up" element={<SignUp/>}/>
			</Routes>
	)
}

