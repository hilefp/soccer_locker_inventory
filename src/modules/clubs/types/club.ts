export interface Club {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  personInCharge?: string | null;
  personInChargeEmail?: string | null;
  personInChargePhone?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClubDto {
  name: string;
  description?: string;
  imageUrl?: string;
  logoUrl?: string;
  websiteUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  personInCharge?: string;
  personInChargeEmail?: string;
  personInChargePhone?: string;
  isActive?: boolean;
}

export interface UpdateClubDto {
  name?: string;
  description?: string;
  imageUrl?: string;
  logoUrl?: string;
  websiteUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  personInCharge?: string;
  personInChargeEmail?: string;
  personInChargePhone?: string;
  isActive?: boolean;
}
