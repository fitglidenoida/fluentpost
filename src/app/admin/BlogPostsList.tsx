'use client'

import { useState, useEffect } from 'react'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  status: string
  views: number
  shares: number
  likes: number
  createdAt: string
  topic?: {
    id: string
    title: string
    category: string
  }
}

interface BlogPostsListProps {
  onShareToSocial: (blogPostId: string) => Promise<void>
  sharingToSocial: string | null
}

export default function BlogPostsList({ onShareToSocial, sharingToSocial }: BlogPostsListProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBlogPosts()
  }, [])

  const loadBlogPosts = async () => {
    try {
      const response = await fetch('/api/blog-posts')
      if (response.ok) {
        const data = await response.json()
        setBlogPosts(data.blogPosts)
      }
    } catch (error) {
      console.error('Error loading blog posts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading blog posts...</div>
  }

  if (blogPosts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No blog posts created yet. Create one from an AI response above!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {blogPosts.map((post) => (
        <div key={post.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                {post.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Status: {post.status}</span>
                <span>Views: {post.views}</span>
                <span>Shares: {post.shares}</span>
                <span>Likes: {post.likes}</span>
                <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onShareToSocial(post.id)}
                disabled={sharingToSocial === post.id}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {sharingToSocial === post.id ? 'Sharing...' : '📤 Share'}
              </button>
              <a
                href={`/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                👁️ View
              </a>
            </div>
          </div>
          {post.topic && (
            <div className="text-xs text-gray-500">
              Topic: {post.topic.title} ({post.topic.category})
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
