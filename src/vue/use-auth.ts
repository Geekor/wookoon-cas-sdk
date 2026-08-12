import { ref, readonly } from 'vue';
import { AuthClient } from '../core/auth-client';
import { AuthConfig, StandardUser } from '../types';

// 全局单例，确保整个应用共用一个 AuthClient
let clientInstance: AuthClient | null = null;
let isInitialized = false;

// 响应式状态
const user = ref<StandardUser | null>(null);
const isAuthenticated = ref(false);
const isLoading = ref(false);
const error = ref<string | null>(null);

/**
 * 初始化 Auth SDK (通常在 main.ts 中调用一次)
 */
export function createAuth(config: AuthConfig) {
  if (clientInstance) {
    console.warn('Auth SDK is already initialized.');
    return;
  }
  
  clientInstance = new AuthClient(config);
  isInitialized = true;

  // 如果配置了自动获取用户，且本地有 Token，则初始化时拉取用户信息
  if (config.autoFetchUser !== false && clientInstance.getAccessToken()) {
    isLoading.value = true;
    clientInstance.fetchUser()
      .then(u => {
        user.value = u;
        isAuthenticated.value = !!u;
      })
      .finally(() => {
        isLoading.value = false;
      });
  }
}

/**
 * Vue Composable: 在组件中使用认证状态和方法
 */
export function useAuth() {
  if (!isInitialized || !clientInstance) {
    throw new Error('Auth SDK not initialized. Please call createAuth() in your main.ts first.');
  }

  const login = (redirectUri: string = window.location.href) => {
    clientInstance!.login(redirectUri);
  };

  const handleCallback = async (code: string, state: string) => {
    isLoading.value = true;
    error.value = null;
    try {
      const u = await clientInstance!.handleCallback(code, state);
      user.value = u;
      isAuthenticated.value = true;
      return u;
    } catch (e: any) {
      error.value = e.message || '登录失败';
      throw e;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    clientInstance!.logout();
    user.value = null;
    isAuthenticated.value = false;
  };

  const getAccessToken = () => {
    return clientInstance!.getAccessToken();
  };

  return {
    // 状态 (readonly 防止组件直接修改)
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    error: readonly(error),
    // 方法
    login,
    logout,
    handleCallback,
    getAccessToken,
  };
}