import db from '@/lib/db'
import { notFound } from 'next/navigation'

interface Campaign {
  id: string
  name: string
  description?: string
  status: string
  goal: string
  budget?: number
  startDate: string
  endDate: string
  targetAudience?: string
  createdAt: string
  analytics?: Array<{
    id: string
    type: string
    metric: string
    value: number
  }>
}

async function getCampaignData(id: string): Promise<Campaign | null> {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        analytics: {
          select: {
            id: true,
            type: true,
            metric: true,
            value: true,
          },
        },
      },
    })

    if (!campaign) return null

    return {
      ...campaign,
      description: campaign.description || undefined,
      startDate: campaign.startDate?.toISOString() || new Date().toISOString(),
      endDate: campaign.endDate?.toISOString() || new Date().toISOString(),
      createdAt: campaign.createdAt.toISOString(),
    }
  } catch (error) {
    console.error('Error fetching campaign data:', error)
    return null
  }
}

export default async function CampaignDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const campaign = await getCampaignData(id)

  if (!campaign) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'planning': return 'bg-yellow-100 text-yellow-800'
      case 'paused': return 'bg-orange-100 text-orange-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateProgress = (campaign: Campaign) => {
    const totalValue = campaign.analytics?.reduce((sum, analytics) => sum + analytics.value, 0) || 0
    return Math.min(Math.round(totalValue / 10), 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
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
            <div className="w-full flex items-center px-4 py-3 rounded-lg text-left bg-blue-600 text-white">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Campaigns
            </div>
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
          <div className="flex items-center gap-4">
            <a 
              href="/campaigns"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Campaigns
            </a>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.name}</h1>
              <div className="flex items-center gap-4">
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(campaign.status)}`}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </span>
                <span className="text-gray-500 text-sm">Created {formatDate(campaign.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <a 
              href={`/campaigns/${campaign.id}/edit`}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Campaign
            </a>
          </div>
        </div>

        {/* Campaign Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Campaign Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {campaign.description && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-600 leading-relaxed">{campaign.description}</p>
              </div>
            )}

            {/* Progress */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-semibold text-gray-900">{calculateProgress(campaign)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress(campaign)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Goal:</span>
                    <span className="ml-2 font-medium text-gray-900">{campaign.goal}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(campaign.status)}`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
              {campaign.analytics && campaign.analytics.length > 0 ? (
                <div className="space-y-3">
                  {campaign.analytics.map((analytic) => (
                    <div key={analytic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{analytic.metric}</span>
                        <span className="text-gray-500 text-sm ml-2">({analytic.type})</span>
                      </div>
                      <span className="font-semibold text-blue-600">{analytic.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No analytics data available yet</p>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Campaign Details */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-500 text-sm">Goal</span>
                  <p className="font-medium text-gray-900">{campaign.goal}</p>
                </div>
                {campaign.budget && campaign.budget > 0 && (
                  <div>
                    <span className="text-gray-500 text-sm">Budget</span>
                    <p className="font-medium text-gray-900">{formatCurrency(campaign.budget)}</p>
                  </div>
                )}
                {campaign.targetAudience && (
                  <div>
                    <span className="text-gray-500 text-sm">Target Audience</span>
                    <p className="font-medium text-gray-900">{campaign.targetAudience}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 text-sm">Duration</span>
                  <p className="font-medium text-gray-900">
                    {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Created</span>
                  <p className="font-medium text-gray-900">{formatDate(campaign.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a 
                  href={`/campaigns/${campaign.id}/edit`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Campaign
                </a>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share Campaign
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
