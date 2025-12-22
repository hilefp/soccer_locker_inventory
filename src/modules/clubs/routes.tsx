import { RouteObject } from "react-router-dom";
import { ClubListPage } from "./pages/club-list-page";
import { ClubDetailPage } from "./pages/club-detail-page";
import { ClubEditPage } from "./pages/club-edit-page";

export const clubsRoutes: RouteObject = {
  path: "",
  children: [
    {
      path: "",
      element: <ClubListPage />,
    },
    {
      path: ":clubId",
      element: <ClubDetailPage />,
    },
    {
      path: ":clubId/edit",
      element: <ClubEditPage />,
    },
  ],
};
