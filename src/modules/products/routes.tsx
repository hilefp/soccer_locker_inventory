import type { RouteObject } from "react-router-dom";
import { CategoryList } from "@/modules/products/pages/category-list-page";

export const productsRoutes: RouteObject = {
  path: "",
  children: [
    { path: "category-list", element: <CategoryList /> },
  ],
};
