'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface AIResponse {
  id: string
  prompt: string
  response: string
  type: string
  createdAt: string
}

export default function AIAdminPanel() {
  const searchParams = useSearchParams()
  const [responses, setResponses] = useState<AIResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [currentResponse, setCurrentResponse] = useState('')
  const [action, setAction] = useState('')
  const [topic, setTopic] = useState('')

  useEffect(() => {
    fetchAIResponses()
    
    // Check for URL parameters
    const urlAction = searchParams.get('action')
    const urlTopic = searchParams.get('topic')
    const urlPrompt = searchParams.get('prompt')
    
    if (urlAction) {
      setAction(urlAction)
      if (urlTopic) setTopic(decodeURIComponent(urlTopic))
      if (urlPrompt) {
        try {
          const promptData = JSON.parse(decodeURIComponent(urlPrompt))
          setCurrentPrompt(promptData.prompt || promptData)
        } catch (e) {
          setCurrentPrompt(decodeURIComponent(urlPrompt))
        }
      }
    }
  }, [searchParams])

  const fetchAIResponses = async () => {
    try {
      const response = await fetch('/api/ai-responses')
      if (response.ok) {
        const data = await response.json()
        setResponses(data.responses || [])
      }
    } catch (error) {
      console.error('Error fetching AI responses:', error)
    }
  }

  const handleGenerateContent = async () => {
    if (!currentPrompt.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentPrompt,
          type: action || 'general'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentResponse(data.response)
        
        // Save to database
        await fetch('/api/ai-responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: currentPrompt,
            response: data.response,
            type: action || 'general'
          })
        })
        
        fetchAIResponses() // Refresh the list
      } else {
        alert('Error generating content')
      }
    } catch (error) {
      console.error('Error generating content:', error)
      alert('Error generating content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateBlog = async (responseId: string) => {
    try {
      const response = await fetch('/api/ai-responses/create-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseId })
      })

      if (response.ok) {
        alert('Blog post created successfully!')
      } else {
        alert('Error creating blog post')
      }
    } catch (error) {
      console.error('Error creating blog post:', error)
      alert('Error creating blog post')
    }
  }

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'generate-topics': return 'Generate Topic Ideas'
      case 'research': return 'Research Topic'
      case 'create': return 'Create Content'
      default: return 'AI Generation'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {action ? getActionDescription(action) : 'AI Generation Panel'}
            </h2>
            <p className="text-gray-600 mt-1">
              Generate content using GPT Plus workflow
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">GPT Plus Active</span>
          </div>
        </div>
      </div>

      {/* Generation Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Content</h3>
        
        <div className="space-y-4">
          {topic && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Topic:</strong> {topic}
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prompt
            </label>
            <textarea
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleGenerateContent}
              disabled={isLoading || !currentPrompt.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Generating...' : 'Generate Content'}
            </button>
            
            <button
              onClick={() => {
                setCurrentPrompt('')
                setCurrentResponse('')
                setAction('')
                setTopic('')
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Response Section */}
      {currentResponse && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Response</h3>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-800">{currentResponse}</pre>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(currentResponse)
                alert('Response copied to clipboard!')
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Copy to Clipboard
            </button>
            
            <button
              onClick={() => {
                // Create blog post from current response
                const tempResponse = {
                  id: 'temp',
                  prompt: currentPrompt,
                  response: currentResponse,
                  type: action || 'general'
                }
                // This would need to be implemented
                alert('Blog creation feature coming soon!')
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create Blog Post
            </button>
          </div>
        </div>
      )}

      {/* Recent Responses */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent AI Responses</h3>
        
        {responses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No AI responses yet</p>
        ) : (
          <div className="space-y-4">
            {responses.slice(0, 5).map((response) => (
              <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {response.type || 'General'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(response.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCreateBlog(response.id)}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Create Blog
                  </button>
                </div>
                
                <div className="text-sm text-gray-700 mb-2">
                  <strong>Prompt:</strong> {response.prompt.substring(0, 100)}...
                </div>
                
                <div className="text-sm text-gray-600">
                  <strong>Response:</strong> {response.response.substring(0, 150)}...
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• <strong>Topic Generation:</strong> Enter a broad topic to generate specific content ideas</p>
          <p>• <strong>Research:</strong> Provide a topic to get detailed research and insights</p>
          <p>• <strong>Content Creation:</strong> Give a topic or idea to create full blog content</p>
          <p>• <strong>Copy & Paste:</strong> Copy the generated response and paste it into GPT Plus</p>
          <p>• <strong>Save Responses:</strong> All responses are automatically saved for future reference</p>
        </div>
      </div>
    </div>
  )
}
