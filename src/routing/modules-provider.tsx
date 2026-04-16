import { Suspense } from 'react';
import { DefaultLayout } from '@/layout/DefaultLayout';
import { AllStock } from '@/pages/all-stock/page';
import { CategoryDetails } from '@/pages/category-details/page';
import { CreateCategoryPage } from '@/pages/create-category/page';
import { CreateProductPage } from '@/pages/create-product/page';
import { CreateShippingLabelPage } from '@/pages/create-shipping-label/page';
import { CurrentStock } from '@/pages/current-stock/page';
import { CustomerListDetails } from '@/pages/customer-list-details/page';
import { CustomerList } from '@/pages/customer-list/page';
import { EditCategoryPage } from '@/pages/edit-category/page';
import { EditProductPage } from '@/pages/edit-product/page';
import { InboundStock } from '@/pages/inbound-stock/page';
import { ManageVariantsPage } from '@/pages/manage-variants/page';
import { OrderDetailsPage } from '@/pages/order-detials/page';
import { OrderListProducts } from '@/pages/order-list-products/page';
import { OrderList } from '@/pages/order-list/page';
import { OrderTrackingPage } from '@/pages/order-tracking/page';
import { OutboundStock } from '@/pages/outbound-stock/page';
import { PerProductStockPage } from '@/pages/per-product-stock/page';
import { ProductDetailsPage } from '@/pages/product-details/page';
import { ProductInfoPage } from '@/pages/product-info/page';
import { SettingsModal } from '@/pages/settings-modal/page';
import { StockPlanner } from '@/pages/stock-planner/page';
import { TrackShippingPage } from '@/pages/track-shipping/page';
import { Route, Routes } from 'react-router-dom';
import { ScreenLoader } from '@/shared/components/screen-loader';
import { authRoutes } from '@/modules/auth/routes';
import { productsRoutes } from '@/modules/products/routes';
import { inventoryRoutes } from '@/modules/inventory/routes';
import { settingsRoutes } from '@/modules/settings/routes';
import { clubsRoutes } from '@/modules/clubs/routes';
import { RenderRouteTree } from '@/shared/lib/router-helper';
import { ProtectedRoute } from '@/modules/auth/components/protected-route';
import { AuthRedirect } from './AuthRedirect';
import { dashboardRoutes } from '@/modules/dashboard/route';
import { reportsRoutes } from '@/modules/reports/routes';
import { shopRoutes } from '@/modules/shop/routes';
import { ordersRoutes } from '@/modules/orders/routes';
import { tagsRoutes } from '@/modules/tags/routes';
import { catalogsRoutes } from '@/modules/catalogs/routes';

export function ModulesProvider() {
  return (
    <Routes>
      <Route
        path="/*"
        element={
          <Suspense fallback={<ScreenLoader />}>
            <Routes>
              <Route path="auth/*" element={<RenderRouteTree route={authRoutes} />} />
              <Route index element={<AuthRedirect />} />
              <Route path="login" element={<AuthRedirect />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DefaultLayout />}>
                  <Route element={<ProtectedRoute allowedPermissions={['products:read']} />}>
                    <Route path="products/*" element={<RenderRouteTree route={productsRoutes} />} />
                  </Route>
                  <Route element={<ProtectedRoute allowedPermissions={['stock:read']} />}>
                    <Route path="inventory/*" element={<RenderRouteTree route={inventoryRoutes} />} />
                  </Route>
                  <Route element={<ProtectedRoute allowedPermissions={['users:manage']} />}>
                    <Route path="settings/*" element={<RenderRouteTree route={settingsRoutes} />} />
                  </Route>
                  <Route element={<ProtectedRoute allowedPermissions={['clubs:read']} />}>
                    <Route path="clubs/*" element={<RenderRouteTree route={clubsRoutes} />} />
                  </Route>
                  <Route element={<ProtectedRoute allowedPermissions={['tags:read']} />}>
                    <Route path="tags/*" element={<RenderRouteTree route={tagsRoutes} />} />
                  </Route>
                  <Route path="dashboard/*" element={<RenderRouteTree route={dashboardRoutes} />} />
                  <Route element={<ProtectedRoute allowedPermissions={['reports:read']} />}>
                    <Route path="reports/*" element={<RenderRouteTree route={reportsRoutes} />} />
                  </Route>
                  <Route element={<ProtectedRoute allowedPermissions={['users:read']} />}>
                    <Route path="shop/*" element={<RenderRouteTree route={shopRoutes} />} />
                  </Route>
                  <Route element={<ProtectedRoute allowedPermissions={['orders:read']} />}>
                    <Route path="orders/*" element={<RenderRouteTree route={ordersRoutes} />} />
                  </Route>
                  <Route element={<ProtectedRoute allowedPermissions={['catalogs:read']} />}>
                    <Route path="catalogs/*" element={<RenderRouteTree route={catalogsRoutes} />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </Suspense>
        }
      />
    </Routes>
  );
}
