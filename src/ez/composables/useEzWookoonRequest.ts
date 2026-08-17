import axios from 'axios'
import { useAuth } from 'wookoon-cas-sdk'

export function useEzWookoonRequest(baseUrl?: string) {
  const request = axios.create({
    baseURL: baseUrl,
  })

  // 在请求拦截器中获取 Token 并附加
  request.interceptors.request.use((config) => {
    const { getAccessToken } = useAuth()
    const token = getAccessToken()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  return request
}

