import swaggerJSDoc from 'swagger-jsdoc'

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
  apis: ['./src/app/api/**/route.ts'],
}

export async function getSwaggerSpec() {
  return swaggerJSDoc(swaggerOptions)
}