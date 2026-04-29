<template>
  <view class="page">
    <!-- 顶部 -->
    <view class="header">
      <view class="header-row">
        <!-- <text class="header-title">{{ isLogin ? '登录' : '注册' }}</text> -->
        <view style="width:60rpx"></view>
      </view>
    </view>

    <!-- Logo -->
    <view class="logo-area">
      <view class="logo-icon">
        <text>🏪</text>
      </view>
      <text class="logo-title">小店宝</text>
      <text class="logo-sub">智能掌柜 · 轻松开店</text>
    </view>

    <!-- 表单 -->
    <view class="form-area">
      <view class="input-group">
        <view class="input-item" :class="{ focus: focusField === 'account' }">
          <text class="input-prefix">📱</text>
          <input
            class="input-field"
            v-model="account"
            type="text"
            maxlength="30"
            placeholder="手机号 / 用户名"
            @focus="focusField = 'account'"
            @blur="focusField = ''"
          />
        </view>

        <!-- 密码 -->
        <view class="input-item" :class="{ focus: focusField === 'password' }">
          <text class="input-prefix">🔑</text>
          <input
            class="input-field"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            maxlength="32"
            placeholder="请输入密码"
            @focus="focusField = 'password'"
            @blur="focusField = ''"
          />
          <text class="eye-btn" @click="showPassword = !showPassword">
            {{ showPassword ? '👁' : '👁‍🗨' }}
          </text>
        </view>

        <!-- 注册时显示确认密码 -->
        <view class="input-item" v-if="!isLogin" :class="{ focus: focusField === 'confirmPwd' }">
          <text class="input-prefix">🔒</text>
          <input
            class="input-field"
            v-model="confirmPassword"
            :type="showConfirmPwd ? 'text' : 'password'"
            maxlength="32"
            placeholder="确认密码"
            @focus="focusField = 'confirmPwd'"
            @blur="focusField = ''"
          />
          <text class="eye-btn" @click="showConfirmPwd = !showConfirmPwd">
            {{ showConfirmPwd ? '👁' : '👁‍🗨' }}
          </text>
        </view>

        <!-- 注册时显示昵称 -->
        <view class="input-item" v-if="!isLogin" :class="{ focus: focusField === 'nickname' }">
          <text class="input-prefix">👤</text>
          <input
            class="input-field"
            v-model="nickname"
            type="text"
            maxlength="20"
            placeholder="设置昵称（选填）"
            @focus="focusField = 'nickname'"
            @blur="focusField = ''"
          />
        </view>
      </view>

      <view v-if="errorMsg" class="error-tip">
        <text>⚠ {{ errorMsg }}</text>
      </view>

      <!-- 登录 / 注册按钮 -->
      <view class="submit-btn" :class="{ disabled: !canSubmit }" @click="handleSubmit">
        <text v-if="submitting">⏳ 处理中...</text>
        <text v-else>{{ isLogin ? '登录' : '注册' }}</text>
      </view>

      <!-- 切换模式 -->
      <view class="switch-row">
        <text class="switch-text">
          {{ isLogin ? '还没有账号？' : '已有账号？' }}
        </text>
        <text class="switch-link" @click="toggleMode">
          {{ isLogin ? '立即注册' : '立即登录' }}
        </text>
      </view>
    </view>

    <!-- 协议 -->
    <view class="agreement">
      <text class="agree-text">登录即代表同意</text>
      <text class="agree-link">《小店宝服务协议》</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { loginByAccount, register, getCurrentUser } from '@/stores/account.js'
import { showToast } from '@/utils/bridge.js'

const router = useRouter()

const isLogin = ref(true)
const account = ref('')
const password = ref('')
const confirmPassword = ref('')
const nickname = ref('')
const errorMsg = ref('')
const submitting = ref(false)
const focusField = ref('')
const showPassword = ref(false)
const showConfirmPwd = ref(false)

const canSubmit = computed(() => {
  if (!account.value || !password.value) return false
  if (!isLogin.value && password.value !== confirmPassword.value) return false
  if (!isLogin.value && password.value.length < 6) return false
  return true
})

function handleSubmit() {
  if (!account.value || !password.value) {
    errorMsg.value = '请填写完整信息'
    return
  }

  if (!isLogin.value && password.value.length < 6) {
    errorMsg.value = '密码至少6位'
    return
  }

  if (!isLogin.value && password.value !== confirmPassword.value) {
    errorMsg.value = '两次密码输入不一致'
    return
  }

  submitting.value = true
  errorMsg.value = ''

  setTimeout(() => {
    let result
    if (isLogin.value) {
      result = loginByAccount(account.value.trim(), password.value)
    } else {
      result = register(account.value.trim(), password.value, nickname.value.trim())
    }

    submitting.value = false

    if (result.success) {
      showToast(result.message)
      setTimeout(() => {
        router.push('/home')
      }, 300)
    } else {
      errorMsg.value = result.message
    }
  }, 500)
}

function toggleMode() {
  isLogin.value = !isLogin.value
  errorMsg.value = ''
  password.value = ''
  confirmPassword.value = ''
}

function goBack() {
  if (getCurrentUser()) {
    router.push('/profile')
  } else {
    router.push('/home')
  }
}
</script>

<style scoped>
/* ═══ 页面基础样式 - 现代化设计 ═══ */
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ═══ 顶部导航 - 现代化设计 ═══ */
.header {
  position: sticky;
  top: 0;
  z-index: 99;
  padding: 80rpx 32rpx 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, transparent 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  width: 68rpx;
  height: 68rpx;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  transition: all var(--transition-normal);
}

