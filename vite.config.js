import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// 根据屏幕宽度自动适配 rpx → px 的 postcss 插件
function rpxToVw() {
  // 设计稿以 750rpx 为基准
  return {
    postcssPlugin: 'rpx-to-vw',
    Declaration(decl) {
      if (decl.value.includes('rpx')) {
        decl.value = decl.value.replace(/(\d+(?:\.\d+)?)rpx/g, (_, num) => {
          // 750设计稿 → 将rpx转为vw (1rpx = 100/750 vw)
          return (parseFloat(num) / 750 * 100).toFixed(4) + 'vw'
        })
      }
    }
  }
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    postcss: {
      plugins: [rpxToVw()]
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'static',
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: false
  }
})
