import { notFound } from 'next/navigation'
import db from '@/lib/db'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  _count?: {
    blogPosts: number
    socialPosts: number
    campaigns: number
    topics: number
  }
  blogPosts?: any[]
  socialPosts?: any[]
}

interface UserPageProps {
  params: Promise<{ id: string }>
}

async function getUserData(id: string): Promise<User | null> {
  try {
    // Get user from database
    const user = db.queryFirst('SELECT * FROM User WHERE id = ?', [id])

    if (!user) return null

    // Add mock counts and related data since related tables don't exist
    return {
      ...user,
      _count: {
        blogPosts: 0,
        socialPosts: 0,
        campaigns: 0,
        topics: 0
      },
      blogPosts: [],
      socialPosts: []
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params
  const user = await getUserData(id)

  if (!user) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="h-20 w-20 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-gray-600">
                {user.name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {user.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{user._count?.blogPosts || 0}</div>
              <div className="text-sm text-gray-600">Blog Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{user._count?.socialPosts || 0}</div>
              <div className="text-sm text-gray-600">Social Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{user._count?.campaigns || 0}</div>
              <div className="text-sm text-gray-600">Campaigns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{user._count?.topics || 0}</div>
              <div className="text-sm text-gray-600">Topics</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Blog Posts</h2>
            {user.blogPosts?.length ? (
              <div className="space-y-3">
                {user.blogPosts.map((post: any) => (
                  <div key={post.id} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-medium text-gray-900">{post.title}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {post.views} views • {post.shares} shares
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No blog posts yet.</p>
            )}
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Social Posts</h2>
            {user.socialPosts?.length ? (
              <div className="space-y-3">
                {user.socialPosts.map((post: any) => (
                  <div key={post.id} className="border-l-4 border-green-500 pl-4">
                    <p className="text-gray-900">{post.content}</p>
                    <div className="text-sm text-gray-600 mt-1">
                      {post.platform} • {post.views} views
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No social posts yet.</p>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Member Since</label>
              <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">User ID</label>
              <p className="text-gray-900 font-mono text-sm">{user.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}