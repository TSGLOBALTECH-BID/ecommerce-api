// src/lib/services/category.service.ts
import { createClient } from '@supabase/supabase-js';
import { Category, CreateCategoryPayload } from '../entities/category.entity';
import { supabase } from '../supabase';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// const supabase = createClient(supabaseUrl, supabaseKey);

export class CategoryService {
  static async createCategory(payload: CreateCategoryPayload) {
    // Check if slug already exists
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', payload.slug)
      .maybeSingle();

    if (existing) {
      throw new Error('A category with this slug already exists');
    }

    // If parent_id is provided, verify it exists
    if (payload.parent_category_id) {
      const { data: parent } = await supabase
        .from('categories')
        .select('category_id')
        .eq('category_id', payload.parent_category_id)
        .single();

      if (!parent) {
        throw new Error('Parent category not found');
      }
    }

    // console.log('........',payload);

    // Create the category
    const { data: category, error } = await supabase
      .from('categories')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }

    // console.log('........>>>',category);
    return category;
  }

  // Other methods can be added here (get, update, delete, etc.)
}