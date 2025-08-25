import bcrypt from 'bcryptjs'

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = []
  
  // Minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  // Maximum length
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters')
  }
  
  // Must contain uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  // Must contain lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  // Must contain number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  // Must contain special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ]
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common, please choose a stronger password')
  }
  
  // Check for sequential characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password cannot contain more than 2 consecutive identical characters')
  }
  
  // Check for keyboard sequences
  const keyboardSequences = ['qwerty', 'asdfgh', 'zxcvbn', '123456', '654321']
  const passwordLower = password.toLowerCase()
  
  for (const sequence of keyboardSequences) {
    if (passwordLower.includes(sequence)) {
      errors.push('Password cannot contain keyboard sequences')
      break
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

export const generateStrongPassword = (): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  let password = ''
  
  // Ensure at least one of each required character type
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]
  
  // Fill the rest with random characters
  const allChars = uppercase + lowercase + numbers + symbols
  for (let i = 4; i < 16; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}
