<template>
  <view class="page">
    <view v-if="industry" class="detail">
      <!-- 头部 -->
      <view class="header" :style="{ backgroundColor: industry.bgColor }">
        <text class="header-icon">{{ industry.icon }}</text>
        <text class="header-title" :style="{ color: industry.color }">{{ industry.name }}</text>
        <text class="header-subtitle">{{ industry.subtitle }}</text>
        <text class="header-summary">{{ industry.summary }}</text>
      </view>
      
      <!-- 无条码支持提示 -->
      <view class="no-barcode-banner" :style="{ backgroundColor: industry.bgColor }">
        <text class="no-barcode-icon">✅</text>
        <view class="no-barcode-content">
          <text class="no-barcode-title">没有条码也能用</text>
          <text class="no-barcode-desc">{{ industry.noBarcodeTip }}</text>
        </view>
      </view>

      <!-- 功能清单 -->
      <view class="section">
        <text class="section-title">📋 我们能帮你做什么</text>
        <view v-for="(feature, index) in industry.features" :key="index" class="feature-item">
          <view class="feature-icon" :style="{ backgroundColor: industry.bgColor }">
            <text>{{ feature.icon }}</text>
          </view>
          <view class="feature-content">
            <text class="feature-title">{{ feature.title }}</text>
            <text class="feature-desc">{{ feature.desc }}</text>
          </view>
        </view>
      </view>

      <!-- 真实场景 -->
      <view class="section">
        <text class="section-title">💡 真实经营场景</text>
        <view v-for="(scenario, index) in industry.scenarios" :key="index" class="scenario-card" :style="{ borderLeftColor: industry.color }">
          <text class="scenario-title">{{ scenario.title }}</text>
          <text class="scenario-content">{{ scenario.content }}</text>
        </view>
      </view>

      <!-- 行动按钮 -->
      <view class="cta-section">
        <view class="cta-btn" :style="{ background: `linear-gradient(135deg, ${industry.color}, ${industry.color}dd)` }" @click="callNow">
          📞 立即咨询这个行业方案
        </view>
        <view class="cta-btn outline" @click="goBack">
          ← 看看其他行业
        </view>
      </view>
    </view>

    <view v-else class="empty">
      <text class="empty-text">未找到该行业方案</text>
    </view>

    <view class="bottom-spacer"></view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { industries } from '@/static/data/industries.js'
import { makePhoneCall, getContactInfo } from '@/utils/phone.js'

const route = useRoute()
const router = useRouter()
const industry = ref(null)
const contactInfo = ref({})

onMounted(() => {
  contactInfo.value = getContactInfo()
  const id = route.params.id
  if (id) {
    industry.value = industries.find(item => item.id === id)
  }
})

function callNow() {
  makePhoneCall(contactInfo.value.phone)
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.detail {
  padding-bottom: 40rpx;
}

.header {
  padding: 50rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.header-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.header-title {
  font-size: 40rpx;
  font-weight: 700;
  margin-bottom: 10rpx;
}

.header-subtitle {
  font-size: 26rpx;
  color: #9ca3af;
  margin-bottom: 16rpx;
}

.header-summary {
  font-size: 26rpx;
  color: #6b7280;
  line-height: 1.6;
  max-width: 600rpx;
}

.section {
  padding: 0 30rpx;
  margin-bottom: 30rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20rpx;
}

.no-barcode-banner {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  margin: 0 30rpx 30rpx;
  border-radius: 16rpx;
}

.no-barcode-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.no-barcode-content {
  flex: 1;
}

.no-barcode-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6rpx;
}

.no-barcode-desc {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
  line-height: 1.5;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.feature-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 20rpx;
  font-size: 36rpx;
}

.feature-content {
  flex: 1;
}

.feature-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6rpx;
}

.feature-desc {
  font-size: 24rpx;
  color: #6b7280;
  line-height: 1.5;
}

.scenario-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border-left: 8rpx solid #6366f1;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.scenario-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 10rpx;
}

.scenario-content {
  font-size: 24rpx;
  color: #6b7280;
  line-height: 1.6;
}

.cta-section {
  padding: 0 30rpx;
  margin-bottom: 30rpx;
}

.cta-btn {
  text-align: center;
  padding: 28rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 16rpx;
}

.cta-btn:active {
  opacity: 0.85;
}

.cta-btn.outline {
  background: #ffffff;
  color: #6b7280;
  border: 2rpx solid #e5e7eb;
}

.empty {
  display: flex;
  justify-content: center;
  padding: 100rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #9ca3af;
}

.bottom-spacer {
  height: 40rpx;
}
</style>
