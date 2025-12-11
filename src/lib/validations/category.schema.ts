// src/lib/validations/category.schema.ts
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(100, 'Slug must be less than 100 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly (lowercase, numbers, hyphens)'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  parent_category_id: z.string().uuid('Invalid parent category ID').nullable().optional(),
  image_url: z.string().url('Invalid URL format').optional().or(z.literal('')),
  is_active: z.boolean().default(true).optional(),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;