.back-btn text {
  font-size: 40rpx;
  color: var(--text-primary);
  font-weight: var(--font-bold);
}

.back-btn:active {
  background: var(--primary-light);
  transform: scale(0.95);
}

.header-title {
  font-size: 34rpx;
  font-weight: var(--font-extrabold);
  color: var(--text-primary);
  letter-spacing: -0.5rpx;
}

/* ═══ Logo区域 - 现代化设计 ═══ */
.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 48rpx;
  margin-top: -20rpx;
}

.logo-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-2xl);
  margin-bottom: 24rpx;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.logo-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, var(--secondary-color), var(--primary-color));
}

.logo-icon:active {
  transform: scale(1.05);
  box-shadow: var(--shadow-3xl);
}

.logo-icon text {
  font-size: 56rpx;
}

.logo-title {
  font-size: 40rpx;
  font-weight: var(--font-extrabold);
  color: var(--text-primary);
  margin-bottom: 8rpx;
  letter-spacing: -1rpx;
}

.logo-sub {
  font-size: 26rpx;
  color: var(--text-muted);
  font-weight: var(--font-medium);
}

/* ═══ 表单区域 - 现代化设计 ═══ */
.form-area {
  margin: 0 32rpx;
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: 40rpx 32rpx;
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--border-color);
  position: relative;
  z-index: 1;
}

.form-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, var(--secondary-color), var(--primary-color));
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

.input-item {
  display: flex;
  align-items: center;
  background: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 8rpx 20rpx;
  min-height: 92rpx;
  transition: all var(--transition-normal);
  position: relative;
}

.input-item.focus {
  border-color: var(--primary-color);
  background: var(--bg-primary);
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
  transform: translateY(-2rpx);
}

.input-prefix {
  font-size: 28rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
  opacity: 0.9;
}

.input-field {
  flex: 1;
  font-size: 28rpx;
  color: var(--text-primary);
  background: transparent;
  border: none;
  outline: none;
  min-height: 68rpx;
  letter-spacing: 0.5rpx;
  font-weight: var(--font-medium);
}

.input-field::placeholder {
  color: var(--text-muted);
  font-size: 26rpx;
}

/* ═══ 密码可见切换 - 现代化设计 ═══ */
.eye-btn {
  font-size: 26rpx;
  margin-left: 12rpx;
  flex-shrink: 0;
  padding: 6rpx;
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
}

.eye-btn:active {
  background: var(--bg-secondary);
  transform: scale(0.9);
}

/* ═══ 错误提示 - 现代化设计 ═══ */
.error-tip {
  margin-top: 20rpx;
  padding: 16rpx 20rpx;
  background: var(--danger-light);
  border-radius: var(--radius-lg);
  border-left: 6rpx solid var(--danger-color);
}

.error-tip text {
  font-size: 22rpx;
  color: var(--danger-dark);
  font-weight: var(--font-medium);
}

/* ═══ 登录按钮 - 现代化设计 ═══ */
.submit-btn {
  margin-top: 36rpx;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-radius: var(--radius-xl);
  padding: 28rpx 0;
  text-align: center;
  box-shadow: var(--shadow-2xl);
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 96rpx;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left var(--transition-slow);
}

.submit-btn:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-xl);
}

.submit-btn:active::before {
  left: 100%;
}

.submit-btn.disabled {
  background: var(--bg-secondary);
  color: var(--text-muted);
  box-shadow: var(--shadow-sm);
  pointer-events: none;
  transform: none;
  opacity: 0.7;
}

.submit-btn text {
  font-size: 32rpx;
  font-weight: var(--font-bold);
  color: var(--text-white);
  letter-spacing: 1rpx;
  position: relative;
  z-index: 1;
}

/* ═══ 切换按钮 - 现代化设计 ═══ */
.switch-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12rpx;
  margin-top: 32rpx;
  padding: 20rpx 0;
}

.switch-text {
  font-size: 26rpx;
  color: var(--text-muted);
  font-weight: var(--font-medium);
}

.switch-link {
  font-size: 26rpx;
  font-weight: var(--font-semibold);
  color: var(--primary-color);
  transition: all var(--transition-normal);
  position: relative;
  cursor: pointer;
  padding: 8rpx 16rpx;
  border-radius: var(--radius-md);
}

.switch-link::after {
  content: '';
  position: absolute;
  bottom: -2rpx;
  left: 0;
  width: 0;
  height: 2rpx;
  background: var(--primary-color);
  transition: width var(--transition-normal);
}

.switch-link:active {
  background: var(--primary-light);
  transform: scale(0.95);
}

.switch-link:hover::after {
  width: 100%;
}

/* ═══ 协议区域 - 现代化设计 ═══ */
.agreement {
  text-align: center;
  padding: 40rpx 32rpx 80rpx;
  margin-top: auto;
}

.agree-text {
  font-size: 24rpx;
  color: var(--text-muted);
  font-weight: var(--font-medium);
}

.agree-link {
  font-size: 24rpx;
  color: var(--primary-color);
  font-weight: var(--font-semibold);
  transition: all var(--transition-normal);
  padding: 4rpx 8rpx;
  border-radius: var(--radius-sm);
}

.agree-link:active {
  background: var(--primary-light);
  opacity: 0.7;
  transform: scale(0.95);
}
</style>