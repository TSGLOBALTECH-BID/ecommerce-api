// src/components/SwaggerUIWrapper.tsx
'use client'

import { useEffect, useRef } from 'react'
import { loadSwaggerUI } from '@/lib/loadSwaggerUI'

export default function SwaggerUIWrapper({ url }: { url: string }) {
  const swaggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && swaggerRef.current) {
      // Load Swagger UI asynchronously
      loadSwaggerUI(swaggerRef.current, url)
    }
  }, [url])

  return <div ref={swaggerRef} />
}