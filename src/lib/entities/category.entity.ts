// src/lib/entities/category.entity.ts
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id: string | null;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Virtual fields (not stored in DB)
  children?: Category[];
  parent?: Category;
}

// For creating a new category
export interface CreateCategoryPayload {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  image_url?: string;
  is_active?: boolean;
}