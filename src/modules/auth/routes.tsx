import type { RouteObject } from "react-router-dom";
import { BrandedLayout } from "@/layout/branded";
import { LoginPage } from "./pages/login-page";
import { ResetPasswordPage } from "./pages/forgot-password-page";
import { GuestRoute } from "./components/guest-route";

export const authRoutes: RouteObject = {
  path: "",
  element: <GuestRoute />,
  children: [
    {
      path: "",
      element: <BrandedLayout />,
      children: [
        { path: "login", element: <LoginPage /> },
        { path: "forgot-password", element: <ResetPasswordPage /> },
      ],
    },
  ],
};