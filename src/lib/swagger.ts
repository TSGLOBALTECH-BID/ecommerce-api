import { join } from 'path'
import swaggerJSDoc from 'swagger-jsdoc';
import type { OpenAPIV3 } from 'openapi-types';

import { readdirSync } from 'fs';


// Helper function to get API paths for both dev and production
function getApiPaths() {
  console.log('Environment:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- VERCEL:', process.env.VERCEL);
  console.log('- VERCEL_ENV:', process.env.VERCEL_ENV);
  
  // For all environments, include all possible paths
  return [
    // Local development paths
    join(process.cwd(), 'src/app/api/**/*.ts'),
    join(process.cwd(), 'app/api/**/*.ts'),
    // Vercel production paths
    join(process.cwd(), '.next/server/app/api/**/*.js'),
    // General catch-all
    join(process.cwd(), '**/api/**/*.ts'),
    join(process.cwd(), '**/api/**/*.js')
  ];
}

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description: 'E-Commerce API Documentation',
    },
    servers: [
      // Always put the current environment first
      ...(isProduction ? [] : [{
        url: 'http://localhost:3000',  // Added /api for local development
        description: 'Development server',
      }]),
      {
        url: 'https://ecommerce-api-one-gamma.vercel.app',  // Ensure /api is included
        description: 'Production server'
      },
    ],
  },
  apis: getApiPaths(),
  failOnErrors: process.env.NODE_ENV !== 'production',
  apisSorter: 'alpha',
  operationsSorter: 'alpha',
  explorer: true,
}

export async function getSwaggerSpec(): Promise<OpenAPIV3.Document> {
  try {
    console.log('Searching for API files in:', swaggerOptions.apis);
    const spec = await swaggerJSDoc(swaggerOptions) as OpenAPIV3.Document;
    
    if (!spec.paths || Object.keys(spec.paths).length === 0) {
      console.warn('No API paths found. Check the following:');
      console.log('1. Current working directory:', process.cwd());
      console.log('2. Files in API directory:');
      
      const apiDir = join(process.cwd(), 'src/app/api');
      try {
        const files = readdirSync(apiDir, { recursive: true });
        console.log('Found files:', files);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error reading API directory (${apiDir}):`, errorMessage);
      }
    }
    
    return spec;
  } catch (error) {
    console.error('Error generating Swagger spec:', error);
    throw error;
  }
}