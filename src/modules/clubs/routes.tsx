import { RouteObject } from "react-router-dom";
import { ClubListPage } from "./pages/club-list-page";
import { ClubDetailPage } from "./pages/club-detail-page";
import { ClubEditPage } from "./pages/club-edit-page";
import { EditClubProductPage } from "./pages/edit-club-product-page";
import { GroupProductListPage } from "./pages/group-product-list-page";
import { GroupProductCreatePage } from "./pages/group-product-create-page";
import { GroupProductEditPage } from "./pages/group-product-edit-page";
import { PackageListPage } from "./pages/package-list-page";
import { PackageCreatePage } from "./pages/package-create-page";
import { PackageEditPage } from "./pages/package-edit-page";

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
    // Group Products (variant grouping for display)
    {
      path: ":clubId/groups",
      element: <GroupProductListPage />,
    },
    {
      path: ":clubId/groups/create",
      element: <GroupProductCreatePage />,
    },
    {
      path: ":clubId/groups/:groupId/edit",
      element: <GroupProductEditPage />,
    },
    // Packages (true product bundles)
    {
      path: ":clubId/packages",
      element: <PackageListPage />,
    },
    {
      path: ":clubId/packages/create",
      element: <PackageCreatePage />,
    },
    {
      path: ":clubId/packages/:packageId/edit",
      element: <PackageEditPage />,
    },
  ],
};
