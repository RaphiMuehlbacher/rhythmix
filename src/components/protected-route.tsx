import {Navigate} from "react-router";
import {useConvexAuth} from "convex/react";
import React from "react";

export function ProtectedRoute({children}: { children: React.ReactNode }) {
	const {isAuthenticated, isLoading} = useConvexAuth();

	if (isLoading) return <div>Loading...</div>;

	if (!isAuthenticated) return <Navigate to="/login" replace/>;

	return children;
}
