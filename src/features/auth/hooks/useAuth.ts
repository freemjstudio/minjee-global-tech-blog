import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/authApi'

const authKeys = { me: ['auth', 'me'] as const }

export function useMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: authApi.me,
    enabled: !!localStorage.getItem('access_token'),
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) => {
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
      queryClient.invalidateQueries({ queryKey: authKeys.me })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      queryClient.clear()
    },
  })
}
