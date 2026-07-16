export interface LoginRequest {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthUser {
  id: number
  email: string
  username: string
  role: 'ADMIN' | 'USER'
}
