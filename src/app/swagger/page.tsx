// src/app/swagger/page.tsx
'use client'

import dynamic from 'next/dynamic'
import SwaggerUIWrapper from '@/components/SwaggerUIWrapper'

// Disable SSR for this component
const SwaggerPage = () => {
  return (
    <div className="swagger-container">
      <SwaggerUIWrapper url="/api/docs" />
      <style jsx global>{`
        .swagger-container {
          padding: 20px;
        }
        .swagger-ui .info {
          margin: 20px 0;
        }
      `}</style>
    </div>
  )
}

export default dynamic(() => Promise.resolve(SwaggerPage), {
  ssr: false,
})