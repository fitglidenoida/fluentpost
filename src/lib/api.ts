// Centralized API configuration
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use current origin
    return window.location.origin
  }
  // Server-side: use environment variable or default
  return process.env.NEXTAUTH_URL || 'http://localhost:3001'
}

export const apiFetch = async (endpoint: string, options?: RequestInit) => {
  const baseUrl = getBaseUrl()
  const url = `${baseUrl}${endpoint}`
  
  console.log('API Fetch:', { endpoint, fullUrl: url, baseUrl })
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  
  return response
}
