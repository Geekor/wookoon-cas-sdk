export interface AuthConfig {
  /** 你的后端 Auth Service 基础 URL (例如: https://auth.myapi.com) */
  authServerUrl: string;
  /** Token 在本地存储的 Key，默认为 'wookoon-cas-token' */
  storageKey?: string;
  /** 初始化时是否自动获取用户信息，默认为 true */
  autoFetchUser?: boolean;
}

export interface StandardUser {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  roles?: string[];
  [key: string]: any; // 允许扩展字段
}

export interface AuthState {
  user: StandardUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}