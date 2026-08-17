<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useEzWookoonAuth } from '../composables/useEzWookoonAuth'

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