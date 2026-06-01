import axios from 'axios'

const BASE_URL = 'http://localhost:3001'

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('ge_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ge_token')
      localStorage.removeItem('ge_user')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export const imageUrl = (filename) =>
  filename ? `${BASE_URL}/images/${filename}` : null

export default api
