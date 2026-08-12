// 导出核心类 (供高级用户或自定义框架使用)
export { AuthClient } from './core/auth-client';
export { TokenManager } from './core/token-manager';

// 导出 Vue 适配层
export { createAuth, useAuth } from './vue/use-auth';

// 导出类型
export type { AuthConfig, StandardUser, AuthState } from './types';