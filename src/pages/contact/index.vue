<template>
  <view class="page">
    <!-- 快速联系 -->
    <view class="section">
      <text class="section-title">📞 快速联系</text>
      <view class="quick-actions">
        <view class="action-btn phone-btn" @click="callNow">
          <view class="action-icon">📱</view>
          <text class="action-title">一键拨号</text>
          <text class="action-desc">{{ maskedPhone }}</text>
        </view>
        <view class="action-btn wechat-btn" @click="showWechatQr">
          <view class="action-icon">💬</view>
          <text class="action-title">微信咨询</text>
          <text class="action-desc">扫码加微信</text>
        </view>
      </view>
    </view>

    <!-- 服务信息 -->
    <view class="section">
      <text class="section-title">📌 服务信息</text>
      <view class="info-card">
        <view class="info-row">
          <text class="info-label">服务时间</text>
          <text class="info-value">{{ contactInfo.serviceHours }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">服务区域</text>
          <text class="info-value">白城市及周边</text>
        </view>
        <view class="info-row">
          <text class="info-label">服务方式</text>
          <text class="info-value">上门指导 · 远程协助</text>
        </view>
      </view>
    </view>

    <!-- 需求登记表单 -->
    <view class="section">
      <text class="section-title">📋 免费试用申请</text>
      <view class="form-card">
        <view class="form-group">
          <text class="form-label">您的姓名 <text class="required">*</text></text>
          <input class="form-input" v-model="form.name" placeholder="怎么称呼您？" />
        </view>
        <view class="form-group">
          <text class="form-label">手机号码 <text class="required">*</text></text>
          <input class="form-input" v-model="form.phone" type="number" maxlength="11" placeholder="方便我们联系您" />
        </view>
        <view class="form-group">
          <text class="form-label">店铺类型</text>
          <view class="picker-wrapper" @click="showPicker = true">
            <text class="picker-text" :class="{ placeholder: !form.industry }">
              {{ form.industry || '请选择您的店铺类型' }}
            </text>
            <text class="picker-arrow">▼</text>
          </view>
          <view v-if="showPicker" class="picker-options">
            <view
              v-for="ind in industryOptions"
              :key="ind.value"
              class="picker-option"
              @click="selectIndustry(ind.value)"
            >
              <text>{{ ind.label }}</text>
            </view>
          </view>
        </view>
        <view class="form-group">
          <text class="form-label">简单描述您的需求</text>
          <textarea class="form-textarea" v-model="form.message" placeholder="比如：想了解扫码点餐怎么用" maxlength="200"></textarea>
          <text class="char-count">{{ form.message.length }}/200</text>
        </view>
        <view class="form-btn" @click="submitForm">
          <text>提交申请</text>
        </view>
        <text class="form-note">提交后我们会在24小时内联系您</text>
      </view>
    </view>

    <!-- 底部 -->
    <view class="bottom-info">
      <text class="bottom-text">鹤网软件 · 小店宝</text>
      <text class="bottom-text">为您提供专业的数字化经营方案</text>
    </view>

    <!-- 微信二维码弹窗 -->
    <view v-if="showQrModal" class="qr-overlay" @click="closeQrModal">
      <view class="qr-modal" @click.stop>
        <text class="qr-close" @click="closeQrModal">✕</text>
        <text class="qr-title">💬 扫码加微信</text>
        <image class="qr-img" src="/static/images/qr-wechat.jpg" mode="widthFix"></image>
        <text class="qr-tip">长按或扫码添加，免费咨询小店宝</text>
        <text class="qr-tip-sub">手机: 13039360430</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { makePhoneCall, getContactInfo, copyToClipboard } from '@/utils/phone.js'
import { showToast } from '@/utils/bridge.js'

const router = useRouter()
const contactInfo = reactive(getContactInfo())
const showPicker = ref(false)
const showQrModal = ref(false)

const form = reactive({
  name: '',
  phone: '',
  industry: '',
  message: ''
})

const industryOptions = [
  { value: 'catering', label: '🍜 餐饮/小吃/快餐' },
  { value: 'retail', label: '🏪 超市/食杂/零售' },
  { value: 'hardware', label: '🔧 五金/建材/日杂' },
  { value: 'other', label: '📌 其他行业' }
]

const maskedPhone = computed(() => {
  const phone = contactInfo.phone
  if (!phone || phone === '186xxxxxxxx') return '请联系老大获取号码'
  return phone
})

function callNow() {
  makePhoneCall(contactInfo.phone)
}

function showWechatQr() {
  showQrModal.value = true
}

function closeQrModal() {
  showQrModal.value = false
}

function selectIndustry(value) {
  const option = industryOptions.find(o => o.value === value)
  form.industry = option ? option.label : value
  showPicker.value = false
}

function submitForm() {
  if (!form.name.trim()) {
    showToast('请输入您的姓名')
    return
  }
  if (!form.phone.trim() || form.phone.length < 11) {
    showToast('请输入正确的手机号码')
    return
  }

  // 构建提交数据
  const submitData = {
    name: form.name.trim(),
    phone: form.phone.trim(),
    industry: form.industry || '未选择',
    message: form.message.trim() || '无'
  }

  console.log('提交需求:', submitData)

  // TODO: 对接后端API提交
  // 当前先做toast提示
  showToast('提交成功！我们会尽快联系您')

  // 清空表单
  form.name = ''
  form.phone = ''
  form.industry = ''
  form.message = ''
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
  margin-bottom: 24rpx;
  letter-spacing: -0.5rpx;
}

/* ═══ 快速联系按钮 - 现代化设计 ═══ */
.quick-actions {
  display: flex;
  gap: 24rpx;
}

.action-btn {
  flex: 1;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, var(--secondary-color), var(--primary-color));
}

