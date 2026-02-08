import { useRoutes } from "react-router-dom";
import type { RouteObject } from "react-router-dom";

export function RenderRouteTree({ route }: { route: RouteObject }) {
  return useRoutes([route]);
}
