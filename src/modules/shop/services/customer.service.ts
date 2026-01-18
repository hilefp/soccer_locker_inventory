import { apiClient } from "@/shared/lib/api-client";
import {
  Customer,
  CustomerFilterParams,
  CustomerListResponse,
  CustomerStatus,
} from "@/modules/shop/types/customer.type";

export const customerService = {
  async getCustomers(params?: CustomerFilterParams): Promise<CustomerListResponse> {
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.emailVerified !== undefined) queryParams.append('emailVerified', params.emailVerified.toString());
      if (params.newsletter !== undefined) queryParams.append('newsletter', params.newsletter.toString());
      if (params.city) queryParams.append('city', params.city);
      if (params.state) queryParams.append('state', params.state);
      if (params.country) queryParams.append('country', params.country);
      if (params.createdFrom) queryParams.append('createdFrom', params.createdFrom);
      if (params.createdTo) queryParams.append('createdTo', params.createdTo);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    }

    const queryString = queryParams.toString();
    const url = `/admin-shop/customers${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<CustomerListResponse>(url);
    return response.data;
  },

  async getCustomer(id: string): Promise<Customer> {
    const response = await apiClient.get<Customer>(`/admin-shop/customers/${id}`);
    return response.data;
  },

  async updateCustomerStatus(id: string, status: CustomerStatus): Promise<Customer> {
    const response = await apiClient.patch<Customer>(`/admin-shop/customers/${id}/status/${status}`);
    return response.data;
  },

  async activateCustomer(id: string): Promise<Customer> {
    const response = await apiClient.patch<Customer>(`/admin-shop/customers/${id}/activate`);
    return response.data;
  },

  async deactivateCustomer(id: string): Promise<Customer> {
    const response = await apiClient.patch<Customer>(`/admin-shop/customers/${id}/deactivate`);
    return response.data;
  },

  async suspendCustomer(id: string): Promise<Customer> {
    const response = await apiClient.patch<Customer>(`/admin-shop/customers/${id}/suspend`);
    return response.data;
  },
};
