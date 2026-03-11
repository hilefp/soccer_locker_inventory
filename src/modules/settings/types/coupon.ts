export enum CouponType {
  FREE_SHIPPING = 'FREE_SHIPPING',
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: CouponType;
  shippingMethod: string | null;
  isActive: boolean;
  validFrom: string | null;
  validTo: string | null;
  maxUses: number | null;
  currentUses: number;
  clubId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponDto {
  code: string;
  description?: string;
  type: CouponType;
  shippingMethod?: string;
  isActive?: boolean;
  validFrom?: string;
  validTo?: string;
  maxUses?: number;
  clubId?: string;
}

export interface UpdateCouponDto {
  code?: string;
  description?: string;
  type?: CouponType;
  shippingMethod?: string;
  isActive?: boolean;
  validFrom?: string | null;
  validTo?: string | null;
  maxUses?: number | null;
  clubId?: string | null;
}
