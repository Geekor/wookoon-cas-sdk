<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../../vue/use-auth'

const router = useRouter()
const route = useRoute()
const { handleCallback } = useAuth()
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