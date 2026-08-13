# Wookoon CAS Sdk

## 架构总结

```
┌─────────────┐
│  Vue 前端    │
│  (SDK)      │
└──────┬──────┘
       │ 1. 调用 /api/cas/login/redirect 跳转登录 CAS URL
       │ 2. 回调带 code 到前端
       │ 3. 前端调用 /api/cas/callback
       ▼
┌─────────────────────────────────┐
│       Auth Service (本项目)      │
│  ┌───────────────────────────┐  │
│  │  Casdoor SDK              │  │
│  │  - 用 code 换 token       │  │
│  │  - 解析用户信息            │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  防腐层 (Adapter)          │  │
│  │  Casdoor User → Standard  │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  JWT 签发                  │  │
│  │  - 签发业务系统 JWT        │  │
│  └───────────────────────────┘  │
└──────┬──────────────────────────┘
       │ 返回 { token, user }
       ▼
┌─────────────┐
│  Vue 前端    │
│  保存 Token  │
└──────┬──────┘
       │ 后续请求携带 Bearer Token
       ▼
┌─────────────────────────────────┐
│   业务服务 (订单/用户/支付等)      │
│   - 只需验证 JWT 签名            │
│   - 不需要 Casdoor SDK          │
└─────────────────────────────────┘
```

## 业务项目使用指南 (如何在你的 Vue 3 项目中接入)

1. 安装

```sh
pnpm add wookoon-cas-sdk@^0.1
```

2. 初始化 (`main.ts`)

```vue
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createAuth } from '@my-org/auth-sdk'

const app = createApp(App)

// 初始化认证 SDK
createAuth({
  // 你的后端 Auth Service 地址
  authServerUrl: import.meta.env.VITE_AUTH_SERVER_URL, 
  // [可选] 默认 wookoon-cas-token
  storageKey: 'my_app_token',
  // [可选] 刷新页面时自动获取用户信息，默认 true
  autoFetchUser: true 
})

app.use(router)
app.mount('#app')
```


3. 在组件中使用 (`Header.vue` 或 `Layout.vue`)

```vue
<script setup lang="ts">
import { useAuth } from '@my-org/auth-sdk'
import { useRouter } from 'vue-router'

const router = useRouter()
const { user, isAuthenticated, isLoading, login, logout } = useAuth()

function handleLogin() {
  // 登录成功后，后端会重定向回当前页面的 /callback 路由
  login(`${window.location.origin}/callback`) 
}

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<template>
  <nav>
    <div v-if="isLoading">加载中...</div>
    <template v-else-if="isAuthenticated && user">
      <span>欢迎, {{ user.displayName || user.username }}</span>
      <button @click="handleLogout">退出</button>
    </template>
    <template v-else>
      <button @click="handleLogin">登录</button>
    </template>
  </nav>
</template>
```

4. 处理回调 (`Callback.vue`)

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@my-org/auth-sdk'

const router = useRouter()
const route = useRoute()
const { handleCallback, error } = useAuth()
const localError = ref('')

onMounted(async () => {
  const code = route.query.code as string
  const state = route.query.state as string

  if (!code) {
    localError.value = '缺少授权 code'
    return
  }

  try {
    // 调用 SDK 处理回调，换取 Token 并更新状态
    await handleCallback(code, state)
    
    // 登录成功，跳转到首页或之前保存的 redirect 页面
    router.replace('/')
  } catch (e: any) {
    localError.value = e.message || '登录失败'
  }
})
</script>

<template>
  <div style="padding: 40px; text-align: center;">
    <div v-if="localError" style="color: red;">{{ localError }}</div>
    <div v-else>正在处理登录，请稍候...</div>
  </div>
</template>
```

5. 配合 Axios 自动携带 Token (src/utils/request.ts)

```ts
import axios from 'axios'
import { useAuth } from '@my-org/auth-sdk'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

request.interceptors.request.use((config) => {
  // 在请求拦截器中获取 Token 并附加
  const { getAccessToken } = useAuth()
  const token = getAccessToken()
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default request
```