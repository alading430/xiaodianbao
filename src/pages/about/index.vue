<template>
  <view class="page">
    <!-- ═══ 现代化顶部导航 ═══ -->
    <view class="nav-header">
      <view class="nh-left">
        <text class="nh-back" @click="goBack">‹</text>
        <view class="nh-title-area">
          <text class="nh-title">关于我们</text>
          <text class="nh-sub">了解小店宝更多信息</text>
        </view>
      </view>
      <view style="width:60rpx"></view>
    </view>

    <view class="section">
      <text class="section-title">💪 为什么选小店宝</text>
      <text class="section-desc">我们懂白城商家的真实需求</text>
    </view>

    <!-- 核心优势 -->
    <view class="advantages">
      <view v-for="(item, index) in advantages" :key="index" class="advantage-card">
        <view class="advantage-icon" :style="{ backgroundColor: item.bgColor }">
          <text>{{ item.icon }}</text>
        </view>
        <text class="advantage-title">{{ item.title }}</text>
        <text class="advantage-desc">{{ item.desc }}</text>
      </view>
    </view>

    <!-- 公司背景 -->
    <view class="section">
      <text class="section-title">🏢 关于鹤网软件</text>
      <view class="company-card">
        <text class="company-intro">
          鹤网软件是一家专注于中小微企业数字化升级的技术公司。我们为白城及周边地区的商家提供简单易用、价格实惠的数字化经营工具。
        </text>
        <view class="company-stats">
          <view class="stat-item">
            <text class="stat-number">5+</text>
            <text class="stat-label">行业覆盖</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">100%</text>
            <text class="stat-label">本地服务</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">0</text>
            <text class="stat-label">隐藏费用</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 公司项目案例 -->
    <view class="section">
      <text class="section-title">🏆 公司实力展示</text>
      <view class="company-cases">
        <view class="case-item" @click="openUrl">
          <view class="case-icon">🚕</view>
          <view class="case-content">
            <text class="case-title">白城95128出行平台</text>
            <text class="case-desc">白城市官方出行平台，服务全城居民</text>
          </view>
          <text class="case-arrow">›</text>
        </view>
        <view class="case-item">
          <view class="case-icon">🏗️</view>
          <view class="case-content">
            <text class="case-title">安辰智慧工地</text>
            <text class="case-desc">工地安全监管信息化解决方案</text>
          </view>
        </view>
        <view class="case-item">
          <view class="case-icon">🏛️</view>
          <view class="case-content">
            <text class="case-title">泰州金控会议系统</text>
            <text class="case-desc">政府级会议管理平台</text>
          </view>
        </view>
        <view class="case-item">
          <view class="case-icon">📚</view>
          <view class="case-content">
            <text class="case-title">科小侠智慧教学</text>
            <text class="case-desc">K12智慧实验教学系统</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部 -->
    <view class="bottom-info">
      <text class="bottom-text">鹤网软件 · 让数字化更简单</text>
    </view>
  </view>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { showToast } from '@/utils/bridge.js'

const router = useRouter()

function goBack() {
  router.push('/profile')
}

const advantages = [
  {
    icon: '🏠',
    title: '白城本地服务',
    desc: '我们就在白城，有问题一个电话，上门指导解决问题。比外地大厂服务更及时、更贴心。',
    bgColor: '#ecfdf5'
  },
  {
    icon: '💰',
    title: '完全免费使用',
    desc: '基础功能全部免费，没有年费、没有月费、没有任何隐藏收费。让所有商家都能用上数字化工具。',
    bgColor: '#fff7ed'
  },
  {
    icon: '🎓',
    title: '包教包会',
    desc: '年龄大不要紧，不会用不要紧。我们手把手教，教到会用为止。你只管安心做生意。',
    bgColor: '#f5f3ff'
  },
  {
    icon: '🔄',
    title: '持续升级迭代',
    desc: '功能越来越多，你提的需求我们优先开发。你的小店会越来越智能。',
    bgColor: '#eff6ff'
  }
]

function openUrl() {
  // H5版直接打开新窗口
  window.open('https://he-wang.cn', '_blank')
}
</script>

<style scoped>
/* ═══ 页面基础样式 - 现代化设计 ═══ */
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
  padding-bottom: 60rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ═══ 顶部导航 - 现代化设计 ═══ */
.nav-header {
  position: sticky;
  top: 0;
  z-index: 99;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 32rpx 32rpx 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(229, 231, 235, 0.6);
}

