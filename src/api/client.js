import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

function getAccessToken() {
  return localStorage.getItem('access_token')
}

function getRefreshToken() {
  return localStorage.getItem('refresh_token')
}

function setAccessToken(token) {
  localStorage.setItem('access_token', token)
}

function clearTokens() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// Separate instance for the refresh call so it isn't caught by the response interceptor below.
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

let refreshPromise = null

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }
  const { data } = await refreshClient.post('/auth/refresh/', { refresh: refreshToken })
  setAccessToken(data.access)
  return data.access
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error

    if (response?.status === 401 && !config._retry && getRefreshToken()) {
      config._retry = true
      try {
        // Coalesce concurrent 401s into a single refresh request.
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null
          })
        }
        const newAccessToken = await refreshPromise
        config.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(config)
      } catch (refreshError) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

/**
 * Extracts the normalized "code: message" string from the backend's
 * {"error": {"code","message"}} error envelope.
 */
export function getErrorMessage(error) {
  const backendError = error?.response?.data?.error
  if (backendError?.message) {
    return `${backendError.code}: ${backendError.message}`
  }
  if (error?.message) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}

export default apiClient
