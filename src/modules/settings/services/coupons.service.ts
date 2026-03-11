import { apiClient } from '@/shared/lib/api-client';
import type { Coupon, CreateCouponDto, UpdateCouponDto } from '../types';

const BASE_URL = '/inventory/coupons';

export const couponsService = {
  async getAll(): Promise<Coupon[]> {
    const response = await apiClient.get<{ data: Coupon[] }>(BASE_URL);
    return response.data.data;
  },

  async getById(id: string): Promise<Coupon> {
    const response = await apiClient.get<Coupon>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async create(data: CreateCouponDto): Promise<Coupon> {
    const response = await apiClient.post<Coupon>(BASE_URL, data);
    return response.data;
  },

  async update(id: string, data: UpdateCouponDto): Promise<Coupon> {
    const response = await apiClient.put<Coupon>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};
