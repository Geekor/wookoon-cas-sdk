import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'WookoonCasSdk',
      fileName: 'wookoon-cas-sdk',
    },
    rollupOptions: {
      // 确保 vue 不被打包进 SDK，而是作为外部依赖
      external: ['vue', 'vue-router'],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter'
        },
        // preserveModules 关闭；不要让 rollup 把类型展开
        preserveModules: false
      },
    },
  },
})
