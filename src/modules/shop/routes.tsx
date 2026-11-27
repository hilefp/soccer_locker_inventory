import type { RouteObject } from "react-router-dom";
import { CustomerListPage } from "./pages/customer-list-page";
import { CustomerDetailPage } from "./pages/customer-detail-page";
import { EmailCampaignListPage } from "./pages/email-campaign-list-page";
import { EmailCampaignDetailPage } from "./pages/email-campaign-detail-page";

export const shopRoutes: RouteObject = {
  path: "",
  children: [
    { path: "", element: <CustomerListPage /> },
    { path: "customers", element: <CustomerListPage /> },
    { path: "customers/:customerId", element: <CustomerDetailPage /> },
    { path: "email-campaigns", element: <EmailCampaignListPage /> },
    { path: "email-campaigns/:campaignId", element: <EmailCampaignDetailPage /> },
  ],
};
