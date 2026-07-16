import { httpClient } from '@/shared/api/httpClient'
import type { LoginRequest, AuthTokens, AuthUser } from '../model/auth.types'

interface ApiResponse<T> {
  success: boolean
  data: T
}

export const authApi = {
  login: async (body: LoginRequest): Promise<AuthTokens> => {
    const { data } = await httpClient.post<ApiResponse<AuthTokens>>('/auth/login', body)
    return data.data
  },

  me: async (): Promise<AuthUser> => {
    const { data } = await httpClient.get<ApiResponse<AuthUser>>('/auth/me')
    return data.data
  },

  logout: async (): Promise<void> => {
    await httpClient.post('/auth/logout')
  },
}
