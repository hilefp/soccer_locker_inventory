import { RouteObject } from "react-router-dom";
import { ClubListPage } from "./pages/club-list-page";

export const clubsRoutes: RouteObject = {
  path: "",
  children: [
    {
      path: "",
      element: <ClubListPage />,
    },
  ],
};
