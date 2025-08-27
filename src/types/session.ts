// Shared session type definition for our custom NextAuth session
export interface CustomSession {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}
