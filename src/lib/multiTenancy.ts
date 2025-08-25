import { NextRequest } from 'next/server'

export interface Tenant {
  id: string
  name: string
  subdomain: string
  plan: 'free' | 'starter' | 'pro' | 'enterprise'
  settings: TenantSettings
  limits: UsageLimits
}

export interface TenantSettings {
  theme: string
  branding: {
    logo?: string
    colors: {
      primary: string
      secondary: string
    }
  }
  features: {
    aiGeneration: boolean
    socialPosting: boolean
    analytics: boolean
    customDomain: boolean
  }
}

export interface UsageLimits {
  monthlyPosts: number
  monthlyAIRequests: number
  storageGB: number
  teamMembers: number
}

export function getTenantFromRequest(request: NextRequest): string | null {
  const hostname = request.headers.get('host')
  
  if (!hostname) return null
  
  // Handle customer subdomains (customer1.fluentpost.in)
  const subdomainMatch = hostname.match(/^([^.]+)\.fluentpost\.in$/)
  if (subdomainMatch && subdomainMatch[1] !== 'www' && subdomainMatch[1] !== 'app' && subdomainMatch[1] !== 'api') {
    return subdomainMatch[1]
  }
  
  // Handle main app subdomain (app.fluentpost.in)
  if (hostname === 'app.fluentpost.in') {
    return 'default'
  }
  
  return null
}

export function isCustomerSubdomain(request: NextRequest): boolean {
  const tenant = getTenantFromRequest(request)
  return tenant !== null && tenant !== 'default'
}

export function isMainApp(request: NextRequest): boolean {
  const hostname = request.headers.get('host')
  return hostname === 'app.fluentpost.in'
}

export function isMarketingSite(request: NextRequest): boolean {
  const hostname = request.headers.get('host')
  return hostname === 'fluentpost.in' || hostname === 'www.fluentpost.in'
}

export function isAdminPanel(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname
  return pathname.startsWith('/admin')
}

export function getTenantDatabaseName(tenantId: string): string {
  return `fluentpost_${tenantId}`
}

export function getTenantApiUrl(tenantId: string): string {
  if (tenantId === 'default') {
    return 'https://app.fluentpost.in'
  }
  return `https://${tenantId}.fluentpost.in`
}

export function validateTenantAccess(tenantId: string, userRole: string): boolean {
  // Admin can access all tenants
  if (userRole === 'admin') return true
  
  // Users can only access their own tenant
  // This would be enhanced with proper user-tenant mapping
  return true
}

export const DEFAULT_TENANT_SETTINGS: TenantSettings = {
  theme: 'default',
  branding: {
    colors: {
      primary: '#3B82F6',
      secondary: '#1F2937'
    }
  },
  features: {
    aiGeneration: true,
    socialPosting: true,
    analytics: true,
    customDomain: false
  }
}

export const DEFAULT_USAGE_LIMITS: UsageLimits = {
  monthlyPosts: 100,
  monthlyAIRequests: 1000,
  storageGB: 1,
  teamMembers: 1
}

export const PLAN_LIMITS = {
  free: {
    monthlyPosts: 10,
    monthlyAIRequests: 100,
    storageGB: 0.1,
    teamMembers: 1
  },
  starter: {
    monthlyPosts: 100,
    monthlyAIRequests: 1000,
    storageGB: 1,
    teamMembers: 3
  },
  pro: {
    monthlyPosts: 500,
    monthlyAIRequests: 5000,
    storageGB: 10,
    teamMembers: 10
  },
  enterprise: {
    monthlyPosts: -1, // unlimited
    monthlyAIRequests: -1, // unlimited
    storageGB: 100,
    teamMembers: -1 // unlimited
  }
}
