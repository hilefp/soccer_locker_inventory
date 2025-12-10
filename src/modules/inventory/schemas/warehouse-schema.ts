import { z } from 'zod';
import { WarehouseType } from '../types/warehouse.types';

export const getCreateWarehouseSchema = () => {
  return z.object({
    code: z.string().min(1, 'Code is required'),
    name: z.string().min(1, 'Name is required'),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    warehouseType: z.nativeEnum(WarehouseType).refine(
      (value) => value !== undefined,
      { message: 'Warehouse type is required' }
    ),
    isActive: z.boolean().default(true),
    managerId: z.string().uuid().optional().or(z.literal('')),
    capacity: z.number().positive('Capacity must be positive').optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  });
};

export const getUpdateWarehouseSchema = () => {
  return z.object({
    name: z.string().min(1, 'Name is required').optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    warehouseType: z.nativeEnum(WarehouseType).optional(),
    managerId: z.string().uuid().optional().or(z.literal('')),
    capacity: z.number().positive('Capacity must be positive').optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    isActive: z.boolean().optional(),
  });
};

export type CreateWarehouseSchemaType = z.infer<ReturnType<typeof getCreateWarehouseSchema>>;
export type UpdateWarehouseSchemaType = z.infer<ReturnType<typeof getUpdateWarehouseSchema>>;
