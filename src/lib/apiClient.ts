import axios from 'axios'

// Type definitions
interface LoginCredentials {
  email: string;
  password: string;
}

interface CreateUserData {
  email: string;
  password: string;
  name?: string;
}

interface CreateWebsiteData {
  name: string;
  url: string;
}

interface UpdateWebsiteData {
  name?: string;
  url?: string;
}

interface AutomationRequest {
  websiteId: string;
  recommendationIds?: string[];
  autoImplement?: boolean;
  gitConfig?: {
    repositoryUrl?: string;
    branch?: string;
    username?: string;
    email?: string;
    authMethod?: string;
    personalAccessToken?: string;
    sshKeyPath?: string;
    password?: string;
  };
}

interface CreateKeywordData {
  websiteId: string;
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
  competition?: number;
  intent?: 'informational' | 'commercial' | 'transactional' | 'navigational';
}

interface SaveKeywordsData {
  websiteId: string;
  keywords: Array<{
    keyword: string;
    searchVolume?: number;
    difficulty?: number;
    competition?: number;
    intent?: string;
    suggestions?: string[];
  }>;
  groupName?: string;
}

interface CreateTopicCategoryData {
  websiteId: string;
  name: string;
  description?: string;
  color?: string;
}

interface CreateTopicData {
  title: string;
  description?: string;
  categoryId?: string;
  keywords: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  contentType?: 'blog' | 'video' | 'social' | 'guide';
  priority?: 'low' | 'medium' | 'high';
  estimatedWordCount?: number;
}

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
  auth: {
    register: (userData: CreateUserData) => apiClient.post('/api/auth?action=register', userData),
    login: (credentials: LoginCredentials) => apiClient.post('/api/auth?action=login', credentials),
    resetPassword: (email: string, newPassword?: string) => 
      apiClient.post('/api/auth?action=reset-password', { email, newPassword }),
    checkUser: (email: string) => apiClient.post('/api/auth?action=check-user', { email }),
    emergencyCreate: (email: string) => apiClient.post('/api/auth?action=emergency-create', { email }),
    getProfile: () => apiClient.get('/api/auth?action=profile'),
  },
  websites: {
    create: (websiteData: CreateWebsiteData) => apiClient.post('/api/websites', websiteData),
    getAll: () => apiClient.get('/api/websites'),
    getById: (id: string) => apiClient.get(`/api/websites/${id}`),
    update: (id: string, websiteData: UpdateWebsiteData) => apiClient.put(`/api/websites/${id}`, websiteData),
    delete: (id: string) => apiClient.delete(`/api/websites/${id}`),
  },
  seo: {
    audit: (websiteId: string) => apiClient.post('/api/seo/audit', { websiteId }),
    getAuditHistory: () => apiClient.get('/api/seo/audit'),
    researchKeywords: (domain: string, keywords: string[]) => apiClient.post('/api/seo/keywords', { domain, keywords }),
    recommendations: {
      getAll: () => apiClient.get('/api/seo/recommendations'),
      generate: (websiteId: string) => apiClient.post('/api/seo/recommendations', { websiteId }),
    },
    getRecommendations: () => apiClient.get('/api/seo/recommendations'),
    updateRecommendation: (id: string, status: string) => apiClient.put('/api/seo/recommendations', { recommendationId: id, status }),
    generateRecommendations: (data: any) => apiClient.post('/api/seo/recommendations', data),
    automate: (data: AutomationRequest) => apiClient.post('/api/seo/automate', data),
    testGitConnection: (gitConfig: any) => apiClient.post('/api/seo/test-git-connection', gitConfig),
  },
  keywords: {
    getAll: (websiteId?: string, groupId?: string) => {
      const params = new URLSearchParams()
      if (websiteId) params.append('websiteId', websiteId)
      if (groupId) params.append('groupId', groupId)
      return apiClient.get(`/api/keywords?${params.toString()}`)
    },
    create: (keywordData: CreateKeywordData) => apiClient.post('/api/keywords', keywordData),
    saveFromResearch: (data: SaveKeywordsData) => apiClient.post('/api/keywords', data),
  },
  topicCategories: {
    getAll: (websiteId?: string) => {
      const params = websiteId ? `?websiteId=${websiteId}` : ''
      return apiClient.get(`/api/topic-categories${params}`)
    },
    create: (categoryData: CreateTopicCategoryData) => apiClient.post('/api/topic-categories', categoryData),
    update: (id: string, updateData: Partial<CreateTopicCategoryData>) => 
      apiClient.put('/api/topic-categories', { id, ...updateData }),
    delete: (id: string) => apiClient.delete(`/api/topic-categories?id=${id}`),
  },
  topics: {
    getAll: (categoryId?: string, status?: string) => {
      const params = new URLSearchParams()
      if (categoryId) params.append('categoryId', categoryId)
      if (status) params.append('status', status)
      return apiClient.get(`/api/topics?${params.toString()}`)
    },
    create: (topicData: CreateTopicData) => apiClient.post('/api/topics', topicData),
  },
};

// Export the apiClient instance
export default apiClient;
