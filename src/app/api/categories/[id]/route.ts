import { CategoryDto } from "@/lib/dtos/category.dto";
import { CategoryService } from "@/lib/services/category.service";
import { CreateCategoryDto, createCategorySchema } from "@/lib/validations/category.schema";
import { errorResponse, successResponse, validationErrorResponse } from "@/types/api-response";
import { NextRequest } from "next/server";

/**
 * @swagger
 * /api/categories/{id}:
 *   patch:
 *     summary: Update an existing category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategory'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error or invalid request
 *       404:
 *         description: Category not found
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get category ID from URL
    const categoryId = params.id;
    
    // Validate request body
    const body = await request.json();
    const validation = createCategorySchema.partial().safeParse(body);

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
    const updateData = validation.data ? CategoryDto.toEntity(validation.data as CreateCategoryDto) : {};

    // Update category using service
    const updatedCategory = await CategoryService.updateCategory(categoryId, updateData);

    // Convert entity to response DTO
    const responseData = CategoryDto.toCategoryResponse(updatedCategory);

    return successResponse(responseData, 'Category updated successfully');
  } catch (error) {
    console.error('Category update error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return errorResponse(error.message, 404);
      }
      if (error.message.includes('already exists') || 
          error.message.includes('cannot be its own parent') ||
          error.message.includes('circular category reference')) {
        return errorResponse(error.message, 400);
      }
    }
    
    return errorResponse(
      error instanceof Error ? error.message : 'Failed to update category',
      500
    );
  }
}

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Category not found
 *       400:
 *         description: Cannot delete category with child categories or related data exists
 *       500:
 *         description: Internal server error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryId = params.id;

    if (!categoryId) {
      return errorResponse('Category ID is required', 400);
    }

    // Delete the category using the service
    const result = await CategoryService.deleteCategory(categoryId);

    return successResponse(result, result.message);
  } catch (error) {
    console.error('Error deleting category:', error);
    if (error instanceof Error) {
      if (error.message.includes('Cannot delete category')) {
        return errorResponse(error.message, 400);
      }
      if (error.message === 'Category not found') {
        return errorResponse(error.message, 404);
      }
    }
    return errorResponse('Failed to delete category', 500);
  }
}