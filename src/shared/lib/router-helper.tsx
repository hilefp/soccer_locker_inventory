import { Route, Routes } from "react-router-dom";
import type { RouteObject } from "react-router-dom";

export function RenderRouteTree({ route }: { route: RouteObject }) {
  return (
    <Routes>
      <Route path={route.path} element={route.element}>
        {renderChildren(route.children)}
      </Route>  
    </Routes>
  );
}

function renderChildren(children?: RouteObject[]) {
  if (!children) return null;
  return children.map((r, i) => {
    const key = r.path ?? (r.index ? `index-${i}` : `auto-${i}`);

    // index route
    if (r.index) {
      return <Route key={key} index element={r.element} />;
    }

    // normal route (con recursividad)
    return (
      <Route key={key} path={r.path} element={r.element}>
        {renderChildren(r.children)}
      </Route>
    );
  });
}
