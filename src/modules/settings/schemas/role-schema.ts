import { z } from 'zod';

export const getRoleSchema = () => {
  return z.object({
    name: z.string().min(1, 'Role name is required'),
    description: z.string().optional(),
  });
};

export type RoleSchemaType = z.infer<ReturnType<typeof getRoleSchema>>;
