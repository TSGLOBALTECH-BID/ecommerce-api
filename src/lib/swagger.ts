import { join } from 'path'
import swaggerJSDoc from 'swagger-jsdoc';
import type { OpenAPIV3 } from 'openapi-types';

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
        url: 'https://ecommerce-api-one-gamma.vercel.app/api',  // Added /api
        description: 'Production server'
      },
      {
        url: 'http://localhost:3000/api',  // Added /api
        description: 'Development server',
      },
    ],
  },
  apis: getApiPaths(),
  failOnErrors: process.env.NODE_ENV !== 'production', // Only fail in non-production
  // Add these options for better file handling
  apisSorter: 'alpha',
  operationsSorter: 'alpha',
  explorer: true,
  // Add base path if your API is under a specific path
  basePath: '/api',  // This helps with path resolution
}


export async function getSwaggerSpec(): Promise<OpenAPIV3.Document> {
  try {
    console.log('Searching for API files in:', swaggerOptions.apis);
    const spec = await swaggerJSDoc(swaggerOptions) as OpenAPIV3.Document;
    
    if (!spec.paths || Object.keys(spec.paths).length === 0) {
      console.warn('No API paths found. Check the following:');
      console.log('1. Current working directory:', process.cwd());
      console.log('2. Files in API directory:');
      
      // List all files in the API directory
      const fs = require('fs');
      const path = require('path');
      
      const apiDir = path.join(process.cwd(), 'src/app/api');
      try {
        const files = fs.readdirSync(apiDir, { recursive: true });
        console.log('Found files:', files);
      } catch (err: unknown) {
        console.error(`Error reading API directory (${apiDir}):`, (err as Error).message);
      }
    }
    
    return spec;
  } catch (error) {
    console.error('Error generating Swagger spec:', error);
    throw error;
  }
}