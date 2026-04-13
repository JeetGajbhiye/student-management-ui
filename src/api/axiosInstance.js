import axios from 'axios'

const baseURL = (import.meta.env.VITE_API_BASE_URL || '').trim()

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sms_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token.trim()}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sms_token')
      localStorage.removeItem('sms_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api