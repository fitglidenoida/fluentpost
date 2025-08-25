import { create } from 'zustand'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Analytics {
  totalUsers: number
  viralCoefficient: number
  totalViews: number
  totalShares: number
  topContent: any[]
  recentActivity: any[]
}

interface ContentState {
  topics: any[]
  blogPosts: any[]
  socialPosts: any[]
  campaigns: any[]
}

interface Settings {
  notifications: {
    email: boolean
    push: boolean
    weeklyReports: boolean
    viralAlerts: boolean
  }
  ai: {
    autoGenerate: boolean
    costFreeMode: boolean
    gptPlusWorkflow: boolean
  }
  content: {
    autoPublish: boolean
    reviewBeforePublish: boolean
    defaultPlatforms: string[]
  }
  analytics: {
    trackUserBehavior: boolean
    shareData: boolean
    realTimeUpdates: boolean
  }
  socialMedia: {
    twitter: {
      connected: boolean
      apiKey?: string
      apiSecret?: string
      accessToken?: string
      accessTokenSecret?: string
    }
    linkedin: {
      connected: boolean
      clientId?: string
      clientSecret?: string
      accessToken?: string
    }
    facebook: {
      connected: boolean
      appId?: string
      appSecret?: string
      accessToken?: string
    }
    instagram: {
      connected: boolean
      accessToken?: string
    }
    tiktok: {
      connected: boolean
      accessToken?: string
    }
    youtube: {
      connected: boolean
      apiKey?: string
      channelId?: string
    }
  }
}

interface AppState {
  user: User | null
  analytics: Analytics
  content: ContentState
  settings: Settings | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setAnalytics: (analytics: Analytics) => void
  setTopics: (topics: any[]) => void
  setBlogPosts: (posts: any[]) => void
  setSocialPosts: (posts: any[]) => void
  setCampaigns: (campaigns: any[]) => void
  setSettings: (settings: Settings) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchAnalytics: () => Promise<void>
  fetchTopics: () => Promise<void>
  fetchBlogPosts: () => Promise<void>
  fetchSocialPosts: () => Promise<void>
  fetchSettings: () => Promise<void>
  saveSettings: (settings: Settings) => Promise<void>
  createTopic: (topic: any) => Promise<void>
  createBlogPost: (post: any) => Promise<void>
  createSocialPost: (post: any) => Promise<void>
  generateContent: (params: any) => Promise<any>
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  analytics: {
    totalUsers: 0,
    viralCoefficient: 0,
    totalViews: 0,
    totalShares: 0,
    topContent: [],
    recentActivity: [],
  },
  content: {
    topics: [],
    blogPosts: [],
    socialPosts: [],
    campaigns: [],
  },
  settings: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setAnalytics: (analytics) => set({ analytics }),
  setTopics: (topics) => set((state) => ({ 
    content: { ...state.content, topics } 
  })),
  setBlogPosts: (blogPosts) => set((state) => ({ 
    content: { ...state.content, blogPosts } 
  })),
  setSocialPosts: (socialPosts) => set((state) => ({ 
    content: { ...state.content, socialPosts } 
  })),
  setCampaigns: (campaigns) => set((state) => ({ 
    content: { ...state.content, campaigns } 
  })),
  setSettings: (settings) => set({ settings }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchAnalytics: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/analytics?type=overview')
      const data = await response.json()
      if (data.success) {
        set({ analytics: data.data })
      }
    } catch (error) {
      set({ error: 'Failed to fetch analytics' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchTopics: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/topics')
      const data = await response.json()
      if (data.topics) {
        set((state) => ({ 
          content: { ...state.content, topics: data.topics } 
        }))
      }
    } catch (error) {
      set({ error: 'Failed to fetch topics' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchBlogPosts: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/blog-posts')
      const data = await response.json()
      if (data.blogPosts) {
        set((state) => ({ 
          content: { ...state.content, blogPosts: data.blogPosts } 
        }))
      }
    } catch (error) {
      set({ error: 'Failed to fetch blog posts' })
    } finally {
      set({ isLoading: false })
    }
  },

    fetchSocialPosts: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/social-posts')
      const data = await response.json()
      if (data.socialPosts) {
        set((state) => ({
          content: { ...state.content, socialPosts: data.socialPosts }
        }))
      }
    } catch (error) {
      set({ error: 'Failed to fetch social posts' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchSettings: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      if (data.settings) {
        set({ settings: data.settings })
      }
    } catch (error) {
      set({ error: 'Failed to fetch settings' })
    } finally {
      set({ isLoading: false })
    }
  },

  saveSettings: async (settings) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await response.json()
      if (data.success) {
        set({ settings: data.settings })
      }
    } catch (error) {
      set({ error: 'Failed to save settings' })
    } finally {
      set({ isLoading: false })
    }
  },

  createTopic: async (topic) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topic),
      })
      const data = await response.json()
      if (data.id) {
        // Refresh topics list
        get().fetchTopics()
      }
    } catch (error) {
      set({ error: 'Failed to create topic' })
    } finally {
      set({ isLoading: false })
    }
  },

  createBlogPost: async (post) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/blog-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      })
      const data = await response.json()
      if (data.id) {
        // Refresh blog posts list
        get().fetchBlogPosts()
      }
    } catch (error) {
      set({ error: 'Failed to create blog post' })
    } finally {
      set({ isLoading: false })
    }
  },

  createSocialPost: async (post) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/social-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      })
      const data = await response.json()
      if (data.id) {
        // Refresh social posts list
        get().fetchSocialPosts()
      }
    } catch (error) {
      set({ error: 'Failed to create social post' })
    } finally {
      set({ isLoading: false })
    }
  },

  generateContent: async (params) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      const data = await response.json()
      if (data.success) {
        return data.content
      }
      throw new Error(data.error || 'Failed to generate content')
    } catch (error) {
      set({ error: 'Failed to generate content' })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
}))
