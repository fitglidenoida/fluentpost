'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'

interface Campaign {
  id: string
  name: string
  goal: string
  description: string
  keywords: string[]
  status: string
}

interface Keyword {
  id: string
  keyword: string
  searchVolume?: number | null
  difficulty?: number | null
  competition?: number | null
  intent: string
  suggestions?: string[]
}

function ResearchHubContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('campaign')
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  
  // SMO Research States
  const [researchType, setResearchType] = useState<'seo' | 'smo' | 'trending' | 'hashtags' | 'competitors'>('seo')
  const [hashtags, setHashtags] = useState<any[]>([])
  const [trendingTopics, setTrendingTopics] = useState<any[]>([])
  const [competitorData, setCompetitorData] = useState<any[]>([])
  const [smoTrends, setSmoTrends] = useState<any[]>([])
  const [isLoadingSMO, setIsLoadingSMO] = useState(false)
  const [dataSource, setDataSource] = useState<'real' | 'fallback'>('fallback')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  useEffect(() => {
    if (campaignId && campaigns.length > 0) {
      const campaign = campaigns.find(c => c.id === campaignId)
      if (campaign) {
        setSelectedCampaign(campaign)
        fetchCampaignKeywords(campaignId)
      }
    }
  }, [campaignId, campaigns])

  // SMO Data Fetching Effects
  useEffect(() => {
    if (selectedCampaign && researchType === 'smo') {
      fetchSMOTrends()
    }
  }, [selectedCampaign, researchType])

  useEffect(() => {
    if (selectedCampaign && researchType === 'hashtags') {
      fetchHashtags()
    }
  }, [selectedCampaign, researchType])

  useEffect(() => {
    if (selectedCampaign && researchType === 'competitors') {
      fetchCompetitors()
    }
  }, [selectedCampaign, researchType])

  // Auto-refresh SMO data every 5 minutes
  useEffect(() => {
    if (selectedCampaign && (researchType === 'smo' || researchType === 'hashtags' || researchType === 'competitors')) {
      const interval = setInterval(() => {
        refreshSMOData()
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearInterval(interval)
    }
  }, [selectedCampaign, researchType])

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

  const fetchCampaignKeywords = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/seo/keywords?campaignId=${id}`)
      if (response.ok) {
        const data = await response.json()
        setKeywords(data.keywords || [])
      }
    } catch (error) {
      console.error('Error fetching keywords:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchKeywords = async () => {
    if (!searchTerm.trim() || !selectedCampaign) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/seo/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: searchTerm,
          campaignId: selectedCampaign.id,
          includeVariations: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions(data.suggestions)
          // Add new keywords to the list
          const newKeywords = data.suggestions.map((suggestion: string, index: number) => ({
            id: `kw_${Date.now()}_${index}`,
            keyword: suggestion,
            searchVolume: Math.floor(Math.random() * 10000) + 100,
            difficulty: Math.floor(Math.random() * 100) + 1,
            competition: Math.floor(Math.random() * 100) + 1,
            intent: getKeywordIntent(suggestion) || 'navigational'
          }))
          setKeywords(prev => [...prev, ...newKeywords])
        }
      }
    } catch (error) {
      console.error('Error searching keywords:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getKeywordIntent = (keyword: string) => {
    if (keyword.includes('how to') || keyword.includes('what is') || keyword.includes('guide')) {
      return 'informational'
    } else if (keyword.includes('buy') || keyword.includes('price') || keyword.includes('review')) {
      return 'commercial'
    } else if (keyword.includes('best') || keyword.includes('vs') || keyword.includes('compare')) {
      return 'commercial'
    } else {
      return 'navigational'
    }
  }

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'informational': return 'bg-blue-100 text-blue-800'
      case 'commercial': return 'bg-green-100 text-green-800'
      case 'transactional': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyColor = (difficulty: number | null | undefined) => {
    const safedifficulty = difficulty || 0
    if (safedifficulty < 30) return 'text-green-600'
    if (safedifficulty < 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  // SMO Data Fetching Functions
  const fetchSMOTrends = async () => {
    try {
      setIsLoadingSMO(true)
      const response = await fetch('/api/smo/trends?category=fitness&timeframe=7d')
      if (response.ok) {
        const data = await response.json()
        setSmoTrends(data.trends || [])
        setDataSource(data.dataSource || 'fallback')
        setLastUpdated(new Date())
        console.log('SMO Trends Data Source:', data.dataSource)
      }
    } catch (error) {
      console.error('Error fetching SMO trends:', error)
      setDataSource('fallback')
    } finally {
      setIsLoadingSMO(false)
    }
  }

  const fetchHashtags = async () => {
    try {
      setIsLoadingSMO(true)
      const response = await fetch('/api/smo/hashtags?category=fitness&type=trending')
      if (response.ok) {
        const data = await response.json()
        setHashtags(data.hashtags || [])
        setDataSource(data.dataSource || 'fallback')
        setLastUpdated(new Date())
        console.log('Hashtags Data Source:', data.dataSource)
      }
    } catch (error) {
      console.error('Error fetching hashtags:', error)
      setDataSource('fallback')
    } finally {
      setIsLoadingSMO(false)
    }
  }

  const refreshSMOData = async () => {
    if (researchType === 'smo') {
      await fetchSMOTrends()
    } else if (researchType === 'hashtags') {
      await fetchHashtags()
    } else if (researchType === 'competitors') {
      await fetchCompetitors()
    }
  }

  const fetchCompetitors = async () => {
    try {
      setIsLoadingSMO(true)
      const response = await fetch('/api/smo/competitors?industry=fitness&limit=5')
      if (response.ok) {
        const data = await response.json()
        setCompetitorData(data.competitors || [])
      }
    } catch (error) {
      console.error('Error fetching competitors:', error)
    } finally {
      setIsLoadingSMO(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="research" />
      
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Campaign Research Hub</h1>
            <p className="text-gray-600 text-lg">SEO keywords, SMO trends, hashtags, and competitor analysis</p>
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Choose a Campaign to Research</h2>
              <p className="text-gray-600">Select a campaign to start researching keywords and content opportunities</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <div 
                  key={campaign.id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedCampaign(campaign)
                    fetchCampaignKeywords(campaign.id)
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
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {campaign.keywords?.length || 0} seed keywords
                    </span>
                    <span className="text-blue-600 text-sm font-medium">Research →</span>
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
                <p className="text-gray-500 mb-6">Create your first campaign to start researching keywords</p>
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
                    <p className="text-gray-600">{selectedCampaign.goal} • {selectedCampaign.status}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => router.push(`/campaigns/${selectedCampaign.id}`)}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
                >
                  View Campaign →
                </button>
              </div>
            </div>

            {/* Research Type Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {[
                    { id: 'seo', label: '🔍 SEO Keywords', desc: 'Traditional keyword research' },
                    { id: 'smo', label: '📱 SMO Trends', desc: 'Social media trending topics' },
                    { id: 'hashtags', label: '#️⃣ Hashtags', desc: 'Platform-specific hashtag research' },
                    { id: 'trending', label: '🔥 Viral Topics', desc: 'Trending fitness content' },
                    { id: 'competitors', label: '🕵️ Competitors', desc: 'Competitor analysis' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setResearchType(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        researchType === tab.id
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

            {/* Research Content Based on Selected Tab */}
            {researchType === 'seo' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Search Panel */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 SEO Keyword Research</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Search Keywords</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && searchKeywords()}
                          placeholder="Enter keyword..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button 
                          onClick={searchKeywords}
                          disabled={isLoading}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? '...' : '🔍'}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Campaign Seed Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCampaign.keywords?.map((keyword, index) => (
                          <span 
                            key={index}
                            onClick={() => setSearchTerm(keyword)}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm cursor-pointer hover:bg-blue-200 transition-colors"
                          >
                            {keyword}
                          </span>
                        )) || (
                          <p className="text-gray-500 text-sm">No seed keywords defined</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Panel */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Research Results</h3>
                      <span className="text-sm text-gray-500">{keywords.length} keywords found</span>
                    </div>
                  </div>

                  <div className="p-6">
                    {isLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Researching keywords...</p>
                      </div>
                    ) : keywords.length > 0 ? (
                      <div className="space-y-4">
                        {keywords.map((keyword) => (
                          <div key={keyword.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-lg font-medium text-gray-900">{keyword.keyword}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntentColor(keyword.intent)}`}>
                                {keyword.intent}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Search Volume</span>
                                <div className="font-medium text-gray-900">
                                  {keyword.searchVolume ? keyword.searchVolume.toLocaleString() : 'N/A'}/mo
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Difficulty</span>
                                <div className={`font-medium ${getDifficultyColor(keyword.difficulty || 0)}`}>
                                  {keyword.difficulty || 0}/100
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Competition</span>
                                <div className="font-medium text-gray-900">{keyword.competition || 0}/100</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Keywords Yet</h3>
                        <p className="text-gray-500">Start by searching for keywords related to your campaign</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* SMO Trends Research */}
            {researchType === 'smo' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">📱 Social Media Trends</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={refreshSMOData}
                        disabled={isLoadingSMO}
                        className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 transition-all ${
                          dataSource === 'real' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        } ${isLoadingSMO ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {isLoadingSMO ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                            Refreshing...
                          </>
                        ) : (
                          <>
                            🔄 Refresh Data
                          </>
                        )}
                      </button>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        dataSource === 'real' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {dataSource === 'real' ? '📊 Real Data' : '📋 Fallback Data'}
                      </span>
                      {lastUpdated && (
                        <span className="text-xs text-gray-500">
                          Updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {isLoadingSMO ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading SMO trends...</p>
                    </div>
                  ) : smoTrends.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {smoTrends.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                          <h4 className="font-semibold text-gray-900 mb-2">{item.trend}</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Platform:</span>
                              <span className="font-medium capitalize">{item.platform}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Engagement:</span>
                              <span className="font-medium text-blue-600">{item.engagement}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Growth:</span>
                              <span className="font-medium text-green-600">{item.growth}</span>
                            </div>
                            {item.hashtags && (
                              <div className="mt-2">
                                <span className="text-gray-500 text-xs">Top Hashtags:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.hashtags.slice(0, 3).map((tag: string, i: number) => (
                                    <span key={i} className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No SMO Trends Found</h3>
                      <p className="text-gray-500">Try adjusting your search criteria</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hashtag Research */}
            {researchType === 'hashtags' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">#️⃣ Hashtag Strategy</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={refreshSMOData}
                        disabled={isLoadingSMO}
                        className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 transition-all ${
                          dataSource === 'real' 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        } ${isLoadingSMO ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {isLoadingSMO ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
                            Refreshing...
                          </>
                        ) : (
                          <>
                            🔄 Refresh Data
                          </>
                        )}
                      </button>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        dataSource === 'real' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {dataSource === 'real' ? '📱 Real Data' : '📋 Fallback Data'}
                      </span>
                      {lastUpdated && (
                        <span className="text-xs text-gray-500">
                          Updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                  {isLoadingSMO ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading hashtag data...</p>
                    </div>
                  ) : hashtags.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Popular Hashtags */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">🔥 Trending Fitness Hashtags</h4>
                        <div className="space-y-2">
                          {hashtags.slice(0, 6).map((hashtag, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <span className="font-medium text-blue-600">{hashtag.tag}</span>
                                <span className="text-sm text-gray-500 ml-2">{hashtag.posts} posts</span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                hashtag.difficulty === 'High' ? 'bg-red-100 text-red-800' : 
                                hashtag.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'
                              }`}>
                                {hashtag.difficulty}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Niche Hashtags */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">🎯 Niche Opportunity Hashtags</h4>
                        <div className="space-y-2">
                          {hashtags.slice(6, 12).map((hashtag, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <span className="font-medium text-blue-600">{hashtag.tag}</span>
                                <span className="text-sm text-gray-500 ml-2">{hashtag.posts} posts</span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                hashtag.difficulty === 'High' ? 'bg-red-100 text-red-800' : 
                                hashtag.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'
                              }`}>
                                {hashtag.difficulty}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Hashtag Data Found</h3>
                      <p className="text-gray-500">Try adjusting your search criteria</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Viral Topics Research */}
            {researchType === 'trending' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🔥 Viral Content Opportunities</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        title: '7-Day Abs Challenge',
                        virality: 'Extremely High',
                        platforms: ['Instagram', 'YouTube'],
                        engagement: '4.2M views',
                        timeframe: 'Next 30 days',
                        difficulty: 'Medium'
                      },
                      {
                        title: 'Desk Workout Breaks',
                        virality: 'High',
                        platforms: ['LinkedIn', 'YouTube'],
                        engagement: '1.8M views',
                        timeframe: 'Q1 2024',
                        difficulty: 'Low'
                      },
                      {
                        title: 'Fitness Transformation Story',
                        virality: 'High',
                        platforms: ['Instagram', 'Facebook'],
                        engagement: '2.1M views',
                        timeframe: 'Ongoing',
                        difficulty: 'High'
                      },
                      {
                        title: 'Equipment-Free Workouts',
                        virality: 'Medium',
                        platforms: ['YouTube', 'TikTok'],
                        engagement: '980K views',
                        timeframe: 'Next 60 days',
                        difficulty: 'Low'
                      }
                    ].map((topic, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                        <h4 className="font-semibold text-gray-900 mb-3">{topic.title}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Virality:</span>
                            <span className={`font-medium ${
                              topic.virality === 'Extremely High' ? 'text-red-600' :
                              topic.virality === 'High' ? 'text-orange-600' : 'text-yellow-600'
                            }`}>{topic.virality}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Platforms:</span>
                            <span className="font-medium">{topic.platforms.join(', ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Engagement:</span>
                            <span className="font-medium text-blue-600">{topic.engagement}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Best Time:</span>
                            <span className="font-medium">{topic.timeframe}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Difficulty:</span>
                            <span className={`font-medium ${
                              topic.difficulty === 'High' ? 'text-red-600' :
                              topic.difficulty === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                            }`}>{topic.difficulty}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Competitor Analysis */}
            {researchType === 'competitors' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🕵️ Competitor Social Analysis</h3>
                  {isLoadingSMO ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading competitor data...</p>
                    </div>
                  ) : competitorData.length > 0 ? (
                    <div className="space-y-4">
                      {competitorData.map((competitor, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">{competitor.name}</h4>
                            <div className="flex gap-2">
                              {competitor.platforms.map((platform: string, i: number) => (
                                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                                  {platform}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Followers:</span>
                              <div className="font-medium">{competitor.followers}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Engagement:</span>
                              <div className="font-medium text-green-600">{competitor.engagement}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Top Content:</span>
                              <div className="font-medium text-gray-900">{competitor.topContent}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Strength:</span>
                              <div className="font-medium text-blue-600">{competitor.strength}</div>
                            </div>
                          </div>
                          {competitor.recentPosts && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="grid grid-cols-3 gap-4 text-xs">
                                <div>
                                  <span className="text-gray-500">Recent Posts:</span>
                                  <div className="font-medium">{competitor.recentPosts}</div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Avg Likes:</span>
                                  <div className="font-medium">{competitor.avgLikes}</div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Avg Comments:</span>
                                  <div className="font-medium">{competitor.avgComments}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Competitor Data Found</h3>
                      <p className="text-gray-500">Try adjusting your search criteria</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function ResearchHub() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading Research Hub...</p>
        </div>
      </div>
    }>
      <ResearchHubContent />
    </Suspense>
  )
}