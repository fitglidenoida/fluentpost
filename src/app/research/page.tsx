'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { CostFreeAIService } from '@/lib/ai'

export default function ResearchHub() {
  const { content, isLoading, error, fetchTopics, createTopic } = useAppStore()
  const topics = content.topics
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showTopicForm, setShowTopicForm] = useState(false)
  const [newTopic, setNewTopic] = useState({
    title: '',
    description: '',
    category: 'fitness',
    keywords: '',
    difficulty: 'medium'
  })
  
  // SEO State
  const [activeTab, setActiveTab] = useState('topics') // 'topics' or 'seo'
  const [websites, setWebsites] = useState([])
  const [selectedWebsite, setSelectedWebsite] = useState(null)
  const [showWebsiteForm, setShowWebsiteForm] = useState(false)
  const [newWebsite, setNewWebsite] = useState({
    name: '',
    url: ''
  })
  const [keywordResearch, setKeywordResearch] = useState({
    domain: '',
    seedKeywords: [''],
    keywords: []
  })
  const [isResearching, setIsResearching] = useState(false)

  useEffect(() => {
    console.log('Research Hub: Fetching topics...')
    fetchTopics()
  }, [fetchTopics])

  useEffect(() => {
    console.log('Research Hub: Topics updated:', topics)
  }, [topics])

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createTopic(newTopic)
      setShowTopicForm(false)
      setNewTopic({ title: '', description: '', category: 'fitness', keywords: '', difficulty: 'medium' })
      alert('Topic created successfully!')
    } catch (error) {
      console.error('Error creating topic:', error)
      alert('Error creating topic. Please try again.')
    }
  }

  const generateTopicIdeas = async () => {
    try {
      console.log('Generating topic ideas for:', searchTerm || 'fitness and wellness')
      const prompt = {
        type: 'topic' as const,
        topic: searchTerm || 'fitness and wellness',
        additionalContext: 'Focus on viral potential and trending topics'
      }
      
      const result = await CostFreeAIService.generateContent(prompt)
      console.log('Topic generation result:', result)
      
      // Open AI Admin Panel with the generated prompt
      window.open('/admin?action=generate-topics&prompt=' + encodeURIComponent(JSON.stringify(result)), '_blank')
    } catch (error) {
      console.error('Error generating topic ideas:', error)
      alert('Error generating topic ideas. Please try again.')
    }
  }

  const handleResearchTopic = async (topic: any) => {
    console.log('Researching topic:', topic.title)
    // This will open the AI Admin Panel with research instructions and topic context
    const topicData = {
      topic: topic.title,
      description: topic.description,
      keywords: topic.keywords,
      category: topic.category
    }
    window.open('/admin?action=research&topic=' + encodeURIComponent(topic.title) + '&context=' + encodeURIComponent(JSON.stringify(topicData)), '_blank')
  }

  const handleCreateContent = async (topic: any) => {
    console.log('Creating content for topic:', topic.title)
    // This will open the AI Admin Panel with content creation instructions and topic context
    const topicData = {
      topic: topic.title,
      description: topic.description,
      keywords: topic.keywords,
      category: topic.category
    }
    window.open('/admin?action=create&topic=' + encodeURIComponent(topic.title) + '&context=' + encodeURIComponent(JSON.stringify(topicData)) + '&type=app-feature', '_blank')
  }

  const filteredTopics = (topics || []).filter((topic: any) => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', 'fitness', 'nutrition', 'wellness', 'workouts', 'lifestyle']

  // SEO Functions
  const fetchWebsites = async () => {
    try {
      const response = await fetch('/api/websites')
      if (response.ok) {
        const data = await response.json()
        setWebsites(data.websites || [])
      }
    } catch (error) {
      console.error('Error fetching websites:', error)
    }
  }

  const createWebsite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWebsite)
      })
      
      if (response.ok) {
        setShowWebsiteForm(false)
        setNewWebsite({ name: '', url: '' })
        fetchWebsites()
        alert('Website added successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Error adding website')
      }
    } catch (error) {
      console.error('Error creating website:', error)
      alert('Error creating website')
    }
  }

  const researchKeywords = async () => {
    if (!keywordResearch.domain || keywordResearch.seedKeywords.length === 0) {
      alert('Please enter domain and at least one seed keyword')
      return
    }

    setIsResearching(true)
    try {
      const response = await fetch('/api/seo/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: keywordResearch.domain,
          seedKeywords: keywordResearch.seedKeywords.filter(k => k.trim())
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setKeywordResearch(prev => ({ ...prev, keywords: data.keywords }))
        alert(`Found ${data.total} keywords!`)
      } else {
        const error = await response.json()
        alert(error.error || 'Error researching keywords')
      }
    } catch (error) {
      console.error('Error researching keywords:', error)
      alert('Error researching keywords')
    } finally {
      setIsResearching(false)
    }
  }

  const addSeedKeyword = () => {
    setKeywordResearch(prev => ({
      ...prev,
      seedKeywords: [...prev.seedKeywords, '']
    }))
  }

  const removeSeedKeyword = (index: number) => {
    setKeywordResearch(prev => ({
      ...prev,
      seedKeywords: prev.seedKeywords.filter((_, i) => i !== index)
    }))
  }

  const updateSeedKeyword = (index: number, value: string) => {
    setKeywordResearch(prev => ({
      ...prev,
      seedKeywords: prev.seedKeywords.map((keyword, i) => i === index ? value : keyword)
    }))
  }

  useEffect(() => {
    if (activeTab === 'seo') {
      fetchWebsites()
    }
  }, [activeTab])

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
            <Link href="/" className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
              Dashboard
            </Link>
            <div className="w-full flex items-center px-4 py-3 rounded-lg text-left bg-blue-600 text-white">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Research Hub
            </div>
            <Link href="/content" className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Content Studio
            </Link>
            <Link href="/social" className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Social Media
            </Link>
            <Link href="/analytics" className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </Link>
            <Link href="/campaigns" className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Campaigns
            </Link>
            <Link href="/users" className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Users
            </Link>
            <Link href="/calendar" className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar
            </Link>
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
          <Link 
            href="/admin" 
            className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Admin Panel
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Hub</h1>
            <p className="text-gray-600 text-lg">Discover trending topics and research viral content opportunities</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowTopicForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Topic
            </button>
            <button 
              onClick={generateTopicIdeas}
              className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Ideas
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex space-x-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('topics')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'topics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📚 Content Topics
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'seo'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🔍 SEO Research
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Topics</label>
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search topics..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-500">
                {filteredTopics.length} topics found
              </div>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading topics...</p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <p className="text-red-600">Error: {error}</p>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No topics found. Create your first topic to get started!</p>
            </div>
          ) : (
            filteredTopics.map((topic: any) => (
              <div key={topic.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{topic.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{topic.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {topic.category}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        topic.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        topic.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {topic.difficulty}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Keywords: {topic.keywords}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{topic.viralScore?.toFixed(1) || '0.0'}</div>
                    <div className="text-xs text-gray-500">Viral Score</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleResearchTopic(topic)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Research
                  </button>
                  <button 
                    onClick={() => handleCreateContent(topic)}
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Create Content
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* SEO Content */}
        {activeTab === 'seo' && (
          <div className="space-y-8">
            {/* Website Management */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Website Management</h2>
                <button 
                  onClick={() => setShowWebsiteForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Website
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {websites.map((website: any) => (
                  <div key={website.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-2">{website.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{website.url}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Pages: {website._count?.pageAnalyses || 0}</span>
                      <span>Keywords: {website._count?.keywordResearches || 0}</span>
                      <span>Issues: {website._count?.seoRecommendations || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Keyword Research */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Keyword Research</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Research Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                    <input 
                      type="url"
                      value={keywordResearch.domain}
                      onChange={(e) => setKeywordResearch(prev => ({ ...prev, domain: e.target.value }))}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seed Keywords</label>
                    {keywordResearch.seedKeywords.map((keyword, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input 
                          type="text"
                          value={keyword}
                          onChange={(e) => updateSeedKeyword(index, e.target.value)}
                          placeholder="Enter seed keyword"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button 
                          onClick={() => removeSeedKeyword(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={addSeedKeyword}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add another keyword
                    </button>
                  </div>
                  
                  <button 
                    onClick={researchKeywords}
                    disabled={isResearching}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isResearching ? 'Researching...' : 'Research Keywords'}
                  </button>
                </div>

                {/* Results */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Research Results</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {keywordResearch.keywords.map((keyword: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{keyword.keyword}</span>
                          <span className="text-sm text-gray-500">Difficulty: {keyword.difficulty || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Volume: {keyword.searchVolume || 'N/A'}</span>
                          {keyword.suggestions && (
                            <span className="text-blue-600 cursor-pointer hover:underline">
                              View suggestions
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Topic Modal */}
        {showTopicForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Topic</h2>
              <form onSubmit={handleCreateTopic}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input 
                      type="text"
                      value={newTopic.title}
                      onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea 
                      value={newTopic.description}
                      onChange={(e) => setNewTopic({...newTopic, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select 
                      value={newTopic.category}
                      onChange={(e) => setNewTopic({...newTopic, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="fitness">Fitness</option>
                      <option value="nutrition">Nutrition</option>
                      <option value="wellness">Wellness</option>
                      <option value="workouts">Workouts</option>
                      <option value="lifestyle">Lifestyle</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                    <input 
                      type="text"
                      value={newTopic.keywords}
                      onChange={(e) => setNewTopic({...newTopic, keywords: e.target.value})}
                      placeholder="comma-separated keywords"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <select 
                      value={newTopic.difficulty}
                      onChange={(e) => setNewTopic({...newTopic, difficulty: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Topic
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowTopicForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Website Modal */}
        {showWebsiteForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Website</h2>
              <form onSubmit={createWebsite}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website Name</label>
                    <input 
                      type="text"
                      value={newWebsite.name}
                      onChange={(e) => setNewWebsite({...newWebsite, name: e.target.value})}
                      required
                      placeholder="My Business Website"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                    <input 
                      type="url"
                      value={newWebsite.url}
                      onChange={(e) => setNewWebsite({...newWebsite, url: e.target.value})}
                      required
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Website
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowWebsiteForm(false)}
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
