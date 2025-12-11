// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createCategorySchema, CreateCategoryDto } from '@/lib/validations/category.schema';
import { CategoryService } from '@/lib/services/category.service';
import { CategoryDto } from '@/lib/dtos/category.dto';
import { validationErrorResponse, errorResponse, successResponse } from '@/types/api-response';
import { supabase } from '@/lib/supabase';


/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategory'
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error
 */
export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const body = await request.json();
    const validation = createCategorySchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues.reduce((acc, curr) => {
        const key = curr.path.join('.');
        acc[key] = acc[key] || [];
        acc[key].push(curr.message);
        return acc;
      }, {} as Record<string, string[]>);

      return validationErrorResponse('Validation failed', errors);
    }

    // Convert DTO to entity
    const categoryData = CategoryDto.toEntity(validation.data);

    // Create category using service
    const newCategory = await CategoryService.createCategory(categoryData);
    
    // Convert entity to response DTO
    const responseData = CategoryDto.toResponse(newCategory);
    
    return successResponse(responseData, 'Category created successfully', 201);
  } catch (error) {
    console.error('Category creation error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to create category',
      500
    );
  }
}

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return successResponse(categories || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return errorResponse('Failed to fetch categories', 500);
  }
}