import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
  blogPostsCount: number
  socialPostsCount: number
  campaignsCount: number
  topicsCount: number
  totalViews: number
  totalShares: number
  totalLikes: number
  viralScore: number
  blogPosts: Array<{
    id: string
    title: string
    views: number
    shares: number
    likes: number
    viralScore: number
    createdAt: string
  }>
  socialPosts: Array<{
    id: string
    content: string
    platform: string
    views: number
    shares: number
    likes: number
    viralScore: number
    createdAt: string
  }>
}

async function getUserData(id: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            blogPosts: true,
            socialPosts: true,
            campaigns: true,
            topics: true
          }
        },
        blogPosts: {
          select: {
            id: true,
            title: true,
            views: true,
            shares: true,
            likes: true,
            viralScore: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        socialPosts: {
          select: {
            id: true,
            content: true,
            platform: true,
            views: true,
            shares: true,
            likes: true,
            viralScore: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!user) return null

    // Calculate totals
    const totalViews = [
      ...user.blogPosts.map(post => post.views),
      ...user.socialPosts.map(post => post.views)
    ].reduce((sum, views) => sum + views, 0)

    const totalShares = [
      ...user.blogPosts.map(post => post.shares),
      ...user.socialPosts.map(post => post.shares)
    ].reduce((sum, shares) => sum + shares, 0)

    const totalLikes = [
      ...user.blogPosts.map(post => post.likes),
      ...user.socialPosts.map(post => post.likes)
    ].reduce((sum, likes) => sum + likes, 0)

    const totalViralScore = [
      ...user.blogPosts.map(post => post.viralScore),
      ...user.socialPosts.map(post => post.viralScore)
    ].reduce((sum, score) => sum + score, 0)

    const totalPosts = user.blogPosts.length + user.socialPosts.length
    const averageViralScore = totalPosts > 0 ? totalViralScore / totalPosts : 0

    return {
      id: user.id,
      name: user.name || 'Unknown User',
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      blogPostsCount: user._count.blogPosts,
      socialPostsCount: user._count.socialPosts,
      campaignsCount: user._count.campaigns,
      topicsCount: user._count.topics,
      totalViews,
      totalShares,
      totalLikes,
      viralScore: parseFloat(averageViralScore.toFixed(1)),
      blogPosts: user.blogPosts.map(post => ({
        ...post,
        createdAt: post.createdAt.toISOString()
      })),
      socialPosts: user.socialPosts.map(post => ({
        ...post,
        createdAt: post.createdAt.toISOString()
      }))
    }
  } catch (error) {
    console.error('Error fetching user data:', error)
    return null
  }
}

export default async function UserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getUserData(id)

  if (!user) {
    notFound()
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'user': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatContent = (content: string) => {
    return content.length > 100 ? content.substring(0, 100) + '...' : content
  }

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
            <a href="/social" className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Social Media
            </a>
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
            <div className="w-full flex items-center px-4 py-3 rounded-lg text-left bg-blue-600 text-white">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Users
            </div>
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
          <div className="flex items-center gap-4">
            <a 
              href="/users"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Users
            </a>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 text-sm rounded-full ${getRoleColor(user.role)}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <span className="text-gray-500 text-sm">Member since {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <a 
              href={`/users/${user.id}/edit`}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit User
            </a>
          </div>
        </div>

        {/* User Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main User Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">{user.blogPostsCount}</div>
                <div className="text-sm text-gray-600">Blog Posts</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">{user.socialPostsCount}</div>
                <div className="text-sm text-gray-600">Social Posts</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">{user.campaignsCount}</div>
                <div className="text-sm text-gray-600">Campaigns</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">{user.topicsCount}</div>
                <div className="text-sm text-gray-600">Topics</div>
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Overview</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{user.totalViews}</div>
                  <div className="text-sm text-gray-600">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{user.totalShares}</div>
                  <div className="text-sm text-gray-600">Total Shares</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{user.totalLikes}</div>
                  <div className="text-sm text-gray-600">Total Likes</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-1">{user.viralScore}</div>
                  <div className="text-sm text-gray-600">Average Viral Score</div>
                </div>
              </div>
            </div>

            {/* Recent Blog Posts */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Blog Posts</h3>
              {user.blogPosts.length > 0 ? (
                <div className="space-y-4">
                  {user.blogPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{post.title}</h4>
                        <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-blue-600">{post.views} views</span>
                        <span className="text-green-600">{post.shares} shares</span>
                        <span className="text-purple-600">{post.likes} likes</span>
                        <span className="text-orange-600 font-medium">{post.viralScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No blog posts yet</p>
              )}
            </div>

            {/* Recent Social Posts */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Social Posts</h3>
              {user.socialPosts.length > 0 ? (
                <div className="space-y-4">
                  {user.socialPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{post.platform}</span>
                          <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{formatContent(post.content)}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-blue-600">{post.views} views</span>
                        <span className="text-green-600">{post.shares} shares</span>
                        <span className="text-purple-600">{post.likes} likes</span>
                        <span className="text-orange-600 font-medium">{post.viralScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No social posts yet</p>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* User Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Details</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-500 text-sm">Name</span>
                  <p className="font-medium text-gray-900">{user.name}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Email</span>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Role</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Member Since</span>
                  <p className="font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Last Updated</span>
                  <p className="font-medium text-gray-900">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a 
                  href={`/users/${user.id}/edit`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit User
                </a>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  View Content
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
