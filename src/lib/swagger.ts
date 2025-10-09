import { join } from "path"

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