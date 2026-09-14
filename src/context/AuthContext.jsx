import { useCallback, useState } from 'react'
import apiClient from '../api/client'
import { AuthContext } from './authContextInstance'

export function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState(() => localStorage.getItem('access_token'))

  const login = useCallback(async (username, password) => {
    const { data } = await apiClient.post('/auth/login/', { username, password })
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    setAccessTokenState(data.access)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setAccessTokenState(null)
  }, [])

  return (
    <AuthContext.Provider value={{ accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

