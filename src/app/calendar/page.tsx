'use client'

import { useState, useEffect } from 'react'

interface CalendarEvent {
  id: string
  title: string
  type: 'blog' | 'social' | 'campaign'
  date: string
  time: string
  status: string
  platform?: string
  content?: string
  socialPostId?: string
  blogPostId?: string
  campaignId?: string
  slug?: string
  description?: string
}

interface NewEventForm {
  type: 'blog' | 'social' | 'campaign'
  title: string
  content: string
  date: string
  time: string
  platform: string
  status: string
  description: string
  goal: string
  targetAudience: string
  budget: number
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [newEvent, setNewEvent] = useState({
    type: 'social' as 'blog' | 'social' | 'campaign',
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    platform: 'twitter',
    status: 'scheduled',
    description: '',
    goal: '',
    targetAudience: '',
    budget: 1000
  })


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        
        const response = await fetch(`/api/calendar?month=${month}&year=${year}`)
        if (response.ok) {
          const data = await response.json()
          setEvents(data.events || [])
        } else {
          setError('Failed to fetch calendar events')
        }
      } catch (error) {
        setError('Error fetching calendar events')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [currentDate])

  const handleCreateEvent = async () => {
    try {
      setIsCreating(true)
      
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh events
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        const eventsResponse = await fetch(`/api/calendar?month=${month}&year=${year}`)
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          setEvents(eventsData.events || [])
        }
        
        setShowAddModal(false)
        setNewEvent({
          type: 'social',
          title: '',
          content: '',
          date: new Date().toISOString().split('T')[0],
          time: '09:00',
          platform: 'twitter',
          status: 'scheduled',
          description: '',
          goal: '',
          targetAudience: '',
          budget: 1000
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create event')
      }
    } catch (error) {
      setError('Error creating event')
    } finally {
      setIsCreating(false)
    }

    try {
      setIsCreating(true)
      
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh events
        const month = currentDate.getMonth() + 1
        const year = currentDate.getFullYear()
        const eventsResponse = await fetch(`/api/calendar?month=${month}&year=${year}`)
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json()
          setEvents(eventsData.events || [])
        }
        
        setShowAddModal(false)
        setNewEvent({
          type: 'social',
          title: '',
          content: '',
          date: new Date().toISOString().split('T')[0],
          time: '09:00',
          platform: 'twitter',
          status: 'scheduled',
          description: '',
          goal: '',
          targetAudience: '',
          budget: 1000
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create event')
      }
    } catch (error) {
      setError('Error creating event')
    } finally {
      setIsCreating(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const days = []
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const getDaysInWeek = (date: Date) => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getDayEvents = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => event.date === dateStr)
  }

  const days = getDaysInMonth(currentDate)
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => event.date === dateStr)
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'blog': return 'bg-blue-500'
      case 'social': return 'bg-green-500'
      case 'campaign': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'published': return 'bg-blue-100 text-blue-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'planned': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handlePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() - 7)
      setCurrentDate(newDate)
    } else if (viewMode === 'day') {
      const newDate = new Date(selectedDate)
      newDate.setDate(selectedDate.getDate() - 1)
      setSelectedDate(newDate)
      setCurrentDate(newDate)
    }
  }

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    } else if (viewMode === 'week') {
      const newDate = new Date(currentDate)
      newDate.setDate(currentDate.getDate() + 7)
      setCurrentDate(newDate)
    } else if (viewMode === 'day') {
      const newDate = new Date(selectedDate)
      newDate.setDate(selectedDate.getDate() + 1)
      setSelectedDate(newDate)
      setCurrentDate(newDate)
    }
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Calendar</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
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
            <a href="/users" className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-gray-100">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Users
            </a>
            <div className="w-full flex items-center px-4 py-3 rounded-lg text-left bg-blue-600 text-white">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar
            </div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
            <p className="text-gray-600 text-lg">Schedule and manage your content and campaigns</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Event
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePrevious}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-bold text-gray-900">
                {viewMode === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                {viewMode === 'week' && `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                {viewMode === 'day' && selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <button 
                onClick={handleNext}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleToday}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Today
              </button>
              <button 
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                  viewMode === 'month' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Month
              </button>
              <button 
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                  viewMode === 'week' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Week
              </button>
              <button 
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                  viewMode === 'day' 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                Day
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          {viewMode === 'month' && (
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded-lg">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border border-gray-200 rounded-lg ${
                    day ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-100'
                  } ${day && day.toDateString() === selectedDate.toDateString() ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => day && setSelectedDate(day)}
                >
                  {day && (
                    <>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {getEventsForDate(day).slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded ${getEventTypeColor(event.type)} text-white truncate`}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {getEventsForDate(day).length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{getEventsForDate(day).length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {viewMode === 'week' && (
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded-lg">
                  {day}
                </div>
              ))}

              {/* Week Days */}
              {getDaysInWeek(currentDate).map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[200px] p-3 border border-gray-200 rounded-lg ${
                    'bg-white hover:bg-gray-50 cursor-pointer'
                  } ${day.toDateString() === selectedDate.toDateString() ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    {day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="space-y-1">
                    {getEventsForDate(day).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs p-2 rounded ${getEventTypeColor(event.type)} text-white`}
                        title={event.title}
                      >
                        <div className="font-medium">{event.title}</div>
                        <div className="text-xs opacity-90">{event.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'day' && (
            <div className="space-y-4">
              {/* Day Header */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
              </div>

              {/* Day Events */}
              <div className="space-y-3">
                {getDayEvents(selectedDate).length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No events scheduled</h4>
                    <p className="text-gray-500">This day is free for new events</p>
                  </div>
                ) : (
                  getDayEvents(selectedDate).map(event => (
                    <div key={event.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`}></div>
                            <h4 className="font-semibold text-gray-900">{event.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                              {event.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {event.time}
                            {event.platform && ` • Platform: ${event.platform}`}
                          </p>
                          {event.content && (
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              {event.content.length > 100 ? event.content.substring(0, 100) + '...' : event.content}
                            </p>
                          )}
                          {event.description && (
                            <p className="text-sm text-gray-700 mt-2">{event.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {event.type === 'blog' && event.slug && (
                            <a 
                              href={`/blog/${event.slug}`}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              View Blog
                            </a>
                          )}
                          {event.type === 'social' && (
                            <a 
                              href={`/social`}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              View Post
                            </a>
                          )}
                          {event.type === 'campaign' && (
                            <a 
                              href={`/campaigns/${event.campaignId}`}
                              className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                            >
                              View Campaign
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Events</h3>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No scheduled events</h4>
              <p className="text-gray-500">Start scheduling your content and campaigns to see them here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 10).map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`}></div>
                    <div>
                      <div className="font-medium text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-500">
                        {event.date} at {event.time}
                        {event.platform && ` • ${event.platform}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      {event.type === 'blog' ? 'View' : 'Edit'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Date Events */}
        {selectedDate && getEventsForDate(selectedDate).length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Events for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <div className="space-y-4">
              {getEventsForDate(selectedDate).map(event => (
                <div key={event.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)}`}></div>
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {event.date} at {event.time}
                        {event.platform && ` • Platform: ${event.platform}`}
                      </p>
                      {event.content && (
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          {event.content.length > 100 ? event.content.substring(0, 100) + '...' : event.content}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm text-gray-700 mt-2">{event.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {event.type === 'blog' && event.slug && (
                        <a 
                          href={`/blog/${event.slug}`}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          View Blog
                        </a>
                      )}
                      {event.type === 'social' && (
                        <a 
                          href={`/social`}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        >
                          View Post
                        </a>
                      )}
                      {event.type === 'campaign' && (
                        <a 
                          href={`/campaigns/${event.campaignId}`}
                          className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                        >
                          View Campaign
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Event</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Event Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({...newEvent, type: e.target.value as 'blog' | 'social' | 'campaign'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="social">Social Media Post</option>
                  <option value="blog">Blog Post</option>
                  <option value="campaign">Campaign</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Enter event title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={newEvent.content}
                  onChange={(e) => setNewEvent({...newEvent, content: e.target.value})}
                  placeholder="Enter event content"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Platform (for social posts) */}
              {newEvent.type === 'social' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                  <select
                    value={newEvent.platform}
                    onChange={(e) => setNewEvent({...newEvent, platform: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="twitter">Twitter</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="linkedin">LinkedIn</option>
                  </select>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={newEvent.status}
                  onChange={(e) => setNewEvent({...newEvent, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="active">Active</option>
                  <option value="planning">Planning</option>
                </select>
              </div>

              {/* Campaign-specific fields */}
              {newEvent.type === 'campaign' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      placeholder="Enter campaign description"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
                      <input
                        type="text"
                        value={newEvent.goal}
                        onChange={(e) => setNewEvent({...newEvent, goal: e.target.value})}
                        placeholder="e.g., 1000 shares"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                      <input
                        type="text"
                        value={newEvent.targetAudience}
                        onChange={(e) => setNewEvent({...newEvent, targetAudience: e.target.value})}
                        placeholder="e.g., Fitness enthusiasts"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                      <input
                        type="number"
                        value={newEvent.budget}
                        onChange={(e) => setNewEvent({...newEvent, budget: parseInt(e.target.value) || 0})}
                        placeholder="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                disabled={isCreating || !newEvent.title || !newEvent.date || !newEvent.time}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
