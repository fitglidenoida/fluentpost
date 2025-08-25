'use client'

import { useState, useEffect } from 'react'
import { CostFreeAIService, storeGPTResponse } from '@/lib/ai'
import BlogPostsList from './BlogPostsList'

interface AIResponse {
  id: string
  promptId: string
  promptType: string
  content: string
  status: string
  createdAt: string
  response: string
}

export default function AdminPage() {
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [gptResponse, setGptResponse] = useState('')
  const [promptId, setPromptId] = useState('')
  const [responses, setResponses] = useState<AIResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [creatingBlog, setCreatingBlog] = useState<string | null>(null)
  const [creatingThread, setCreatingThread] = useState<string | null>(null)
  const [sharingToSocial, setSharingToSocial] = useState<string | null>(null)
  const [generationParams, setGenerationParams] = useState({
    type: 'blog',
    topic: '',
    platform: 'twitter',
    tone: 'enthusiastic',
    length: 'medium',
    additionalContext: '',
    keywords: ''
  })

  useEffect(() => {
    // Load existing responses from database
    loadResponses()

    // Check for URL parameters to pre-fill topic context
    const urlParams = new URLSearchParams(window.location.search)
    const action = urlParams.get('action')
    const topic = urlParams.get('topic')
    const context = urlParams.get('context')

    if (action && topic) {
      const urlType = urlParams.get('type')
      setGenerationParams(prev => ({
        ...prev,
        type: action === 'research' ? 'blog' : action === 'create' ? (urlType || 'app-feature') : 'topic',
        topic: decodeURIComponent(topic)
      }))

      // Parse context if available
      if (context) {
        try {
          const topicData = JSON.parse(decodeURIComponent(context))
          setGenerationParams(prev => ({
            ...prev,
            topic: topicData.topic || topic,
            additionalContext: topicData.description || '',
            keywords: topicData.keywords || ''
          }))
        } catch (error) {
          console.error('Error parsing topic context:', error)
        }
      }
    }
  }, [])

  const loadResponses = async () => {
    try {
      const response = await fetch('/api/ai-responses')
      if (response.ok) {
        const data = await response.json()
        setResponses(data.aiResponses)
      }
    } catch (error) {
      console.error('Error loading responses:', error)
    }
  }

  const generatePrompt = () => {
    const prompt = {
      type: generationParams.type as 'blog' | 'social' | 'topic',
      topic: generationParams.topic,
      platform: generationParams.platform,
      tone: generationParams.tone,
      length: generationParams.length,
      additionalContext: generationParams.additionalContext,
      keywords: generationParams.keywords,
    }

    const id = CostFreeAIService.queuePrompt(prompt)
    setPromptId(id)
    setCurrentPrompt(CostFreeAIService.generatePrompt(prompt))
  }

  const storeResponse = async () => {
    if (!promptId || !gptResponse) {
      alert('Please provide both prompt ID and GPT response')
      return
    }

    setLoading(true)
    try {
      await storeGPTResponse(promptId, gptResponse)
      await loadResponses() // Reload from database
      setGptResponse('')
      setPromptId('')
      setCurrentPrompt('')
      alert('Response stored successfully!')
    } catch (error) {
      alert('Error storing response: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const clearData = async () => {
    if (confirm('Are you sure you want to clear all AI responses? This cannot be undone.')) {
      try {
        // Clear from database (you can add a DELETE endpoint if needed)
        CostFreeAIService.clearData()
        setResponses([])
        setCurrentPrompt('')
        setGptResponse('')
        setPromptId('')
        alert('All data cleared!')
      } catch (error) {
        alert('Error clearing data: ' + error)
      }
    }
  }

  const createBlogFromResponse = async (responseId: string) => {
    setCreatingBlog(responseId)
    try {
      const result = await fetch('/api/ai-responses/create-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiResponseId: responseId }),
      })

      if (result.ok) {
        const blogPost = await result.json()
        alert(`Blog post created successfully!\nTitle: ${blogPost.title}\nStatus: ${blogPost.status}`)
        await loadResponses() // Reload to update status
      } else {
        const error = await result.json()
        alert('Error creating blog post: ' + error.error)
      }
    } catch (error) {
      alert('Error creating blog post: ' + error)
    } finally {
      setCreatingBlog(null)
    }
  }

  const createThreadFromResponse = async (responseId: string) => {
    setCreatingThread(responseId)
    try {
      const title = prompt('Enter a title for the Twitter thread:')
      if (!title) {
        setCreatingThread(null)
        return
      }

      const result = await fetch('/api/threads/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiResponseId: responseId, title }),
      })

      if (result.ok) {
        const thread = await result.json()
        alert(`Twitter thread created successfully!\nTweets: ${thread.thread.totalTweets}\nEstimated read time: ${thread.thread.estimatedReadTime} minutes`)
        
        // Ask if user wants to post the thread now
        if (confirm('Would you like to post this thread to Twitter now?')) {
          await postThread(thread.thread.id)
        }
      } else {
        const error = await result.json()
        alert('Error creating thread: ' + error.error)
      }
    } catch (error) {
      alert('Error creating thread: ' + error)
    } finally {
      setCreatingThread(null)
    }
  }

  const postThread = async (threadId: string) => {
    try {
      const result = await fetch('/api/threads/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId }),
      })

      if (result.ok) {
        const data = await result.json()
        alert(`Thread posted successfully!\nSuccessful tweets: ${data.successfulTweets}/${data.totalTweets}`)
      } else {
        const error = await result.json()
        alert('Error posting thread: ' + error.error)
      }
    } catch (error) {
      alert('Error posting thread: ' + error)
    }
  }

  const shareToSocialMedia = async (blogPostId: string) => {
    setSharingToSocial(blogPostId)
    try {
      const result = await fetch('/api/social-posts/auto-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blogPostId,
          platforms: ['twitter', 'facebook'],
          customMessage: 'Check out this amazing fitness content! 💪',
        }),
      })

      if (result.ok) {
        const data = await result.json()
        const successCount = data.results.filter((r: any) => r.success).length
        alert(`Shared to ${successCount} platforms successfully!`)
      } else {
        const error = await result.json()
        alert('Error sharing to social media: ' + error.error)
      }
    } catch (error) {
      alert('Error sharing to social media: ' + error)
    } finally {
      setSharingToSocial(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">🤖 Cost-Free AI Admin Panel</h1>
          <p className="text-gray-600 mb-8">
            Generate content using GPT Plus without API costs. Copy prompts to GPT Plus, then paste responses back here.
          </p>

          {/* Generation Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
              <select 
                value={generationParams.type}
                onChange={(e) => setGenerationParams({...generationParams, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="blog">Blog Post</option>
                <option value="app-feature">App Feature</option>
                <option value="social">Social Media</option>
                <option value="topic">Topic Ideas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
              <input 
                type="text"
                value={generationParams.topic}
                onChange={(e) => setGenerationParams({...generationParams, topic: e.target.value})}
                placeholder="e.g., HIIT workouts"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <select 
                value={generationParams.platform}
                onChange={(e) => setGenerationParams({...generationParams, platform: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="twitter">Twitter</option>
                <option value="facebook">Facebook</option>
                <option value="linkedin">LinkedIn</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
              <select 
                value={generationParams.tone}
                onChange={(e) => setGenerationParams({...generationParams, tone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="enthusiastic">Enthusiastic</option>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="educational">Educational</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
              <select 
                value={generationParams.length}
                onChange={(e) => setGenerationParams({...generationParams, length: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
          </div>

          {/* Additional Context Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Topic Context/Description</label>
              <textarea 
                value={generationParams.additionalContext}
                onChange={(e) => setGenerationParams({...generationParams, additionalContext: e.target.value})}
                placeholder="Describe the topic in detail, what it's about, target audience, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
              <input 
                type="text"
                value={generationParams.keywords}
                onChange={(e) => setGenerationParams({...generationParams, keywords: e.target.value})}
                placeholder="e.g., fitness, workout, health, wellness"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button 
            onClick={generatePrompt}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Generate Prompt for GPT Plus
          </button>
        </div>

        {/* Prompt Display */}
        {currentPrompt && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📝 Prompt for GPT Plus</h2>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-2">Prompt ID: {promptId}</p>
              <textarea 
                value={currentPrompt}
                readOnly
                className="w-full h-64 p-4 bg-white border border-gray-300 rounded-lg font-mono text-sm"
              />
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => navigator.clipboard.writeText(currentPrompt)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                📋 Copy Prompt
              </button>
              <p className="text-sm text-gray-600 flex items-center">
                → Paste this into GPT Plus and copy the JSON response below
              </p>
            </div>
          </div>
        )}

        {/* Response Input */}
        {promptId && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📥 Paste GPT Plus Response</h2>
            <textarea 
              value={gptResponse}
              onChange={(e) => setGptResponse(e.target.value)}
              placeholder="Paste the JSON response from GPT Plus here..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg font-mono text-sm"
            />
            <div className="mt-4 flex gap-4">
              <button 
                onClick={storeResponse}
                disabled={loading}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? '💾 Storing...' : '💾 Store Response'}
              </button>
              <button 
                onClick={() => setGptResponse('')}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Complete Workflow Guide */}
        <div className="bg-blue-50 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4">🚀 Complete Viral Content Workflow</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">1. Generate Content</h3>
              <p className="text-gray-600">Use the form above to create prompts for GPT Plus. Focus on viral topics and engaging content.</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">2. Create Blog Post</h3>
              <p className="text-gray-600">Store GPT responses and create blog posts with clean, formatted content ready for publishing.</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">3. Share & Go Viral</h3>
              <p className="text-gray-600">Post to social media platforms and track performance to optimize for maximum reach.</p>
            </div>
          </div>
        </div>

        {/* Created Blog Posts */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">📝 Created Blog Posts</h2>
          <BlogPostsList onShareToSocial={shareToSocialMedia} sharingToSocial={sharingToSocial} />
        </div>

        {/* Stored Responses */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">📚 Stored Responses ({responses.length})</h2>
            <button 
              onClick={clearData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All
            </button>
          </div>
          
          {responses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No responses stored yet. Generate a prompt and store a response to see them here.</p>
          ) : (
            <div className="space-y-4">
              {responses.map((response) => (
                <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {response.promptType} - {new Date(response.createdAt).toLocaleString()}
                      </h3>
                      <p className="text-sm text-gray-500">Status: {response.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => navigator.clipboard.writeText(response.content)}
                        className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 border border-blue-600 rounded"
                      >
                        Copy Content
                      </button>
                      {response.promptType === 'blog' && response.status === 'processed' && (
                        <>
                          <button 
                            onClick={() => createBlogFromResponse(response.id)}
                            disabled={creatingBlog === response.id}
                            className="text-green-600 hover:text-green-800 text-sm px-2 py-1 border border-green-600 rounded disabled:opacity-50"
                          >
                            {creatingBlog === response.id ? 'Creating...' : '📝 Create Blog'}
                          </button>
                          <button 
                            onClick={() => createThreadFromResponse(response.id)}
                            disabled={creatingThread === response.id}
                            className="text-purple-600 hover:text-purple-800 text-sm px-2 py-1 border border-purple-600 rounded disabled:opacity-50"
                          >
                            {creatingThread === response.id ? 'Creating...' : '🧵 Create Thread'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <h4 className="font-medium mb-2">Content Preview:</h4>
                    <div className="text-gray-700 max-h-32 overflow-y-auto">
                      {response.content.substring(0, 300)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
