import {useEffect} from "react";
import {useConvex} from "convex/react";
import {usePlayerStore} from "@/stores/player-store.ts";

export default function PlayerStoreInjector() {
	const convex = useConvex();

	useEffect(() => {
		usePlayerStore.getState().setConvexClient(convex);
	}, [convex]);

	return null;
}