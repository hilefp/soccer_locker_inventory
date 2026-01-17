import { RouteObject } from "react-router-dom";
import { ClubListPage } from "./pages/club-list-page";
import { ClubDetailPage } from "./pages/club-detail-page";
import { ClubEditPage } from "./pages/club-edit-page";
import { EditClubProductPage } from "./pages/edit-club-product-page";

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
    {
      path: ":clubId/products/:clubProductId/edit",
      element: <EditClubProductPage />,
    },
  ],
};
