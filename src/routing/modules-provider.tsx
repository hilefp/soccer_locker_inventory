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
import { Dashboard } from '@/pages/dashboard/page';
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
import { ProductList } from '@/modules/products/pages/product-list-page';
import { SettingsModal } from '@/pages/settings-modal/page';
import { StockPlanner } from '@/pages/stock-planner/page';
import { TrackShippingPage } from '@/pages/track-shipping/page';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ScreenLoader } from '@/shared/components/screen-loader';
import { authRoutes } from '@/modules/auth/routes';
import { productsRoutes } from '@/modules/products/routes';
import { inventoryRoutes } from '@/modules/inventory/routes';
import { RenderRouteTree } from '@/shared/lib/router-helper';
import { ProtectedRoute } from '@/modules/auth/components/protected-route';
import { AuthRedirect } from './AuthRedirect';

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
                  <Route path="products/*" element={<RenderRouteTree route={productsRoutes} />} />
                  <Route path="inventory/*" element={<RenderRouteTree route={inventoryRoutes} />} />
                  <Route path="dashboard" element={<Dashboard />} />
                <Route path="dark-sidebar" element={<Dashboard />} />
                <Route path="all-stock" element={<AllStock />} />
                <Route path="current-stock" element={<CurrentStock />} />
                <Route path="inbound-stock" element={<InboundStock />} />
                <Route path="outbound-stock" element={<OutboundStock />} />
                <Route path="stock-planner" element={<StockPlanner />} />
                <Route
                  path="product-details"
                  element={<ProductDetailsPage />}
                />
                <Route path="create-product" element={<CreateProductPage />} />
                <Route path="edit-product" element={<EditProductPage />} />
                <Route
                  path="per-product-stock"
                  element={<PerProductStockPage />}
                />
                <Route path="track-shipping" element={<TrackShippingPage />} />
                <Route path="product-info" element={<ProductInfoPage />} />
                <Route path="customer-list" element={<CustomerList />} />
                <Route
                  path="customer-list-details"
                  element={<CustomerListDetails />}
                />
                <Route path="settings-modal" element={<SettingsModal />} />
                <Route
                  path="create-shipping-label"
                  element={<CreateShippingLabelPage />}
                />
                <Route
                  path="manage-variants"
                  element={<ManageVariantsPage />}
                />
                <Route
                  path="create-category"
                  element={<CreateCategoryPage />}
                />
                <Route path="edit-category" element={<EditCategoryPage />} />
                <Route path="category-details" element={<CategoryDetails />} />
                <Route path="order-list" element={<OrderList />} />
                <Route
                  path="order-list-products"
                  element={<OrderListProducts />}
                />
                <Route path="order-details" element={<OrderDetailsPage />} />
                <Route path="order-tracking" element={<OrderTrackingPage />} />
                <Route path="customer-list" element={<CustomerList />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        }
      />
    </Routes>
  );
}
