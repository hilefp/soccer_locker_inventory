import type { RouteObject } from "react-router-dom";
import { CategoryList } from "@/modules/products/pages/category-list-page";
import { ProductList } from "./pages/product-list-page";

export const productsRoutes: RouteObject = {
  path: "",
  children: [
    { path: "", element: <ProductList /> },
    { path: "categories", element: <CategoryList /> },
  ],
};
