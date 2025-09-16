import {Route, Routes} from "react-router";
import Home from "@/pages/home.tsx";
import Login from "@/pages/login.tsx";
import SignUp from "@/pages/sign-up.tsx";

export default function App() {
	return (
			<Routes>
				<Route path="/" element={<Home/>}/>
				<Route path="/login" element={<Login/>}/>
				<Route path="/sign-up" element={<SignUp/>}/>
			</Routes>
	)
}

