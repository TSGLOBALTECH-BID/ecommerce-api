// src/lib/dtos/category.dto.ts
import { CategoriesResponse, categoryResponseSchema, WrappedCategoryResponse } from '@/types/respose/category-response';
import { CreateCategoryPayload } from '../entities/category.entity';
import { CreateCategoryDto } from '../validations/category.schema';

export class CategoryDto {
  static toEntity(dto: CreateCategoryDto): CreateCategoryPayload {
    return {
      name: dto.name.trim(),
      slug: dto.slug.trim().toLowerCase(),
      description: dto.description?.trim(),
      parent_category_id: dto.parent_category_id || null,
      image_url: dto.image_url?.trim() || undefined,
      is_active: dto.is_active ?? true,
    };
  }

  static toCategoryResponse(category: any): WrappedCategoryResponse {
    const response = {
      category_id: category.category_id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parent_category_id: category.parent_category_id,
      image_url: category.image_url,
      is_active: category.is_active,
      created_at: category.created_at,
      updated_at: category.updated_at,
    };

    // Validate the response matches our schema
    return { category: categoryResponseSchema.parse(response) };
  }

  static toCategoriesResponse(categories: any[]): CategoriesResponse {
    const mappedCategories = categories.map(category => ({
      category_id: category.category_id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parent_category_id: category.parent_category_id,
      image_url: category.image_url,
      is_active: category.is_active,
      created_at: category.created_at,
      updated_at: category.updated_at,
    }));

    // Validate and structure the response
    return {

      categories: mappedCategories.map(cat => categoryResponseSchema.parse(cat))
      // Uncomment and add these when you implement pagination:
      // total: totalCount,
      // page: pageNumber,
      // limit: pageSize,
      // total_pages: Math.ceil(totalCount / pageSize)

    };
  }
}