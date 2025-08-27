import db from '@/lib/db'

export interface SecurityEvent {
  type: 'login_attempt' | 'login_success' | 'login_failure' | 'registration' | 'password_change' | 'suspicious_activity' | 'rate_limit_exceeded'
  userId?: string
  ipAddress: string
  userAgent: string
  details: Record<string, any>
  timestamp: Date
}

export class SecurityAuditLogger {
  static async logEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    try {
      // Mock security audit logging since SecurityAudit table doesn't exist
      const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log('Security Audit Event:', {
        id: auditId,
        type: event.type,
        userId: event.userId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        details: event.details,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }

  static async logLoginAttempt(ipAddress: string, userAgent: string, email: string, success: boolean) {
    await this.logEvent({
      type: success ? 'login_success' : 'login_failure',
      ipAddress,
      userAgent,
      details: {
        email,
        success,
        timestamp: new Date().toISOString()
      }
    })
  }

  static async logRegistration(ipAddress: string, userAgent: string, email: string, userId: string) {
    await this.logEvent({
      type: 'registration',
      userId,
      ipAddress,
      userAgent,
      details: {
        email,
        timestamp: new Date().toISOString()
      }
    })
  }

  static async logSuspiciousActivity(ipAddress: string, userAgent: string, details: Record<string, any>) {
    await this.logEvent({
      type: 'suspicious_activity',
      ipAddress,
      userAgent,
      details: {
        ...details,
        timestamp: new Date().toISOString()
      }
    })
  }

  static async logRateLimitExceeded(ipAddress: string, userAgent: string, endpoint: string) {
    await this.logEvent({
      type: 'rate_limit_exceeded',
      ipAddress,
      userAgent,
      details: {
        endpoint,
        timestamp: new Date().toISOString()
      }
    })
  }

  // Get recent security events for an IP address
  static async getRecentEvents(ipAddress: string, hours: number = 24) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    
    // Mock security audit retrieval since SecurityAudit table doesn't exist
    console.log(`Mock: Getting security events for IP ${ipAddress} in last ${hours} hours`)
    return []
  }

  // Check if an IP address has suspicious activity
  static async isSuspiciousIP(ipAddress: string): Promise<boolean> {
    const recentEvents = await this.getRecentEvents(ipAddress, 1) // Last hour
    
    const failureCount = recentEvents.filter(e => e.type === 'login_failure').length
    const rateLimitCount = recentEvents.filter(e => e.type === 'rate_limit_exceeded').length
    const suspiciousCount = recentEvents.filter(e => e.type === 'suspicious_activity').length
    
    return failureCount > 5 || rateLimitCount > 3 || suspiciousCount > 2
  }
}

// Utility function to get client IP address
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// Utility function to get user agent
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown'
}
