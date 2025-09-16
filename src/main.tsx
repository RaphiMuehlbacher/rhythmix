import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {ConvexReactClient} from "convex/react";
import {ConvexAuthProvider} from "@convex-dev/auth/react";
import {BrowserRouter} from "react-router";
import {PlayerProvider} from "@/context/player-context.tsx";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById('root')!).render(
		<StrictMode>
			<BrowserRouter>
				<ConvexAuthProvider client={convex}>
					<PlayerProvider>
						<App/>
					</PlayerProvider>
				</ConvexAuthProvider>
			</BrowserRouter>
		</StrictMode>,
)
