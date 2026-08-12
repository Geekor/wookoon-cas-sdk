import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createAuth } from '@my-org/auth-sdk'

const app = createApp(App)

// 初始化认证 SDK
createAuth({
  authServerUrl: import.meta.env.VITE_AUTH_SERVER_URL, // 你的后端 Auth Service 地址
  storageKey: 'my_app_token',
  autoFetchUser: true // 刷新页面时自动恢复登录态
})

app.use(router)
app.mount('#app')