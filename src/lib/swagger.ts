import swaggerJSDoc from 'swagger-jsdoc'
import { join } from 'path'

// Helper function to get API paths for both dev and production
function getApiPaths() {
  // For Vercel production
  if (process.env.VERCEL_ENV === 'production') {
    return [
      join(process.cwd(), 'app/api/**/route.js'),
      join(process.cwd(), 'app/api/**/route.ts')
    ]
  }
  // For local development
  return [
    join(process.cwd(), 'src/app/api/**/route.ts'),
    join(process.cwd(), 'app/api/**/route.ts')
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
}

export async function getSwaggerSpec() {
  return swaggerJSDoc(swaggerOptions)
}