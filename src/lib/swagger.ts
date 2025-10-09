import { join } from 'path'
import swaggerJSDoc from 'swagger-jsdoc';
import type { OpenAPIV3 } from 'openapi-types';

// Helper function to get API paths for both dev and production
function getApiPaths() {
  const isVercel = process.env.VERCEL === '1'
  const isProduction = process.env.NODE_ENV === 'production'
  
  // For Vercel production
  if (isVercel || isProduction) {
    return [
      join(process.cwd(), 'src/app/api/**/route.js'),
      join(process.cwd(), 'src/app/api/**/route.ts')
    ]
  }
  
  // For local development
  return [
    join(process.cwd(), 'src/app/api/**/route.ts'),
    join(process.cwd(), 'src/app/api/**/route.js')
  ]
}

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description: 'E-Commerce API Documentation',
    },
    servers: [
      {
        url: 'https://ecommerce-api-one-gamma.vercel.app',
        description: 'Production server'
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: getApiPaths(),
  // Enable this for better error messages
  failOnErrors: true,
}


export async function getSwaggerSpec(): Promise<OpenAPIV3.Document> {
  try {
    const spec = await swaggerJSDoc(swaggerOptions) as OpenAPIV3.Document;
    if (!spec.paths || Object.keys(spec.paths).length === 0) {
      console.warn('No API paths found. Check your API route files and JSDoc comments.')
    }
    return spec
  } catch (error) {
    console.error('Error generating Swagger spec:', error)
    throw error
  }
}