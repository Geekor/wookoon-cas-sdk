// 导出核心类 (供高级用户或自定义框架使用)
export { AuthClient } from './core/auth-client';
export { TokenManager } from './core/token-manager';

// 导出 Vue 适配层
export { createAuth, useAuth } from './vue/use-auth';

// 导出类型
export type { AuthConfig, StandardUser, AuthState } from './types';


// 导出 EZ 封装，让使用更简单
export { createEzWookoon } from './ez/index'
export { useEzWookoonAuth } from './ez/composables/useEzWookoonAuth';
export { useEzWookoonRequest } from './ez/composables/useEzWookoonRequest';

import EzWookoonNavDemo from './ez/components/EzWookoonNavDemo.vue'
export { EzWookoonNavDemo }