# Wookoon CAS Sdk

## 架构总结

```
┌─────────────┐
│  Vue 前端    │
│  (SDK)      │
└──────┬──────┘
       │ 1. 调用 /api/cas/login-auto 跳转登录 CAS URL
       │ 2. 回调带 code 到前端
       │ 3. 前端调用 /api/cas/callback
       ▼
┌─────────────────────────────────┐
│       Auth Service              │
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
import { createEzWookoon } from 'wookoon-cas-sdk'
import type { RouteRecordRaw } from 'vue-router'

const app = createApp(App)

createEzWookoon({
  serverUrl: import.meta.env.VITE_SERVER_URL,
  installRoutes: (list: RouteRecordRaw[]) => {
    list.forEach(r => router.addRoute(r))
  }
})

app.use(router)
app.mount('#app')

```


3. 在组件中使用 (`Header.vue` 或 `Layout.vue`)

```vue
<script setup lang="ts">
import { EzWookoonNavDemo } from 'wookoon-cas-sdk'

</script>

<template>
  <div>
    <EzWookoonNavDemo />
    <div>content</div>
  </div>
</template>
```

`EZAWookoonNavDemo` 内容如下，你可以参考并自定义一个你自己的版本

```vue
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useEzWookoonAuth } from 'wookoon-cas-sdk'

const router = useRouter()
const { user, isAuthenticated, isLoading, login, logout, profile } = useEzWookoonAuth()

function handleLogin() {
  login()
}

function handleLogout() {
  logout()
  router.push('/')
}

function handleMyProfile() {
  profile()
}
</script>

<template>
  <nav>
    <div v-if="isLoading">加载中...</div>
    <template v-else-if="isAuthenticated && user">
      <span>欢迎, <a href="#" @click="handleMyProfile()">{{ user.displayName || user.username }}</a></span>
      &ensp;
      <button @click="handleLogout">退出</button>
    </template>
    <template v-else>
      <button @click="handleLogin">登录</button>
    </template>
  </nav>
</template>
```


4. 配合 Axios 自动携带 Token 

```ts
import { useEzWookoonRequest } from 'wookoon-cas-sdk';

useEzWookoonRequest().get('/api/foo/bar').then((r) => {
  // TODO
})
```

5. `src/env.d.ts`

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_URL: string
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

6. `.env`

```conf
VITE_SERVER_URL="http://localhost:8080"
```