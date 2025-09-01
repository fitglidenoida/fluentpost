'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'

interface Campaign {
  id: string
  name: string
  goal: string
  description: string
  contentPillars: string[]
  contentTypes: string[]
  status: string
}

interface ContentIdea {
  id: string
  title: string
  type: string
  pillar: string
  description: string
  keywords: string[]
  status: string
  priority: string
}

function ContentStudioContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('campaign')
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Enhanced Content Creation States
  const [contentType, setContentType] = useState<'ideas' | 'templates' | 'calendar' | 'performance'>('ideas')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Instagram')
  const [contentTemplate, setContentTemplate] = useState<any>(null)
  
  const [newIdea, setNewIdea] = useState({
    title: '',
    type: '',
    pillar: '',
    description: '',
    keywords: '',
    priority: 'medium',
    platform: '',
    scheduledDate: '',
    caption: '',
    hashtags: ''
  })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  useEffect(() => {
    if (campaignId && campaigns.length > 0) {
      const campaign = campaigns.find(c => c.id === campaignId)
      if (campaign) {
        setSelectedCampaign(campaign)
        generateContentIdeas(campaign)
      }
    }
  }, [campaignId, campaigns])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns')
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    }
  }

  const generateContentIdeas = (campaign: Campaign) => {
    // Generate sample content ideas based on campaign
    const ideas: ContentIdea[] = []
    const types = campaign.contentTypes || ['Blog Article', 'Social Post', 'Video']
    const pillars = campaign.contentPillars || ['General Content']

    pillars.forEach((pillar, pillarIndex) => {
      types.forEach((type, typeIndex) => {
        const id = `idea_${campaign.id}_${pillarIndex}_${typeIndex}`
        ideas.push({
          id,
          title: `${pillar} ${type} - ${campaign.goal}`,
          type,
          pillar,
          description: `Strategic ${type.toLowerCase()} content focused on ${pillar.toLowerCase()} for ${campaign.goal.toLowerCase()}`,
          keywords: [`${pillar.toLowerCase()}`, `${campaign.goal.toLowerCase().replace(' ', '_')}`],
          status: 'planned',
          priority: typeIndex === 0 ? 'high' : typeIndex === 1 ? 'medium' : 'low'
        })
      })
    })

    setContentIdeas(ideas)
  }

  const createContentIdea = () => {
    if (!newIdea.title || !selectedCampaign) return

    const idea: ContentIdea = {
      id: `idea_${Date.now()}`,
      title: newIdea.title,
      type: newIdea.type,
      pillar: newIdea.pillar,
      description: newIdea.description,
      keywords: newIdea.keywords.split(',').map(k => k.trim()).filter(k => k),
      status: 'planned',
      priority: newIdea.priority
    }

    setContentIdeas(prev => [idea, ...prev])
    setNewIdea({
      title: '',
      type: '',
      pillar: '',
      description: '',
      keywords: '',
      priority: 'medium'
    })
    setShowCreateModal(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'planned': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="content" />
      
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Campaign Content Studio</h1>
            <p className="text-gray-600 text-lg">SMO content creation, templates, scheduling, and performance tracking</p>
          </div>
          
          {!selectedCampaign && (
            <button 
              onClick={() => router.push('/campaigns')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              🎯 Select Campaign
            </button>
          )}
        </div>

        {/* Campaign Selection */}
        {!selectedCampaign ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Choose a Campaign for Content Creation</h2>
              <p className="text-gray-600">Select a campaign to create content aligned with its strategy and pillars</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <div 
                  key={campaign.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedCampaign(campaign)
                    generateContentIdeas(campaign)
                  }}
                >
                  <div className="flex items-center mb-3">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      campaign.status === 'active' ? 'bg-green-500' : 
                      campaign.status === 'planning' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                      {campaign.goal}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{campaign.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{campaign.contentPillars?.length || 0} pillars</span>
                      <span>{campaign.contentTypes?.length || 0} content types</span>
                    </div>
                    <div className="text-right">
                      <span className="text-blue-600 text-sm font-medium">Create Content →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {campaigns.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Campaigns Found</h3>
                <p className="text-gray-500 mb-6">Create your first campaign to start creating strategic content</p>
                <button 
                  onClick={() => router.push('/campaigns')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create Campaign
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Selected Campaign Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button 
                    onClick={() => setSelectedCampaign(null)}
                    className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedCampaign.name}</h2>
                    <p className="text-gray-600">{selectedCampaign.goal} • Content Strategy</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    ✨ New Idea
                  </button>
                  <button 
                    onClick={() => router.push(`/campaigns/${selectedCampaign.id}`)}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
                  >
                    View Campaign →
                  </button>
                </div>
              </div>

              {/* Content Pillars */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Content Pillars</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCampaign.contentPillars?.map((pillar, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {pillar}
                    </span>
                  )) || (
                    <p className="text-gray-500 text-sm">No content pillars defined</p>
                  )}
                </div>
              </div>
            </div>

            {/* Content Type Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {[
                    { id: 'ideas', label: '💡 Content Ideas', desc: 'Brainstorm and organize content' },
                    { id: 'templates', label: '🎨 Platform Templates', desc: 'Ready-to-use content templates' },
                    { id: 'calendar', label: '📅 Content Calendar', desc: 'Schedule and plan content' },
                    { id: 'performance', label: '📊 Performance', desc: 'Track content performance' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setContentType(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        contentType === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <div>{tab.label}</div>
                        <div className="text-xs text-gray-400">{tab.desc}</div>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content Ideas Grid */}
            {contentType === 'ideas' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {contentIdeas.map((idea) => (
                <div key={idea.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{idea.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{idea.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{idea.type}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(idea.priority)}`}>
                        {idea.priority}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Content Pillar</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                        {idea.pillar}
                      </span>
                    </div>

                    {idea.keywords.length > 0 && (
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">Target Keywords</span>
                        <div className="flex flex-wrap gap-1">
                          {idea.keywords.slice(0, 3).map((keyword, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {keyword}
                            </span>
                          ))}
                          {idea.keywords.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{idea.keywords.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(idea.status)}`}>
                        {idea.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                        Develop →
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add new content card */}
              <div 
                onClick={() => setShowCreateModal(true)}
                className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-6 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col items-center justify-center text-center min-h-[300px]"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Content</h3>
                <p className="text-gray-500 text-sm">Add a new content idea to your campaign</p>
              </div>
            </div>
            )}

            {/* Platform Templates */}
            {contentType === 'templates' && (
              <div className="space-y-6">
                {/* Platform Selector */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 Choose Platform Template</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {['Instagram', 'YouTube', 'LinkedIn', 'Facebook'].map((platform) => (
                      <button
                        key={platform}
                        onClick={() => setSelectedPlatform(platform)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedPlatform === platform
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">
                          {platform === 'Instagram' ? '📸' : 
                           platform === 'YouTube' ? '🎥' : 
                           platform === 'LinkedIn' ? '💼' : '👥'}
                        </div>
                        <div className="font-medium">{platform}</div>
                      </button>
                    ))}
                  </div>

                  {/* Templates for Selected Platform */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedPlatform === 'Instagram' && [
                      {
                        type: 'Instagram Post',
                        title: 'Workout Motivation Post',
                        preview: '💪 Transform your fitness journey...',
                        hashtags: '#FitnessMotivation #WorkoutWednesday #FitGlide',
                        engagement: 'High'
                      },
                      {
                        type: 'Instagram Story',
                        title: 'Quick Workout Tip',
                        preview: '⚡ 30-second fitness tip...',
                        hashtags: '#FitnessTips #QuickWorkout',
                        engagement: 'Medium'
                      },
                      {
                        type: 'Instagram Reel',
                        title: '60-Second HIIT Challenge',
                        preview: '🔥 Follow along for amazing results...',
                        hashtags: '#HIITWorkout #FitnessChallenge #Viral',
                        engagement: 'Very High'
                      }
                    ].map((template, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gray-900">{template.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            template.engagement === 'Very High' ? 'bg-red-100 text-red-800' :
                            template.engagement === 'High' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {template.engagement}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{template.preview}</p>
                        <p className="text-xs text-blue-600 mb-3">{template.hashtags}</p>
                        <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          Use Template
                        </button>
                      </div>
                    ))}
                    
                    {selectedPlatform === 'YouTube' && [
                      {
                        type: 'YouTube Video',
                        title: 'Fitness Routine Tutorial',
                        preview: '🎯 Complete beginner-friendly routine...',
                        hashtags: '#FitnessRoutine #Workout #Tutorial',
                        engagement: 'High'
                      },
                      {
                        type: 'YouTube Short',
                        title: 'Quick Exercise Demo',
                        preview: '⚡ Master this move in 60 seconds...',
                        hashtags: '#ExerciseTips #FitnessShorts',
                        engagement: 'Very High'
                      }
                    ].map((template, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gray-900">{template.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            template.engagement === 'Very High' ? 'bg-red-100 text-red-800' :
                            template.engagement === 'High' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {template.engagement}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{template.preview}</p>
                        <p className="text-xs text-blue-600 mb-3">{template.hashtags}</p>
                        <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          Use Template
                        </button>
                      </div>
                    ))}
                    
                    {selectedPlatform === 'LinkedIn' && [
                      {
                        type: 'LinkedIn Post',
                        title: 'Professional Fitness Tips',
                        preview: '💼 Workplace wellness strategies...',
                        hashtags: '#WorkplaceFitness #ProfessionalDevelopment',
                        engagement: 'Medium'
                      },
                      {
                        type: 'LinkedIn Article',
                        title: 'Fitness for Busy Professionals',
                        preview: '⏰ Time-efficient workouts for executives...',
                        hashtags: '#ExecutiveFitness #TimeManagement',
                        engagement: 'High'
                      }
                    ].map((template, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gray-900">{template.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            template.engagement === 'Very High' ? 'bg-red-100 text-red-800' :
                            template.engagement === 'High' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {template.engagement}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{template.preview}</p>
                        <p className="text-xs text-blue-600 mb-3">{template.hashtags}</p>
                        <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          Use Template
                        </button>
                      </div>
                    ))}
                    
                    {selectedPlatform === 'Facebook' && [
                      {
                        type: 'Facebook Post',
                        title: 'Community Fitness Challenge',
                        preview: '🏆 Join our 30-day challenge...',
                        hashtags: '#FitnessChallenge #Community #Motivation',
                        engagement: 'High'
                      },
                      {
                        type: 'Facebook Event',
                        title: 'Virtual Workout Session',
                        preview: '📅 Live workout session this weekend...',
                        hashtags: '#LiveWorkout #VirtualFitness',
                        engagement: 'Medium'
                      }
                    ].map((template, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gray-900">{template.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            template.engagement === 'Very High' ? 'bg-red-100 text-red-800' :
                            template.engagement === 'High' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {template.engagement}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{template.preview}</p>
                        <p className="text-xs text-blue-600 mb-3">{template.hashtags}</p>
                        <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          Use Template
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Content Calendar */}
            {contentType === 'calendar' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Content Calendar</h3>
                  
                  {/* Week View */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <div key={day} className="text-center font-medium text-gray-700 py-2">{day}</div>
                    ))}
                    
                    {/* Calendar Days with Content */}
                    {Array.from({length: 35}, (_, i) => {
                      const dayNumber = i - 6 + 1
                      const hasContent = [1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26, 29, 31].includes(dayNumber)
                      
                      return (
                        <div key={i} className={`min-h-[80px] border border-gray-200 rounded p-1 ${
                          dayNumber > 0 && dayNumber <= 31 ? 'bg-white' : 'bg-gray-50'
                        }`}>
                          {dayNumber > 0 && dayNumber <= 31 && (
                            <>
                              <div className="text-sm font-medium text-gray-900">{dayNumber}</div>
                              {hasContent && (
                                <div className="mt-1 space-y-1">
                                  <div className="text-xs bg-blue-100 text-blue-800 px-1 rounded">📸 IG Post</div>
                                  {dayNumber % 7 === 0 && (
                                    <div className="text-xs bg-green-100 text-green-800 px-1 rounded">🎥 YouTube</div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Upcoming Content */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">📋 Upcoming Content</h4>
                    <div className="space-y-2">
                      {[
                        { title: 'Morning Workout Motivation', platform: 'Instagram', date: 'Tomorrow 9:00 AM', status: 'Scheduled' },
                        { title: '5-Minute Abs Routine', platform: 'YouTube', date: 'Wed 6:00 PM', status: 'Draft' },
                        { title: 'Nutrition Tips for Busy Professionals', platform: 'LinkedIn', date: 'Fri 12:00 PM', status: 'Ready' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h5 className="font-medium text-gray-900">{item.title}</h5>
                            <p className="text-sm text-gray-600">{item.platform} • {item.date}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'Scheduled' ? 'bg-green-100 text-green-800' :
                            item.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Tracking */}
            {contentType === 'performance' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Performance Metrics */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 This Week</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Posts Published</span>
                          <span className="font-medium">12</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '80%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Total Engagement</span>
                          <span className="font-medium">45.2K</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '65%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Reach</span>
                          <span className="font-medium">128K</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div className="bg-purple-600 h-2 rounded-full" style={{width: '75%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Performing Content */}
                  <div className="md:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performing Content</h3>
                    <div className="space-y-4">
                      {[
                        {
                          title: '7-Day Abs Challenge',
                          platform: 'Instagram',
                          engagement: '12.3K',
                          reach: '45.7K',
                          performance: 'Excellent'
                        },
                        {
                          title: 'Home Workout Setup Tips',
                          platform: 'YouTube',
                          engagement: '8.9K',
                          reach: '32.1K',
                          performance: 'Very Good'
                        },
                        {
                          title: 'Fitness for Busy Professionals',
                          platform: 'LinkedIn',
                          engagement: '3.2K',
                          reach: '18.4K',
                          performance: 'Good'
                        }
                      ].map((content, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{content.title}</h4>
                            <p className="text-sm text-gray-600">{content.platform}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm text-center">
                            <div>
                              <div className="text-gray-500">Engagement</div>
                              <div className="font-medium text-blue-600">{content.engagement}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Reach</div>
                              <div className="font-medium text-green-600">{content.reach}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Performance</div>
                              <div className={`font-medium ${
                                content.performance === 'Excellent' ? 'text-green-600' :
                                content.performance === 'Very Good' ? 'text-blue-600' : 'text-yellow-600'
                              }`}>
                                {content.performance}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Create Content Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Content Idea</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newIdea.title}
                    onChange={(e) => setNewIdea({...newIdea, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Content title..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                    <select
                      value={newIdea.type}
                      onChange={(e) => setNewIdea({...newIdea, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select type...</option>
                      {selectedCampaign?.contentTypes?.map((type, index) => (
                        <option key={index} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content Pillar</label>
                    <select
                      value={newIdea.pillar}
                      onChange={(e) => setNewIdea({...newIdea, pillar: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select pillar...</option>
                      {selectedCampaign?.contentPillars?.map((pillar, index) => (
                        <option key={index} value={pillar}>{pillar}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newIdea.description}
                    onChange={(e) => setNewIdea({...newIdea, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Describe the content idea..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={newIdea.keywords}
                    onChange={(e) => setNewIdea({...newIdea, keywords: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={newIdea.priority}
                    onChange={(e) => setNewIdea({...newIdea, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={createContentIdea}
                  disabled={!newIdea.title}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Create Idea
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ContentStudio() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading Content Studio...</p>
        </div>
      </div>
    }>
      <ContentStudioContent />
    </Suspense>
  )
}