export interface ProductAttribute {
  id: string;
  name: string;
  description?: string;
  type: string;
  values: string[];
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductAttributeRequest {
  name: string;
  description?: string;
  type: string;
  values: string[];
  isRequired?: boolean;
}
