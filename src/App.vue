<template>
  <view class="app">
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <keep-alive>
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>

    <!-- 浮动咨询按钮 -->
    <FloatConsult />

    <!-- TabBar -->
    <view class="tab-bar" v-if="showTabBar">
      <view
        v-for="tab in tabs"
        :key="tab.path"
        class="tab-item"
        :class="{ active: currentTab === tab.path }"
        @click="switchTab(tab.path)"
      >
        <text class="tab-icon">{{ tab.icon }}</text>
        <text class="tab-label">{{ tab.label }}</text>
      </view>
    </view>
  </view>
</template>

<style>
/* 引入全局样式 */
@import '@/styles/global.css';
</style>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCurrentUser } from '@/stores/account.js'
import FloatConsult from '@/components/FloatConsult.vue'

const route = useRoute()
const router = useRouter()

// ========== 全局路由守卫：强制登录 ==========
router.beforeEach((to, from, next) => {
  const user = getCurrentUser()
  if (to.path !== '/auth' && !user) {
    next('/auth')
  } else {
    next()
  }
})

const tabs = [
  { path: '/home', icon: '🏠', label: '首页' },
  { path: '/inventory', icon: '📦', label: '库存' },
  { path: '/members', icon: '👥', label: '会员' },
  { path: '/copywriting', icon: '✨', label: '文案' },
  { path: '/profile', icon: '👤', label: '我的' }
]

const tabPaths = ['/home', '/inventory', '/members', '/copywriting', '/profile']

const currentTab = computed(() => {
  for (const t of tabPaths) {
    if (route.path.startsWith(t)) return t
  }
  return ''
})

const showTabBar = computed(() => {
  return tabPaths.some(p => route.path.startsWith(p))
})

function switchTab(path) {
  router.push(path)
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  background-color: #F2F4F8;
  font-family: 'PingFang SC', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  height: 100%;
}

#app {
  height: 100%;
}

.app {
  min-height: 100vh;
  padding-bottom: 130rpx;
  background: #F2F4F8;
}

/* 主题色变量 */
:root {
  --primary-color: #F97316; /* 主色调 - 橙色 */
  --primary-light: #FFEDD5;
  --secondary-color: #3B82F6; /* 辅助色 - 蓝色 */
  --success-color: #10B981; /* 成功色 - 绿色 */
  --warning-color: #F59E0B; /* 警告色 - 黄色 */
  --danger-color: #EF4444; /* 危险色 - 红色 */
  --text-primary: #1F2937; /* 主要文字 */
  --text-secondary: #6B7280; /* 次要文字 */
  --text-muted: #9CA3AF; /* 弱化文字 */
  --bg-primary: #FFFFFF; /* 主要背景 */
  --bg-secondary: #F9FAFB; /* 次要背景 */
  --bg-tertiary: #F3F4F6; /* 三级背景 */
  --border-color: #E5E7EB; /* 边框颜色 */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --radius-sm: 8rpx;
  --radius-md: 12rpx;
  --radius-lg: 16rpx;
}

view, text, input, textarea {
  box-sizing: border-box;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10rpx);
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #F1F5F9;
  border-radius: 8px;
}
::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 8px;
  transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #EA580C;
}

/* TabBar - 现代化毛玻璃效果 */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 140rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid rgba(229, 231, 235, 0.8);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom, 20rpx);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  cursor: pointer;
}

.tab-item.active {
  color: var(--primary-color);
}

.tab-item.active::before {
  content: '';
  position: absolute;
  top: -8rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background: var(--primary-color);
  border-radius: 2rpx;
}

.tab-icon {
  font-size: 52rpx;
  margin-bottom: 6rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: grayscale(0.3);
}

.tab-item.active .tab-icon {
  transform: scale(1.15) translateY(-4rpx);
  filter: grayscale(0);
}

.tab-label {
  font-size: 26rpx;
  font-weight: 500;
  transition: all 0.3s ease;
  letter-spacing: 0.5rpx;
}

.tab-item.active .tab-label {
  font-weight: 600;
  color: var(--primary-color);
}

/* Toast 样式 */
.xdb-toast {
  position: fixed;
  bottom: 160rpx;
  left: 50%;
  transform: translateX(-50%);
  background: #1F2937;
  color: #ffffff;
  padding: 14rpx 36rpx;
  border-radius: 40px;
  font-size: 26rpx;
  font-weight: 500;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  backdrop-filter: blur(8px);
  max-width: 80%;
  white-space: nowrap;
  animation: toastIn 0.2s ease;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>