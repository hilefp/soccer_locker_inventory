import type { RouteObject } from "react-router-dom";
import { CategoryList } from "@/modules/products/pages/category-list-page";
import { ProductList } from "./pages/product-list-page";
import { ProductFormPage } from "./pages/product-form-page";
import { ProductDetailPage } from "./pages/product-detail-page";
import { VariantDetailPage } from "./pages/variant-detail-page";
import { BrandList } from "./pages/brand-list-page";
import { AttributeList } from "./pages/attribute-list-page";

export const productsRoutes: RouteObject = {
  path: "",
  children: [
    { path: "", element: <ProductList /> },
    { path: "new", element: <ProductFormPage /> },
    { path: ":productId", element: <ProductDetailPage /> },
    { path: ":productId/edit", element: <ProductFormPage /> },
    { path: ":productId/variants/:variantId", element: <VariantDetailPage /> },
    { path: "categories", element: <CategoryList /> },
    { path: "brands", element: <BrandList /> },
    { path: "attributes", element: <AttributeList /> },
  ],
};
