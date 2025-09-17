import {useAuthActions} from "@convex-dev/auth/react";

export default function Sidebar() {
	const {signOut} = useAuthActions();

	return (
			<div className="bg-primary rounded-lg w-sm">
				<div>Sidebar</div>
				<button onClick={() => void signOut()}>Sign Out</button>
			</div>
	);
}