import {
	Navigate,
	Route,
	RouterProvider,
	createBrowserRouter,
	createRoutesFromElements,
} from "react-router-dom";
import Error from "./pages/Error/Error";
import GameAdd from "./pages/Game/Add";
import GameList from "./pages/Game/List";
import Root from "./pages/Root/Root";

export default function App() {
	const router = createBrowserRouter(
		createRoutesFromElements(
			<Route path="/" element={<Root />} errorElement={<Error />}>
				<Route errorElement={<Error />}>
					<Route path="games">
						<Route index element={<GameList />}  />
						<Route path="add" element={<GameAdd />} />
					</Route>
					<Route index element={<Navigate replace={true} to="games" />} />
				</Route>
			</Route>,
		),
		{
			basename: import.meta.env.BASE_URL,
		},
	);

	return <RouterProvider router={router} />;
}
