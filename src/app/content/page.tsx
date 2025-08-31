'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

export default function ContentRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to campaigns page after 3 seconds
    const timer = setTimeout(() => {
      router.push('/campaigns')
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="content" />
      
      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">📝 Content Studio Moved!</h1>
            <p className="text-lg text-gray-600 mb-6">
              Content creation is now <strong>campaign-driven</strong>! 
              Create content that serves your strategic objectives and measurable goals.
            </p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-green-900 mb-3">✍️ Strategic Content Creation:</h2>
              <div className="text-left text-green-800">
                <div className="mb-2">🎯 <strong>Purpose-Driven</strong> - Every piece serves campaign goals</div>
                <div className="mb-2">📊 <strong>Measurable</strong> - Track content performance against KPIs</div>
                <div className="mb-2">🎪 <strong>Pillar-Aligned</strong> - Content fits strategic themes</div>
                <div>🔍 <strong>Keyword-Optimized</strong> - Based on campaign research</div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                <strong>💡 Pro Tip:</strong> Create campaigns first to ensure your content has strategic direction and measurable impact!
              </p>
            </div>
            
            <p className="text-gray-500 mb-6">
              <strong>Redirecting to Campaigns...</strong> (3 seconds)
            </p>
            
            <button 
              onClick={() => router.push('/campaigns')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              🎪 Start with Strategy
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
