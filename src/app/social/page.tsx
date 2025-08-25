'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { CostFreeAIService } from '@/lib/ai'

export default function SocialMedia() {
  const { content, isLoading, error, fetchSocialPosts, fetchBlogPosts } = useAppStore()
  const socialPosts = content.socialPosts
  const blogPosts = content.blogPosts
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [showPostForm, setShowPostForm] = useState(false)
  const [newPost, setNewPost] = useState({
    content: '',
    platform: 'twitter',
    status: 'draft',
    blogPostId: '',
    scheduledAt: ''
  })
  const [editingPost, setEditingPost] = useState<any>(null)
  const [postingToSocial, setPostingToSocial] = useState<string | null>(null)

  useEffect(() => {
    fetchSocialPosts()
    fetchBlogPosts()
  }, [fetchSocialPosts, fetchBlogPosts])

  const generateSocialContent = async () => {
    const prompt = {
      type: 'social' as const,
      topic: 'fitness and wellness',
      platform: newPost.platform,
      tone: 'enthusiastic',
      length: 'short'
    }
    
    const result = await CostFreeAIService.generateContent(prompt)
    console.log('Social content generation result:', result)
  }

  const handleCreateSocialPost = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingPost) {
      // Update existing post
      try {
        const response = await fetch(`/api/social-posts/${editingPost.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPost),
        })
        
        if (response.ok) {
          await fetchSocialPosts() // Refresh the list
          setShowPostForm(false)
          setEditingPost(null)
          setNewPost({
            content: '',
            platform: 'twitter',
            status: 'draft',
            blogPostId: '',
            scheduledAt: ''
          })
        } else {
          alert('Error updating social post')
        }
      } catch (error) {
        console.error('Error updating social post:', error)
        alert('Error updating social post')
      }
    } else {
      // Create new post
      try {
        const response = await fetch('/api/social-posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPost),
        })
        
        if (response.ok) {
          await fetchSocialPosts() // Refresh the list
          setShowPostForm(false)
          setNewPost({
            content: '',
            platform: 'twitter',
            status: 'draft',
            blogPostId: '',
            scheduledAt: ''
          })
        } else {
          alert('Error creating social post')
        }
      } catch (error) {
        console.error('Error creating social post:', error)
        alert('Error creating social post')
      }
    }
  }

  const handleEditPost = (post: any) => {
    setEditingPost(post)
    setNewPost({
      content: post.content,
      platform: post.platform,
      status: post.status,
      blogPostId: post.blogPostId || '',
      scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : ''
    })
    setShowPostForm(true)
  }

  const handlePostToSocial = async (postId: string) => {
    setPostingToSocial(postId)
    try {
      const response = await fetch('/api/social-posts/auto-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          socialPostId: postId,
          platforms: ['twitter', 'facebook'],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const successCount = data.results.filter((r: any) => r.success).length
        alert(`Posted to ${successCount} platforms successfully!`)
        await fetchSocialPosts() // Refresh the list
      } else {
        const error = await response.json()
        alert('Error posting to social media: ' + error.error)
      }
    } catch (error) {
      alert('Error posting to social media: ' + error)
    } finally {
      setPostingToSocial(null)
    }
  }

  const handlePostThread = async (threadId: string) => {
    setPostingToSocial(threadId)
    try {
      const result = await fetch('/api/threads/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId }),
      })

      if (result.ok) {
        const data = await result.json()
        alert(`Thread posted successfully!\nSuccessful tweets: ${data.successfulTweets}/${data.totalTweets}`)
        await fetchSocialPosts() // Refresh the list
      } else {
        const error = await result.json()
        alert('Error posting thread: ' + error.error)
      }
    } catch (error) {
      alert('Error posting thread: ' + error)
    } finally {
      setPostingToSocial(null)
    }
  }

  const filteredPosts = (socialPosts || []).filter((post: any) => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPlatform = selectedPlatform === 'all' || post.platform === selectedPlatform
    return matchesSearch && matchesPlatform
  })

  const platforms = ['all', 'twitter', 'facebook', 'linkedin', 'instagram']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">FitGlide</h2>
              <p className="text-sm text-gray-500">Marketing Tool</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <a href="/" className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
              Dashboard
            </a>
            <a href="/research" className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Research Hub
            </a>
            <a href="/content" className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Content Studio
            </a>
            <div className="w-full flex items-center px-4 py-3 rounded-lg text-left bg-blue-600 text-white">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Social Media
            </div>
            <a href="/analytics" className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </a>
            <a href="/campaigns" className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Campaigns
            </a>
            <a href="/users" className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Users
            </a>
            <a href="/calendar" className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar
            </a>
            <button className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
          </nav>
        </div>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">S</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
              <p className="text-xs text-gray-500">Marketing Manager</p>
            </div>
          </div>
        </div>

        {/* AI Admin Panel Link */}
        <div className="absolute bottom-20 left-0 right-0 p-6">
          <a 
            href="/admin" 
            className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Admin Panel
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Media</h1>
            <p className="text-gray-600 text-lg">Manage and schedule social media posts across platforms</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowPostForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Post
            </button>
            <button 
              onClick={generateSocialContent}
              className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate with AI
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Posts</label>
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search social posts..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
              <select 
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {platforms.map(platform => (
                  <option key={platform} value={platform}>
                    {platform === 'all' ? 'All Platforms' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-500">
                {filteredPosts.length} posts found
              </div>
            </div>
          </div>
        </div>

        {/* Social Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading social posts...</p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <p className="text-red-600">Error: {error}</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No social posts found. Create your first post to get started!</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        post.platform === 'twitter' ? 'bg-blue-100 text-blue-800' :
                        post.platform === 'facebook' ? 'bg-blue-600 text-white' :
                        post.platform === 'linkedin' ? 'bg-blue-700 text-white' :
                        'bg-pink-100 text-pink-800'
                      }`}>
                        {post.platform}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        post.status === 'published' ? 'bg-green-100 text-green-800' :
                        post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    {post.type === 'thread' ? (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-purple-600 text-sm font-medium">🧵 Twitter Thread</span>
                          <span className="text-xs text-gray-500">
                            {(() => {
                              try {
                                const threadData = JSON.parse(post.content)
                                return `${threadData.tweets?.length || 0} tweets`
                              } catch {
                                return 'Thread'
                              }
                            })()}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-700 max-h-20 overflow-y-auto">
                            {(() => {
                              try {
                                const threadData = JSON.parse(post.content)
                                const firstTweet = threadData.tweets?.[0]?.text || post.content
                                return firstTweet.substring(0, 150) + (firstTweet.length > 150 ? '...' : '')
                              } catch {
                                return post.content.substring(0, 150) + (post.content.length > 150 ? '...' : '')
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-900 text-sm mb-3 line-clamp-3">{post.content}</p>
                    )}
                    <div className="text-sm text-gray-500">
                      Views: {post.views} • Shares: {post.shares} • Likes: {post.likes}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{post.viralScore?.toFixed(1) || '0.0'}</div>
                    <div className="text-xs text-gray-500">Viral Score</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditPost(post)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => post.type === 'thread' ? handlePostThread(post.id) : handlePostToSocial(post.id)}
                    disabled={postingToSocial === post.id}
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {postingToSocial === post.id ? 'Posting...' : post.type === 'thread' ? 'Post Thread' : 'Post Now'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Social Post Modal */}
        {showPostForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingPost ? 'Edit Social Post' : 'Create Social Post'}
              </h2>
              <form onSubmit={handleCreateSocialPost}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                    <select 
                      value={newPost.platform}
                      onChange={(e) => setNewPost({...newPost, platform: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="twitter">Twitter</option>
                      <option value="facebook">Facebook</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="instagram">Instagram</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea 
                      value={newPost.content}
                      onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                      rows={4}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Link to Blog Post</label>
                    <select 
                      value={newPost.blogPostId}
                      onChange={(e) => setNewPost({...newPost, blogPostId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">No blog post</option>
                      {blogPosts.map(post => (
                        <option key={post.id} value={post.id}>{post.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Schedule (Optional)</label>
                    <input 
                      type="datetime-local"
                      value={newPost.scheduledAt}
                      onChange={(e) => setNewPost({...newPost, scheduledAt: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingPost ? 'Update Post' : 'Create Post'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowPostForm(false)
                      setEditingPost(null)
                      setNewPost({
                        content: '',
                        platform: 'twitter',
                        status: 'draft',
                        blogPostId: '',
                        scheduledAt: ''
                      })
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
