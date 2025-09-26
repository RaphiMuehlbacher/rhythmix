import {Navigate, Outlet} from "react-router";
import {useConvexAuth} from "convex/react";

export function ProtectedRoute() {
	const {isAuthenticated, isLoading} = useConvexAuth();

	if (isLoading) return <div>Loading...</div>;

	if (!isAuthenticated) return <Navigate to="/login" replace/>;

	return <Outlet/>;
}