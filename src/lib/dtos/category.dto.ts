// src/lib/dtos/category.dto.ts
import { CreateCategoryPayload } from '../entities/category.entity';
import { CreateCategoryDto } from '../validations/category.schema';

export class CategoryDto {
  static toEntity(dto: CreateCategoryDto): CreateCategoryPayload {
    return {
      name: dto.name.trim(),
      slug: dto.slug.trim().toLowerCase(),
      description: dto.description?.trim(),
      parent_id: dto.parent_id || null,
      image_url: dto.image_url?.trim() || undefined,
      is_active: dto.is_active ?? true,
    };
  }

  static toResponse(category: any) {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      parent_id: category.parent_id,
      image_url: category.image_url,
      is_active: category.is_active,
      created_at: category.created_at,
      updated_at: category.updated_at,
    };
  }
}