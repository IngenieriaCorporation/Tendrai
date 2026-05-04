import axios from 'axios'

// In production VITE_API_URL = https://tendrai-backend.onrender.com
// In dev it's empty and Vite proxy handles /api → localhost:8000
const BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: `${BASE}/api`,
  timeout: 90000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ta_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ta_token')
      localStorage.removeItem('ta_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