.nh-left { 
  display: flex; 
  align-items: center; 
  gap: 16rpx; 
}

.nh-back {
  width: 60rpx;
  height: 60rpx;
  border-radius: var(--radius-lg);
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: var(--text-primary);
  font-weight: var(--font-bold);
  transition: all var(--transition-normal);
}

.nh-back:active {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(0.95);
}

.nh-title-area { 
  display: flex; 
  flex-direction: column; 
  gap: 4rpx; 
}

.nh-title { 
  font-size: 34rpx; 
  font-weight: var(--font-extrabold); 
  color: var(--text-primary); 
  line-height: 1.1;
  letter-spacing: -0.5rpx;
}

.nh-sub { 
  font-size: 20rpx; 
  color: var(--text-muted); 
  font-weight: var(--font-medium);
}

.section {
  padding: 0 32rpx;
  margin-bottom: 32rpx;
  margin-top: 32rpx;
}

.section-title {
  display: block;
  font-size: 34rpx;
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: 12rpx;
  letter-spacing: -0.5rpx;
}

.section-desc {
  display: block;
  font-size: 28rpx;
  color: var(--text-muted);
  margin-bottom: 24rpx;
  font-weight: var(--font-medium);
  line-height: 1.5;
}

/* ═══ 优势卡片 - 现代化设计 ═══ */
.advantages {
  padding: 0 32rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.advantage-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 32rpx;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.advantage-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, var(--secondary-color), var(--primary-color));
}

.advantage-card:active {
  transform: translateY(-2rpx);
  box-shadow: var(--shadow-xl);
}

.advantage-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-bottom: 20rpx;
  transition: all var(--transition-normal);
}

.advantage-card:active .advantage-icon {
  transform: scale(1.05);
}

.advantage-title {
  display: block;
  font-size: 32rpx;
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: 12rpx;
  letter-spacing: -0.5rpx;
}

.advantage-desc {
  display: block;
  font-size: 28rpx;
  color: var(--text-secondary);
  line-height: 1.7;
  font-weight: var(--font-medium);
}

/* ═══ 公司介绍 - 现代化设计 ═══ */
.company-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 32rpx;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.company-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, var(--secondary-color), var(--primary-color));
}

.company-intro {
  display: block;
  font-size: 28rpx;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 28rpx;
  font-weight: var(--font-medium);
}

.company-stats {
  display: flex;
  justify-content: space-around;
  padding: 24rpx 0 8rpx;
  border-top: 1px solid var(--border-light);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all var(--transition-normal);
}

.stat-item:active {
  transform: scale(0.95);
}

.stat-number {
  font-size: 44rpx;
  font-weight: var(--font-bold);
  color: var(--primary-color);
  margin-bottom: 8rpx;
  letter-spacing: -1rpx;
}

.stat-label {
  font-size: 24rpx;
  color: var(--text-muted);
  font-weight: var(--font-medium);
}

/* ═══ 案例列表 - 现代化设计 ═══ */
.company-cases {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}

.case-item {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1px solid var(--border-light);
  transition: all var(--transition-normal);
}

.case-item:last-child {
  border-bottom: none;
}

.case-item:active {
  background: var(--primary-light);
  transform: translateX(4rpx);
}

.case-icon {
  font-size: 44rpx;
  margin-right: 24rpx;
  width: 56rpx;
  text-align: center;
  flex-shrink: 0;
  transition: all var(--transition-normal);
}

.case-item:active .case-icon {
  transform: scale(1.1);
}

.case-content {
  flex: 1;
}

.case-title {
  display: block;
  font-size: 28rpx;
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: 6rpx;
  letter-spacing: -0.5rpx;
}

.case-desc {
  display: block;
  font-size: 24rpx;
  color: var(--text-muted);
  font-weight: var(--font-medium);
}

.case-arrow {
  font-size: 38rpx;
  color: var(--border-color);
  font-weight: var(--font-bold);
  transition: all var(--transition-normal);
}

.case-item:active .case-arrow {
  color: var(--primary-color);
}

/* ═══ 底部信息 - 现代化设计 ═══ */
.bottom-info {
  text-align: center;
  padding: 60rpx 0 40rpx;
}

.bottom-text {
  font-size: 24rpx;
  color: var(--text-muted);
  font-weight: var(--font-medium);
  letter-spacing: 0.5rpx;
}
</style>