.action-btn:active {
  transform: scale(0.96);
  box-shadow: var(--shadow-xl);
}

.action-icon {
  font-size: 56rpx;
  margin-bottom: 16rpx;
  filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.1));
}

.action-title {
  font-size: 30rpx;
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: 8rpx;
  letter-spacing: -0.5rpx;
}

.action-desc {
  font-size: 24rpx;
  color: var(--text-muted);
  font-weight: var(--font-medium);
}

/* ═══ 信息卡 - 现代化设计 ═══ */
.info-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 28rpx;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.info-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, var(--secondary-color), var(--primary-color));
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1px solid var(--border-light);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

.info-value {
  font-size: 28rpx;
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

/* ═══ 表单卡片 - 现代化设计 ═══ */
.form-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 32rpx;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.form-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, var(--secondary-color), var(--primary-color));
}

.form-group {
  margin-bottom: 28rpx;
  position: relative;
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
  margin-bottom: 12rpx;
}

.required {
  color: var(--danger-color);
}

.form-input {
  width: 100%;
  height: 84rpx;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0 24rpx;
  font-size: 28rpx;
  background: var(--bg-tertiary);
  transition: all var(--transition-normal);
  font-weight: var(--font-medium);
}

.form-input:focus {
  border-color: var(--primary-color);
  background: var(--bg-primary);
  box-shadow: var(--shadow-sm);
  outline: none;
}

.form-textarea {
  width: 100%;
  height: 168rpx;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  background: var(--bg-tertiary);
  resize: none;
  transition: all var(--transition-normal);
  font-weight: var(--font-medium);
}

.form-textarea:focus {
  border-color: var(--primary-color);
  background: var(--bg-primary);
  box-shadow: var(--shadow-sm);
  outline: none;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: var(--text-muted);
  margin-top: 8rpx;
  font-weight: var(--font-medium);
}

.picker-wrapper {
  width: 100%;
  height: 84rpx;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-tertiary);
  transition: all var(--transition-normal);
  font-weight: var(--font-medium);
}

.picker-wrapper:active {
  background: var(--bg-secondary);
}

.picker-text {
  font-size: 28rpx;
  color: var(--text-primary);
}

.picker-text.placeholder {
  color: var(--text-muted);
}

.picker-arrow {
  font-size: 22rpx;
  color: var(--text-muted);
}

.picker-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xl);
  margin-top: 8rpx;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.picker-option {
  padding: 28rpx 24rpx;
  font-size: 28rpx;
  border-bottom: 1px solid var(--border-light);
  transition: all var(--transition-normal);
  font-weight: var(--font-medium);
}

.picker-option:active {
  background: var(--primary-light);
}

.picker-option:last-child {
  border-bottom: none;
}

/* ═══ 表单按钮 - 现代化设计 ═══ */
.form-btn {
  width: 100%;
  height: 92rpx;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 24rpx;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.form-btn:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-xl);
}

.form-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left var(--transition-slow);
}

.form-btn:active::before {
  left: 100%;
}

.form-btn text {
  font-size: 32rpx;
  font-weight: var(--font-bold);
  color: var(--text-white);
  letter-spacing: 1rpx;
  position: relative;
  z-index: 1;
}

.form-note {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: var(--text-muted);
  margin-top: 20rpx;
  font-weight: var(--font-medium);
}

/* ═══ 底部信息 - 现代化设计 ═══ */
.bottom-info {
  text-align: center;
  padding: 0 32rpx;
}

.bottom-text {
  display: block;
  font-size: 24rpx;
  color: var(--text-muted);
  margin-bottom: 8rpx;
  font-weight: var(--font-medium);
}

/* ═══ 微信二维码弹窗 - 现代化设计 ═══ */
.qr-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.qr-modal {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: 48rpx 40rpx;
  width: 80%;
  max-width: 520rpx;
  text-align: center;
  position: relative;
  box-shadow: var(--shadow-3xl);
  border: 1px solid var(--border-color);
}

.qr-close {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  font-size: 32rpx;
  color: var(--text-muted);
  padding: 8rpx;
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
}

.qr-close:active {
  background: var(--bg-tertiary);
  transform: scale(0.9);
}

.qr-title {
  display: block;
  font-size: 34rpx;
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: 28rpx;
  letter-spacing: -0.5rpx;
}

.qr-img {
  width: 320rpx;
  height: 320rpx;
  margin: 0 auto 28rpx;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}

.qr-tip {
  display: block;
  font-size: 26rpx;
  color: var(--text-secondary);
  margin-bottom: 12rpx;
  font-weight: var(--font-medium);
}

.qr-tip-sub {
  display: block;
  font-size: 22rpx;
  color: var(--text-muted);
  font-weight: var(--font-medium);
}
</style>