// src/lib/types/category.types.ts
import { z } from 'zod';

// Base category schema for responses
export const categoryResponseSchema = z.object({
  category_id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  parent_category_id: z.string().uuid().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  is_active: z.boolean(),
  created_at: z.date().or(z.string()), // Handles both Date object and ISO string
  updated_at: z.date().or(z.string()).nullable().optional(),
});

// Type for TypeScript
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;

// Wrapped response (for your suggested format)
export const wrappedCategoryResponseSchema = z.object({
  category: categoryResponseSchema
});

export type WrappedCategoryResponse = z.infer<typeof wrappedCategoryResponseSchema>;

// Response for multiple categories
export const categoriesResponseSchema = z.object({
  categories: z.array(categoryResponseSchema),
  // total: z.number().int().nonnegative(),
  // page: z.number().int().positive().optional(),
  // limit: z.number().int().positive().optional(),
  // total_pages: z.number().int().nonnegative().optional()
});

export type CategoriesResponse = z.infer<typeof categoriesResponseSchema>;

// export type WrappedCategoriesResponse = z.infer<typeof categoriesResponseSchema>;