<template>
  <view class="page">
    <view class="section">
      <text class="section-title">🔥 小店宝三大核心功能</text>
      <text class="section-desc">全部免费使用，扫码就能用</text>
    </view>

    <view class="features-list">
      <view v-for="feature in coreFeatures" :key="feature.id" class="feature-block">
        <!-- 功能头部 -->
        <view class="feature-header" :style="{ backgroundColor: feature.color }">
          <text class="feature-main-icon">{{ feature.icon }}</text>
          <text class="feature-main-title">{{ feature.title }}</text>
          <text class="feature-main-subtitle">{{ feature.subtitle }}</text>
          <view class="highlight-tag">
            <text>{{ feature.highlight }}</text>
          </view>
        </view>

        <!-- 操作步骤 -->
        <view class="feature-steps">
          <view v-for="(step, sIndex) in feature.steps" :key="sIndex" class="step-item">
            <view class="step-number" :style="{ backgroundColor: feature.color + '20', color: feature.color }">
              <text>{{ sIndex + 1 }}</text>
            </view>
            <text class="step-text">{{ step }}</text>
          </view>
        </view>

        <!-- AI 功能的演示区 -->
        <view v-if="feature.id === 'ai'" class="ai-demo">
          <view class="ai-demo-header">
            <text class="ai-demo-label">🤖 试试AI写文案</text>
          </view>
          <view class="ai-input-area">
            <input
              class="ai-input"
              v-model="aiProduct"
              placeholder="输入商品名，比如：新到的东北草莓"
            />
            <view class="ai-btn" @click="generateCopy" :style="{ backgroundColor: feature.color }">
              <text>生成文案</text>
            </view>
          </view>
          <view v-if="showAICopy" class="ai-output">
            <view v-for="(copy, cIndex) in generatedCopies" :key="cIndex" class="copy-item" @click="copyText(copy.text)">
              <view class="copy-tag" :style="{ backgroundColor: feature.color + '20', color: feature.color }">
                <text>{{ copy.tag }}</text>
              </view>
              <text class="copy-text">{{ copy.text }}</text>
              <text class="copy-hint">点击复制</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 无条码特别说明 -->
    <view class="section no-barcode-section">
      <text class="section-title">✅ 没有条码也能用</text>
      <text class="section-desc">很多商品没有条码？小店宝支持多种方式录入</text>
      <view class="no-barcode-grid">
        <view v-for="(item, index) in noBarcodeScenarios" :key="index" class="no-barcode-item">
          <view class="nb-icon">{{ item.icon }}</view>
          <text class="nb-title">{{ item.title }}</text>
          <text class="nb-desc">{{ item.desc }}</text>
        </view>
      </view>
    </view>

    <view class="bottom-spacer"></view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { coreFeatures, noBarcodeScenarios } from '@/static/data/industries.js'
import { copyToClipboard } from '@/utils/phone.js'
import { showToast } from '@/utils/bridge.js'

const route = useRoute()
const aiProduct = ref('')
const showAICopy = ref(false)
const generatedCopies = ref([])

onMounted(() => {
  const featureId = route.params.featureId
  if (featureId) {
    setTimeout(() => {
      const el = document.querySelector(`[data-feature="${featureId}"]`)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 300)
  }
})

function generateCopy() {
  if (!aiProduct.value.trim()) {
    showToast('请输入商品名')
    return
  }

  const product = aiProduct.value.trim()
  // Beta版：使用演示文案（后续对接AI接口）
  generatedCopies.value = [
    {
      tag: '📢 直白版',
      text: `刚到的${product}，新鲜好吃！欢迎新老顾客进店品尝。来晚了可就没啦～`
    },
    {
      tag: '😄 亲切版',
      text: `家人们，${product}到货啦！品质有保证，价格也实在，快点来看看吧～`
    },
    {
      tag: '🔥 促销版',
      text: `🌟🌟 ${product}特价啦！限时优惠，手慢无！现在下单还有惊喜哦～`
    }
  ]
  showAICopy.value = true
}

function copyText(text) {
  copyToClipboard(text, '文案已复制，去发朋友圈吧！')
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.section {
  padding: 30rpx 30rpx 10rpx;
}

.section-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8rpx;
}

.section-desc {
  font-size: 26rpx;
  color: #9ca3af;
}

.features-list {
  padding: 0 30rpx;
}

.feature-block {
  margin-bottom: 30rpx;
  border-radius: 20rpx;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.feature-header {
  padding: 40rpx 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
}

.feature-main-icon {
  font-size: 72rpx;
  margin-bottom: 16rpx;
}

.feature-main-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.feature-main-subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16rpx;
}

.highlight-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 24rpx;
  border-radius: 30rpx;
  font-size: 22rpx;
  color: #ffffff;
}

.feature-steps {
  padding: 30rpx;
}

.step-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.step-item:last-child {
  margin-bottom: 0;
}

.step-number {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 16rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.step-text {
  flex: 1;
  font-size: 26rpx;
  color: #374151;
  line-height: 1.5;
  padding-top: 6rpx;
}

/* AI Demo */
.ai-demo {
  padding: 0 30rpx 30rpx;
  border-top: 1rpx solid #f3f4f6;
}

.ai-demo-header {
  padding: 20rpx 0;
}

.ai-demo-label {
  font-size: 28rpx;
  font-weight: 600;
  color: #1f2937;
}

.ai-input-area {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.ai-input {
  flex: 1;
  height: 80rpx;
  border: 2rpx solid #e5e7eb;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 26rpx;
}

.ai-btn {
  padding: 0 30rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 26rpx;
  font-weight: 600;
}

.ai-btn:active {
  opacity: 0.85;
}

.ai-output {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.copy-item {
  background: #f9fafb;
  border-radius: 12rpx;
  padding: 20rpx;
  position: relative;
}

.copy-item:active {
  opacity: 0.8;
}

.copy-tag {
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  margin-bottom: 10rpx;
}

.copy-text {
  display: block;
  font-size: 26rpx;
  color: #374151;
  line-height: 1.6;
  margin-bottom: 8rpx;
}

.copy-hint {
  font-size: 20rpx;
  color: #9ca3af;
}

.bottom-spacer {
  height: 40rpx;
}

/* 无条码区域 */
.no-barcode-section {
  margin-top: 10rpx;
}

.no-barcode-section .section-desc {
  display: block;
  font-size: 26rpx;
  color: #9ca3af;
  margin-bottom: 20rpx;
}

.no-barcode-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.no-barcode-item {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.nb-icon {
  font-size: 40rpx;
  margin-bottom: 10rpx;
}

.nb-title {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8rpx;
}

.nb-desc {
  display: block;
  font-size: 22rpx;
  color: #6b7280;
  line-height: 1.5;
}
</style>
