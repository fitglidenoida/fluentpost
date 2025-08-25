import { z } from 'zod'

// Email validation schema
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required')
  .max(254, 'Email is too long')
  .transform(email => email.toLowerCase().trim())

// Name validation schema
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .transform(name => name.trim())

// Username validation schema
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .transform(username => username.toLowerCase().trim())

// Content validation schema
export const contentSchema = z
  .string()
  .min(1, 'Content is required')
  .max(10000, 'Content is too long')
  .transform(content => content.trim())

// URL validation schema
export const urlSchema = z
  .string()
  .url('Invalid URL')
  .max(2048, 'URL is too long')
  .transform(url => url.trim())

// Sanitize HTML content
export const sanitizeHtml = (html: string): string => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<[^>]*>/g, '')
}

// Sanitize text content
export const sanitizeText = (text: string): string => {
  return text
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

// Validate and sanitize user input
export const validateAndSanitizeInput = (input: any, schema: z.ZodSchema) => {
  try {
    const validated = schema.parse(input)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: (error as any).errors.map((err: any) => err.message)
      }
    }
    return { 
      success: false, 
      errors: ['Invalid input format']
    }
  }
}

// XSS prevention
export const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  return text.replace(/[&<>"'/]/g, (m) => map[m])
}

// SQL injection prevention (basic)
export const sanitizeSqlInput = (input: string): string => {
  return input
    .replace(/['";\\]/g, '') // Remove dangerous SQL characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*.*?\*\//g, '') // Remove SQL block comments
    .trim()
}

// File upload validation
export const validateFileUpload = (file: File, maxSize: number = 5 * 1024 * 1024): { isValid: boolean; error?: string } => {
  // Check file size (5MB default)
  if (file.size > maxSize) {
    return { isValid: false, error: 'File size too large' }
  }
  
  // Check file type
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'File type not allowed' }
  }
  
  return { isValid: true }
}
