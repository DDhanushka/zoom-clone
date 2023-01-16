import React from "react";
import Room from "./Room";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Room />,
	},
	{
		path: "/:roomUrl",
		element: <Room />,
	},
]);

const App = () => {
	return (
		<>
			<RouterProvider router={router} />
		</>
	);
};

export default App;
