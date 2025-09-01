'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

interface Campaign {
  id: string
  name: string
  description: string
  status: 'planning' | 'active' | 'paused' | 'completed'
  goal: string
  objectives: string[]
  targetAudience: string
  budget: number
  duration: string
  startDate: string
  endDate: string
  contentPillars: string[]
  kpis: Array<{
    name: string
    target: number
    current: number
    unit: string
  }>
  keywords: string[]
  contentTypes: string[]
  platforms: string[]
  createdAt: string
}

export default function CampaignsHub() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '',
    description: '',
    goal: '',
    objectives: [''],
    targetAudience: '',
    budget: 0,
    duration: '3 months',
    contentPillars: [''],
    keywords: [''],
    contentTypes: [''],
    platforms: ['']
  })

  useEffect(() => {
    // Fetch real campaigns from API
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns')
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      } else {
        console.error('Failed to fetch campaigns')
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'planning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'paused': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const calculateProgress = (campaign: Campaign) => {
    if (!campaign.kpis.length) return 0
    const avgProgress = campaign.kpis.reduce((sum, kpi) => 
      sum + Math.min((kpi.current / kpi.target) * 100, 100), 0
    ) / campaign.kpis.length
    return Math.round(avgProgress)
  }

  const createCampaign = async () => {
    if (!newCampaign.name || !newCampaign.goal) {
      alert('Please fill in campaign name and goal')
      return
    }

    try {
      const campaignData = {
        name: newCampaign.name!,
        description: newCampaign.description || '',
        goal: newCampaign.goal!,
        objectives: newCampaign.objectives?.filter(obj => obj.trim()) || [],
        targetAudience: newCampaign.targetAudience || '',
        budget: newCampaign.budget || 0,
        duration: newCampaign.duration || '3 months',
        contentPillars: newCampaign.contentPillars?.filter(pillar => pillar.trim()) || [],
        keywords: newCampaign.keywords?.filter(kw => kw.trim()) || [],
        contentTypes: newCampaign.contentTypes?.filter(type => type.trim()) || [],
        platforms: newCampaign.platforms?.filter(platform => platform.trim()) || [],
        status: 'planning' as const
      }

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignData)
      })

      if (response.ok) {
        const result = await response.json()
        await fetchCampaigns() // Refresh the campaigns list
        setShowCreateModal(false)
        setNewCampaign({
          name: '',
          description: '',
          goal: '',
          objectives: [''],
          targetAudience: '',
          budget: 0,
          duration: '3 months',
          contentPillars: [''],
          keywords: [''],
          contentTypes: [''],
          platforms: ['']
        })
        alert('Campaign created successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to create campaign: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating campaign:', error)
      alert('Failed to create campaign. Please try again.')
    }
  }

  const addArrayField = (field: keyof Pick<Campaign, 'objectives' | 'contentPillars' | 'keywords' | 'contentTypes' | 'platforms'>) => {
    setNewCampaign(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }))
  }

  const updateArrayField = (field: keyof Pick<Campaign, 'objectives' | 'contentPillars' | 'keywords' | 'contentTypes' | 'platforms'>, index: number, value: string) => {
    setNewCampaign(prev => ({
      ...prev,
      [field]: (prev[field] || []).map((item, i) => i === index ? value : item)
    }))
  }

  const removeArrayField = (field: keyof Pick<Campaign, 'objectives' | 'contentPillars' | 'keywords' | 'contentTypes' | 'platforms'>, index: number) => {
    setNewCampaign(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }))
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
              <p className="text-sm text-gray-500">Marketing Hub</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <Link href="/" className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
              Dashboard
            </Link>
            <div className="w-full flex items-center px-4 py-3 rounded-lg text-left bg-blue-600 text-white">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              🎯 Campaigns
            </div>
            <Link href="/research" className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Research Hub
            </Link>
            <Link href="/content" className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Content Studio
            </Link>
            <Link href="/calendar" className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar
            </Link>
          </nav>
        </div>

        {/* FitGlide Branding */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-2">Campaign-First Strategy</div>
            <div className="text-sm font-medium text-gray-900">FitGlide Marketing Hub</div>
            <div className="text-xs text-green-600 mt-1">🎯 Strategic Content Planning</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Campaign Strategy Hub</h1>
            <p className="text-gray-600 text-lg">Plan campaigns first, then create content with purpose! 🚀</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Campaign
          </button>
        </div>

        {/* Strategy Process Flow */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🎪 Campaign-First Workflow</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold">1</span>
              </div>
              <div className="text-sm font-medium text-gray-900">Campaign Setup</div>
              <div className="text-xs text-gray-600">Goals & Audience</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold">2</span>
              </div>
              <div className="text-sm font-medium text-gray-900">Keyword Research</div>
              <div className="text-xs text-gray-600">Based on Goals</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold">3</span>
              </div>
              <div className="text-sm font-medium text-gray-900">Content Pillars</div>
              <div className="text-xs text-gray-600">Strategic Themes</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold">4</span>
              </div>
              <div className="text-sm font-medium text-gray-900">Content Calendar</div>
              <div className="text-xs text-gray-600">Planned Schedule</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold">5</span>
              </div>
              <div className="text-sm font-medium text-gray-900">Content Creation</div>
              <div className="text-xs text-gray-600">Execute & Track</div>
            </div>
          </div>
        </div>

        {/* Campaign Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              {/* Campaign Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{campaign.name}</h3>
                    <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(campaign.status)}`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{campaign.description}</p>
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">Goal:</span> 
                    <span className="text-blue-600 ml-1">{campaign.goal}</span>
                  </div>
                </div>
              </div>

              {/* KPI Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Campaign Progress</h4>
                  <span className="text-lg font-bold text-blue-600">{calculateProgress(campaign)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${calculateProgress(campaign)}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {campaign.kpis.slice(0, 4).map((kpi, index) => (
                    <div key={index} className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-900">{kpi.current.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{kpi.name}</div>
                      <div className="text-xs text-blue-600">{Math.round((kpi.current / kpi.target) * 100)}% of target</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Strategy */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Content Strategy</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Content Pillars:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {campaign.contentPillars.slice(0, 3).map((pillar, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {pillar}
                        </span>
                      ))}
                      {campaign.contentPillars.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{campaign.contentPillars.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Platforms:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {campaign.platforms.map((platform, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link 
                  href={`/research?campaign=${campaign.id}`}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  🔍 Research Keywords
                </Link>
                <Link 
                  href={`/content?campaign=${campaign.id}`}
                  className="flex-1 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors text-center"
                >
                  ✍️ Create Content
                </Link>
                <Link 
                  href={`/campaigns/${campaign.id}`}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  📊 Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {campaigns.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Start with Strategy! 🎯</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create your first campaign to establish clear goals, target audience, and content strategy before jumping into content creation.
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Your First Campaign 🚀
            </button>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">🎯 Create Strategic Campaign</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">📋 Campaign Basics</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name *</label>
                    <input 
                      type="text"
                      value={newCampaign.name || ''}
                      onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                      placeholder="e.g., FitGlide Summer Transformation 2024"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea 
                      value={newCampaign.description || ''}
                      onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                      placeholder="Brief description of your campaign..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary Goal *</label>
                                        <select
                      value={newCampaign.goal || ''}
                      onChange={(e) => setNewCampaign({...newCampaign, goal: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select primary goal...</option>
                      
                      {/* SEO Goals */}
                      <optgroup label="🔍 SEO & Content Marketing">
                        <option value="Brand Awareness">Brand Awareness</option>
                        <option value="Lead Generation">Lead Generation</option>
                        <option value="Sales Conversion">Sales Conversion</option>
                        <option value="Content Education">Content Education</option>
                      </optgroup>
                      
                      {/* SMO Goals */}
                      <optgroup label="📱 Social Media Marketing (SMO)">
                        <option value="Social Media Growth">📈 Social Media Growth</option>
                        <option value="Viral Content">🔥 Viral Content Creation</option>
                        <option value="Influencer Partnerships">🤝 Influencer Partnerships</option>
                        <option value="Community Engagement">💬 Community Engagement</option>
                        <option value="User Generated Content">📸 User Generated Content</option>
                        <option value="Social Media Awareness">🌟 Social Media Brand Awareness</option>
                      </optgroup>
                      
                      {/* App Marketing Goals */}
                      <optgroup label="📱 App Marketing">
                        <option value="Mobile App Downloads">📱 Mobile App Downloads</option>
                        <option value="App Store Optimization">🏪 App Store Optimization (ASO)</option>
                        <option value="User Acquisition">👥 User Acquisition</option>
                        <option value="App Retention">🔄 User Retention & Engagement</option>
                        <option value="App Reviews">⭐ App Store Reviews & Ratings</option>
                        <option value="Cross Platform Promotion">🔗 Cross-Platform App Promotion</option>
                      </optgroup>
                      
                      {/* Hybrid Goals */}
                      <optgroup label="🎯 Integrated Marketing">
                        <option value="Omnichannel Marketing">🌐 Omnichannel Marketing</option>
                        <option value="Website to App Funnel">🔄 Website → App Download Funnel</option>
                        <option value="Community Building">🏘️ Community Building</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                    <textarea 
                      value={newCampaign.targetAudience || ''}
                      onChange={(e) => setNewCampaign({...newCampaign, targetAudience: e.target.value})}
                      placeholder="e.g., Fitness enthusiasts aged 25-45, seeking home workout solutions..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Strategy Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">🎯 Strategy & Content</h3>
                  
                  {/* Campaign Objectives */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Objectives</label>
                    {(newCampaign.objectives || ['']).map((objective, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input 
                          type="text"
                          value={objective}
                          onChange={(e) => updateArrayField('objectives', index, e.target.value)}
                          placeholder="e.g., Increase website traffic by 200%"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {index > 0 && (
                          <button 
                            onClick={() => removeArrayField('objectives', index)}
                            className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      onClick={() => addArrayField('objectives')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Objective
                    </button>
                  </div>

                  {/* Content Pillars */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content Pillars</label>
                    {(newCampaign.contentPillars || ['']).map((pillar, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input 
                          type="text"
                          value={pillar}
                          onChange={(e) => updateArrayField('contentPillars', index, e.target.value)}
                          placeholder="e.g., Home Workouts, Nutrition Tips"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {index > 0 && (
                          <button 
                            onClick={() => removeArrayField('contentPillars', index)}
                            className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      onClick={() => addArrayField('contentPillars')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Content Pillar
                    </button>
                  </div>

                  {/* Seed Keywords */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seed Keywords</label>
                    {(newCampaign.keywords || ['']).map((keyword, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input 
                          type="text"
                          value={keyword}
                          onChange={(e) => updateArrayField('keywords', index, e.target.value)}
                          placeholder="e.g., home workout, fitness routine"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {index > 0 && (
                          <button 
                            onClick={() => removeArrayField('keywords', index)}
                            className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      onClick={() => addArrayField('keywords')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Keyword
                    </button>
                  </div>

                  {/* Platforms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Platforms</label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Social Media Platforms */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">📱 Social Media (SMO)</h4>
                        <div className="space-y-2">
                          {[
                            { id: 'instagram', label: '📸 Instagram', desc: 'Posts, Stories, Reels, IGTV' },
                            { id: 'youtube', label: '🎥 YouTube', desc: 'Videos, Shorts, Community' },
                            { id: 'facebook', label: '👥 Facebook', desc: 'Posts, Groups, Events' },
                            { id: 'linkedin', label: '💼 LinkedIn', desc: 'Professional networking' },
                            { id: 'twitter', label: '🐦 Twitter/X', desc: 'Tweets, Threads, Spaces' },
                            { id: 'pinterest', label: '📌 Pinterest', desc: 'Pins, Boards, Ideas' }
                          ].map((platform) => (
                            <label key={platform.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(newCampaign.platforms || []).includes(platform.label)}
                                onChange={(e) => {
                                  const platforms = newCampaign.platforms || []
                                  if (e.target.checked) {
                                    setNewCampaign({...newCampaign, platforms: [...platforms, platform.label]})
                                  } else {
                                    setNewCampaign({...newCampaign, platforms: platforms.filter(p => p !== platform.label)})
                                  }
                                }}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{platform.label}</div>
                                <div className="text-xs text-gray-500">{platform.desc}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* App Marketing Platforms */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">📱 App Marketing</h4>
                        <div className="space-y-2">
                          {[
                            { id: 'app-store', label: '🍎 Apple App Store', desc: 'iOS app optimization' },
                            { id: 'google-play', label: '🤖 Google Play Store', desc: 'Android app optimization' },
                            { id: 'website', label: '🌐 Website/Blog', desc: 'Organic traffic conversion' },
                            { id: 'email', label: '📧 Email Marketing', desc: 'Newsletter campaigns' },
                            { id: 'push-notifications', label: '🔔 Push Notifications', desc: 'In-app engagement' },
                            { id: 'fitness-forums', label: '🏋️ Fitness Forums', desc: 'Community engagement' }
                          ].map((platform) => (
                            <label key={platform.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={(newCampaign.platforms || []).includes(platform.label)}
                                onChange={(e) => {
                                  const platforms = newCampaign.platforms || []
                                  if (e.target.checked) {
                                    setNewCampaign({...newCampaign, platforms: [...platforms, platform.label]})
                                  } else {
                                    setNewCampaign({...newCampaign, platforms: platforms.filter(p => p !== platform.label)})
                                  }
                                }}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{platform.label}</div>
                                <div className="text-xs text-gray-500">{platform.desc}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Selected Platforms Display */}
                    {(newCampaign.platforms || []).length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h5 className="text-sm font-medium text-blue-900 mb-2">Selected Platforms:</h5>
                        <div className="flex flex-wrap gap-2">
                          {(newCampaign.platforms || []).map((platform, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
                              {platform}
                              <button
                                onClick={() => {
                                  const platforms = newCampaign.platforms || []
                                  setNewCampaign({...newCampaign, platforms: platforms.filter(p => p !== platform)})
                                }}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={createCampaign}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  🚀 Create Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}