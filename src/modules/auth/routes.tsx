import type { RouteObject } from "react-router-dom";
import { BrandedLayout } from "@/layout/branded";
import { LoginPage } from "./pages/LoginPage";
import { ResetPasswordPage } from "./pages/ForgotPasswordPage";

export const authRoutes: RouteObject = {
  path: "",
  element: <BrandedLayout />,
  children: [
    { path: "login", element: <LoginPage /> },
    { path: "forgot-password", element: <ResetPasswordPage /> },
  ],
};