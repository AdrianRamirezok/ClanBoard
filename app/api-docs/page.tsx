'use client'

import dynamic from 'next/dynamic'
import 'swagger-ui-react/swagger-ui.css'
import { swaggerSpec } from '@/lib/swagger'

// ssr: false evita errores de APIs del navegador durante el pre-render de Next.js
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

export default function ApiDocsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <SwaggerUI spec={swaggerSpec} docExpansion="list" defaultModelsExpandDepth={1} />
    </div>
  )
}
