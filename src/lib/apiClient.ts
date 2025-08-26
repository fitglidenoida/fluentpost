import axios from 'axios'

// API Client Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://fluentpost.in' 
  : 'http://localhost:3002'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // For NextAuth sessions, we'll handle auth in the API routes
    // But we can add any global headers here
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`
    })
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    })
    return response
  },
  (error) => {
    console.error('API Response Error:', {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      details: error.response?.data?.details,
      url: error.config?.url,
      fullError: error.response?.data
    })
    return Promise.reject(error)
  }
)

// API Methods
export const api = {
  // SEO APIs
  seo: {
    // Get recommendations
    getRecommendations: async (params?: { websiteId?: string; status?: string; priority?: string }) => {
      const response = await apiClient.get('/api/seo/recommendations', { params })
      return response.data
    },

    // Update recommendation status
    updateRecommendation: async (recommendationId: string, status: string) => {
      const response = await apiClient.put('/api/seo/recommendations', {
        recommendationId,
        status
      })
      return response.data
    },

    // Get audit history
    getAuditHistory: async (params?: { websiteId?: string }) => {
      const response = await apiClient.get('/api/seo/audit', { params })
      return response.data
    },

    // Perform website audit
    performAudit: async (websiteId: string, url: string) => {
      const response = await apiClient.post('/api/seo/audit', {
        websiteId,
        url
      })
      return response.data
    },

    // Research keywords
    researchKeywords: async (domain: string, seedKeywords: string[]) => {
      const response = await apiClient.post('/api/seo/keywords', {
        domain,
        seedKeywords
      })
      return response.data
    },

    // Analyze website
    analyzeWebsite: async (websiteId: string, url: string) => {
      const response = await apiClient.post('/api/seo/analyze', {
        websiteId,
        url
      })
      return response.data
    }
  },

  // Website management
  websites: {
    // Get all websites
    getAll: async () => {
      const response = await apiClient.get('/api/websites')
      return response.data
    },

    // Create website
    create: async (name: string, url: string) => {
      const response = await apiClient.post('/api/websites', {
        name,
        url
      })
      return response.data
    },

    // Update website
    update: async (id: string, data: { name?: string; url?: string }) => {
      const response = await apiClient.put(`/api/websites/${id}`, data)
      return response.data
    },

    // Delete website
    delete: async (id: string) => {
      const response = await apiClient.delete(`/api/websites/${id}`)
      return response.data
    }
  },

  // Test endpoint
  test: {
    fetch: async () => {
      const response = await apiClient.get('/api/test-fetch')
      return response.data
    },
    seo: async () => {
      const response = await apiClient.get('/api/test-seo')
      return response.data
    }
  }
}

// Export the client for direct use if needed
export default apiClient
