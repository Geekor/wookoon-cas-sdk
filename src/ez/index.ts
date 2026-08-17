import type { _RouterClassic, RouteRecordRaw } from "vue-router"

import { WK_CAS_CALLBACK_PATH, WK_CAS_CALLBACK_NAME } from './consts.ts'
import { createAuth } from "../vue/use-auth.ts"

// import Callback from './views/Callback.vue'

/**
 * 注意
 * ---------------------------------------------
 * 你需要在执行 `app.use(router)` 前安装本模块！  
 * 否则处理回调的路由无法追加进去！
 * 
 * 例如：
 * 
 * ```ts
 * createEzWookoon({
 *  serverUrl: 'http://localhost:8080',
 *  installRoutes: (list: RouteRecordRaw[]) => {
 *    list.forEach(r => router.addRoute(r))
 *  }
 * })
 * 
 * app.use(router)
 * ```
 */
export function createEzWookoon(cfg: {
  /** 你的后端 Auth Service 地址 */
  serverUrl: string

  installRoutes: (list: RouteRecordRaw[]) => void
}) {
  // 初始化认证 SDK
  const inst = createAuth({
    authServerUrl: cfg.serverUrl, 
  })

  // 追加路由
  cfg.installRoutes([
    {
      path: WK_CAS_CALLBACK_PATH,
      name: WK_CAS_CALLBACK_NAME,
      component: () => import('./views/Callback.vue') //Promise.resolve(Callback),
    }
  ])

  return {
    clientInstance: inst
  }
}
