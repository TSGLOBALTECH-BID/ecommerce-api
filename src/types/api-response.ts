import { NextResponse } from "next/server";

interface ErrorDetails {
  message: string;
  code?: string | number;
  details?: Record<string, string[]>;
  stack?: string; // For development only
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Paginated response with metadata
export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Base response interface for all API responses
 * @template T Type of the data payload
 */
export interface BaseResponse<T = unknown> {
  /** Indicates if the request was successful */
  success: boolean;
  
  /** Optional message for success/error details */
  message?: string;
  
  /** The actual response data (type T) */
  data?: T;
  
  /** Error details (if any) */
  error?: ErrorDetails;
  
  /** HTTP status code */
  status: number;
  
  /** API version */
  version: string;
  
  /** Timestamp of the response */
  timestamp: string;
  
  /** Request ID for tracking */
  requestId?: string;
}

/**
 * Wraps a response object in NextResponse.json() with the provided status code
 * @param response The response object to wrap
 * @param status HTTP status code (default: 200)
 * @returns NextResponse with JSON body
 */
function createApiResponse<T>(response: BaseResponse<T>, status = 200): NextResponse<BaseResponse<T>> {
  return NextResponse.json(response, { status });
}

/**
 * Creates a success response
 * @param data Response data
 * @param message Optional success message
 * @param status HTTP status code (default: 200)
 * @returns Formatted success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status = 200
): NextResponse<BaseResponse<T>> {
  const response: BaseResponse<T> = {
    success: true,
    message,
    data,
    status,
    version: '1.0',
    timestamp: new Date().toISOString(),
  };
  
  return createApiResponse(response, status);
}

/**
 * Creates an error response
 * @param message Error message
 * @param status HTTP status code (default: 500)
 * @param error Optional error details
 * @returns Formatted error response
 */
export function errorResponse(
  message: string,
  status = 500,
  error?: string
): NextResponse<BaseResponse<null>> {
  const response: BaseResponse<null> = {
    success: false,
    message,
    data: null,
    status,
    error: {
      message: error || message,
      code: status,
    },
    version: '1.0',
    timestamp: new Date().toISOString(),
  };

  return createApiResponse(response, status);
}

/**
 * Creates a validation error response
 * @param message Validation error message
 * @param errors Optional array of validation errors
 * @returns Formatted validation error response
 */
export function validationErrorResponse(
  message: string = 'Validation failed',
  errors?: Record<string, string[]>
): NextResponse<BaseResponse<{ errors?: Record<string, string[]> }>> {
  const response: BaseResponse<{ errors?: Record<string, string[]> }> = {
    success: false,
    message,
    status: 400,
    error: {
      message: 'Validation Error',
      code: 400,
      details: errors,
    },
    data: errors ? { errors } : undefined,
    version: '1.0',
    timestamp: new Date().toISOString(),
  };

  return createApiResponse(response, 400);
}

/**
 * Creates a not found response
 * @param message Optional custom not found message
 * @returns Formatted not found response
 */
export function notFoundResponse(message: string = 'Resource not found'): NextResponse<BaseResponse<null>> {
  return errorResponse(message, 404);
}

/**
 * Creates an unauthorized response
 * @param message Optional custom unauthorized message
 * @returns Formatted unauthorized response
 */
export function unauthorizedResponse(
  message: string = 'Unauthorized'
): NextResponse<BaseResponse<null>> {
  return errorResponse(message, 401);
}

/**
 * Creates a forbidden response
 * @param message Optional custom forbidden message
 * @returns Formatted forbidden response
 */
export function forbiddenResponse(
  message: string = 'Forbidden'
): NextResponse<BaseResponse<null>> {
  return errorResponse(message, 403);
}
