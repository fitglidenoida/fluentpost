'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

export default function ResearchRedirect() {
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
      <Navigation currentPage="research" />
      
      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">🎯 Research Hub Moved!</h1>
            <p className="text-lg text-gray-600 mb-6">
              We've upgraded to a <strong>Campaign-First approach</strong>! 
              Research is now integrated directly into your campaign workflow.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">📈 New Strategic Process:</h2>
              <div className="text-left text-blue-800">
                <div className="mb-2">1. 🎪 <strong>Create Campaign</strong> - Define goals & strategy</div>
                <div className="mb-2">2. 🔍 <strong>Research Keywords</strong> - Based on objectives</div>
                <div className="mb-2">3. 📝 <strong>Create Content</strong> - Aligned with pillars</div>
                <div>4. 📊 <strong>Track Results</strong> - Measure KPIs</div>
              </div>
            </div>
            
            <p className="text-gray-500 mb-6">
              <strong>Redirecting to Campaigns...</strong> (3 seconds)
            </p>
            
            <button 
              onClick={() => router.push('/campaigns')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🚀 Go to Campaigns Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
