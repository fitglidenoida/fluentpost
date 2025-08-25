import { formatNumber } from '@/lib/utils'
import { prisma } from '@/lib/db'

async function getAnalyticsData() {
  try {
    const [
      blogPosts, socialPosts, totalViews, totalShares, totalLikes, recentBlogPosts, recentSocialPosts
    ] = await Promise.all([
      prisma.blogPost.count(),
      prisma.socialPost.count(),
      prisma.blogPost.aggregate({ _sum: { views: true } }),
      prisma.blogPost.aggregate({ _sum: { shares: true } }),
      prisma.blogPost.aggregate({ _sum: { likes: true } }),
      prisma.blogPost.findMany({ 
        take: 5, 
        orderBy: { createdAt: 'desc' }, 
        select: { 
          id: true, 
          title: true, 
          views: true, 
          shares: true, 
          likes: true, 
          viralScore: true, 
          createdAt: true 
        } 
      }),
      prisma.socialPost.findMany({ 
        take: 5, 
        orderBy: { createdAt: 'desc' }, 
        select: { 
          id: true, 
          content: true, 
          platform: true, 
          views: true, 
          shares: true, 
          likes: true, 
          createdAt: true 
        } 
      })
    ])

    const viralCoefficient = totalViews._sum.views && totalShares._sum.shares
      ? (totalShares._sum.shares / totalViews._sum.views * 100).toFixed(2)
      : '0.00'

    const topContent = recentBlogPosts.map((post: any) => ({
      title: post.title,
      views: post.views || 0,
      shares: post.shares || 0,
      likes: post.likes || 0,
      viralScore: post.viralScore || 0
    }))

    const recentActivity = [
      ...recentBlogPosts.map((post: any) => ({ 
        type: 'blog_published', 
        title: post.title, 
        time: new Date(post.createdAt).toLocaleDateString() 
      })),
      ...recentSocialPosts.map((post: any) => ({ 
        type: 'social_posted', 
        platform: post.platform, 
        time: new Date(post.createdAt).toLocaleDateString() 
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10)

    return {
      totalUsers: blogPosts + socialPosts, // Real user count based on content
      viralCoefficient,
      totalViews: totalViews._sum.views || 0,
      totalShares: totalShares._sum.shares || 0,
      totalLikes: totalLikes._sum.likes || 0,
      topContent,
      recentActivity,
      blogPostsCount: blogPosts,
      socialPostsCount: socialPosts
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    // Return empty data structure if there's an error
    return {
      totalUsers: 0,
      viralCoefficient: "0.00",
      totalViews: 0,
      totalShares: 0,
      totalLikes: 0,
      topContent: [],
      recentActivity: [],
      blogPostsCount: 0,
      socialPostsCount: 0
    }
  }
}

export default async function Analytics() {
  const analyticsData = await getAnalyticsData()

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
            <div className="w-full flex items-center px-4 py-3 rounded-lg text-left bg-blue-600 text-white">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600 text-lg">Track performance and optimize your marketing campaigns</p>
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Users</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">{formatNumber(analyticsData.totalUsers)}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">Total content creators</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Viral Coefficient</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">{analyticsData.viralCoefficient}%</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">Shares per view ratio</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Views</h3>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">{formatNumber(analyticsData.totalViews)}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">Total content views</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Shares</h3>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
            </div>
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">{formatNumber(analyticsData.totalShares)}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">Total content shares</p>
          </div>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Performance Overview</h3>
              <button className="text-blue-600 hover:text-blue-800 text-sm">View Details</button>
            </div>
            <div className="h-80 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Chart</h3>
                <p className="text-gray-600">Interactive charts coming soon</p>
                <p className="text-sm text-gray-500 mt-1">Real-time analytics and insights</p>
              </div>
            </div>
          </div>

          {/* Top Performing Content */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Top Performing Content</h3>
              <button className="text-blue-600 hover:text-blue-800 text-sm">View All</button>
            </div>
            <div className="space-y-4">
              {analyticsData.topContent?.slice(0, 3).map((content: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{content.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatNumber(content.views)} views</span>
                      <span>{formatNumber(content.shares)} shares</span>
                      <span>{formatNumber(content.likes)} likes</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{content.viralScore}</div>
                    <div className="text-xs text-gray-500">Viral Score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm">View All</button>
          </div>
          <div className="space-y-4">
            {analyticsData.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">
                    {activity.type === 'blog_published' && 'New blog post published'}
                    {activity.type === 'social_posted' && 'Social post published'}
                    {activity.type === 'campaign_launched' && 'Campaign launched'}
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">
                    {'title' in activity ? activity.title : `${activity.platform} post`}
                  </p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
