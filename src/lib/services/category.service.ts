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

  static async updateCategory(id: string, payload: Partial<CreateCategoryPayload>) {
    // Check if category exists
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('*')
      .eq('category_id', id)
      .single();

    if (!existingCategory) {
      throw new Error('Category not found');
    }

    // If slug is being updated, check for duplicates
    if (payload.slug && payload.slug !== existingCategory.slug) {
      const { data: duplicate } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', payload.slug)
        .neq('category_id', id)
        .maybeSingle();

      if (duplicate) {
        throw new Error('A category with this slug already exists');
      }
    }

    // If parent_id is provided and different from current, verify it exists and doesn't create a circular reference
    if (payload.parent_category_id !== undefined && 
        payload.parent_category_id !== existingCategory.parent_category_id) {
      
      // Prevent setting a category as its own parent
      if (payload.parent_category_id === id) {
        throw new Error('A category cannot be its own parent');
      }

      // Check if parent exists
      if (payload.parent_category_id) {
        const { data: parent } = await supabase
          .from('categories')
          .select('category_id')
          .eq('category_id', payload.parent_category_id)
          .single();

        if (!parent) {
          throw new Error('Parent category not found');
        }

        // Check for circular reference (child becoming parent of its ancestor)
        let currentParentId = payload.parent_category_id;
        while (currentParentId) {
          if (currentParentId === id) {
            throw new Error('Cannot create circular category reference');
          }
          const { data: parent } = await supabase
            .from('categories')
            .select('parent_category_id')
            .eq('category_id', currentParentId)
            .single();
          currentParentId = parent?.parent_category_id;
        }
      }
    }

    // Update the category
    const { data: updatedCategory, error } = await supabase
      .from('categories')
      .update({
        ...payload,
        // updated_at: new Date().toISOString()
      })
      .eq('category_id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }

    return updatedCategory;
  }
}