<template>
  <view class="page">
    <!-- ═══ 现代化顶部导航 ═══ -->
    <view class="nav-header">
      <view class="nh-left">
        <view class="nh-title-area">
          <text class="nh-title">个人中心</text>
          <text class="nh-sub">管理您的账户信息</text>
        </view>
      </view>
      <view style="width:60rpx"></view>
    </view>

    <!-- ═══ 未登录状态 - 现代化设计 ═══ -->
    <view v-if="!user" class="unlogin-section">
      <view class="unlogin-content">
        <view class="unlogin-icon">👤</view>
        <text class="unlogin-title">欢迎使用小店宝</text>
        <text class="unlogin-text">登录后享受完整功能</text>
        <view class="login-btn" @click="goAuth">
          <text class="login-btn-text">登录 / 注册</text>
        </view>
      </view>
    </view>

    <!-- ═══ 已登录状态 - 现代化设计 ═══ -->
    <view v-else class="body">
      <!-- 用户信息卡片 - 现代化设计 -->
      <view class="user-card">
        <view class="user-avatar">
          <text class="avatar-text">{{ avatarText }}</text>
        </view>
        <view class="user-info">
          <text class="user-name">{{ user.nickname }}</text>
          <text class="user-phone">{{ user.phone }}</text>
        </view>
        <view class="user-status">
          <text class="status-badge">已认证</text>
        </view>
      </view>

      <!-- 菜单列表 -->
      <view class="menu-group">
        <text class="menu-group-title">店铺设置</text>
        <view class="menu-item" @click="showShopSettings = true">
          <view class="menu-left">
            <view class="menu-icon mi-shop">🏪</view>
            <text class="menu-label">店铺信息</text>
          </view>
          <view class="menu-right">
            <text class="menu-value">{{ user.shopName || '未设置' }}</text>
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>

      <view class="menu-group">
        <text class="menu-group-title">数据管理</text>
        <view class="menu-item" @click="handleExport">
          <view class="menu-left">
            <view class="menu-icon mi-export">📤</view>
            <text class="menu-label">导出数据</text>
          </view>
          <view class="menu-right">
            <text class="menu-arrow">›</text>
          </view>
        </view>
        <view class="menu-item" @click="handleImport">
          <view class="menu-left">
            <view class="menu-icon mi-import">📥</view>
            <text class="menu-label">导入数据</text>
          </view>
          <view class="menu-right">
            <text class="menu-arrow">›</text>
          </view>
        </view>
        <view class="menu-item" @click="confirmClear">
          <view class="menu-left">
            <view class="menu-icon mi-clear">🗑️</view>
            <text class="menu-label danger">清空全部数据</text>
          </view>
          <view class="menu-right">
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>

      <view class="menu-group">
        <text class="menu-group-title">关于</text>
        <view class="menu-item" @click="goAbout">
          <view class="menu-left">
            <view class="menu-icon mi-about">ℹ️</view>
            <text class="menu-label">关于小店宝</text>
          </view>
          <view class="menu-right">
            <text class="menu-value">v1.0.0</text>
            <text class="menu-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="logout-btn" @click="handleLogout">
        <text>退出登录</text>
      </view>
    </view>

    <!-- 店铺设置弹窗 -->
    <view class="overlay" v-if="showShopSettings" @click="showShopSettings = false">
      <view class="modal" @click.stop>
        <text class="modal-title">店铺设置</text>

        <view class="modal-field">
          <text class="field-label">店铺名称</text>
          <input class="field-input" v-model="shopForm.shopName" placeholder="输入店铺名称" />
        </view>
        <view class="modal-field">
          <text class="field-label">联系电话</text>
          <input class="field-input" v-model="shopForm.shopPhone" placeholder="输入联系电话" type="number" maxlength="11" />
        </view>
        <view class="modal-field">
          <text class="field-label">店铺地址</text>
          <input class="field-input" v-model="shopForm.shopAddress" placeholder="输入店铺地址" />
        </view>

        <view class="modal-btns">
          <view class="modal-btn cancel" @click="showShopSettings = false">取消</view>
          <view class="modal-btn confirm" @click="saveShopSettings">保存</view>
        </view>
      </view>
    </view>

    <!-- 导入弹窗 -->
    <view class="overlay" v-if="showImport" @click="showImport = false">
      <view class="modal" @click.stop>
        <text class="modal-title">导入数据</text>
        <text class="modal-desc">请将导出的JSON数据粘贴到下方输入框</text>
        <textarea class="import-textarea" v-model="importJson" placeholder="粘贴JSON数据..." />
        <view class="modal-btns">
          <view class="modal-btn cancel" @click="showImport = false">取消</view>
          <view class="modal-btn confirm" @click="doImport">导入</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, logout, updateShopSettings, getAvatarText, exportAllData, importAllData, clearAllBusinessData } from '@/stores/account.js'
import { showToast } from '@/utils/bridge.js'

const router = useRouter()
const user = ref(null)
const avatarText = ref('')
const showShopSettings = ref(false)
const showImport = ref(false)
const importJson = ref('')

const shopForm = reactive({
  shopName: '',
  shopPhone: '',
  shopAddress: ''
})

onMounted(() => {
  loadUser()
})

function loadUser() {
  const u = getCurrentUser()
  user.value = u
  if (u) {
    avatarText.value = getAvatarText(u)
    shopForm.shopName = u.shopName || ''
    shopForm.shopPhone = u.shopPhone || ''
    shopForm.shopAddress = u.shopAddress || ''
  }
}

function goBack() {
  router.push('/home')
}

function goAuth() {
  router.push('/auth')
}

function goAbout() {
  router.push('/about')
}

function handleLogout() {
  logout()
  user.value = null
  showToast('已退出登录')
  setTimeout(() => {
    router.push('/home')
  }, 300)
}

// 店铺设置
function saveShopSettings() {
  const result = updateShopSettings({
    shopName: shopForm.shopName,
    shopPhone: shopForm.shopPhone,
    shopAddress: shopForm.shopAddress
  })
  if (result.success) {
    user.value = result.user
    showShopSettings.value = false
    showToast('✅ 已保存')
  }
}

// 数据管理
function handleExport() {
  const data = exportAllData()
  try {
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `小店宝数据_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('📤 已导出')
  } catch (e) {
    showToast('导出失败')
  }
}

function handleImport() {
  showImport.value = true
  importJson.value = ''
}

function doImport() {
  if (!importJson.value.trim()) {
    showToast('请粘贴数据')
    return
  }
  const result = importAllData(importJson.value)
  showToast(result.message)
  showImport.value = false
  importJson.value = ''
}

function confirmClear() {
  const sure = confirm('⚠️ 确定清空所有业务数据吗？\n此操作不可恢复！')
  if (sure) {
    const result = clearAllBusinessData()
    showToast(result.message)
  }
}
</script>

<style scoped>
/* ═══ 页面基础样式 - 现代化设计 ═══ */
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
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

/* ═══ 未登录状态 - 现代化设计 ═══ */
.unlogin-section {
  padding: 80rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.unlogin-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 400rpx;
}

.unlogin-icon {
  width: 140rpx;
  height: 140rpx;
  border-radius: 70rpx;
  background: linear-gradient(135deg, var(--bg-tertiary), var(--bg-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64rpx;
  margin-bottom: 32rpx;
  box-shadow: var(--shadow-lg);
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.unlogin-title {
  font-size: 32rpx;
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: 12rpx;
  letter-spacing: -0.5rpx;
}

.unlogin-text {
  font-size: 26rpx;
  color: var(--text-muted);
  margin-bottom: 40rpx;
  font-weight: var(--font-medium);
  line-height: 1.5;
}

.login-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-radius: var(--radius-xl);
  padding: 24rpx 96rpx;
  font-size: 30rpx;
  font-weight: var(--font-semibold);
  color: #fff;
  box-shadow: var(--shadow-lg);
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.login-btn:active {
  opacity: 0.9;
  transform: scale(0.98);
  box-shadow: var(--shadow-md);
}

/* ═══ 已登录状态 - 现代化设计 ═══ */
.body {
  padding: 24rpx 32rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

/* ═══ 用户信息卡片 - 现代化设计 ═══ */
.user-card {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.user-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, var(--secondary-color), var(--primary-color));
}

.user-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: var(--font-bold);
  color: #fff;
  flex-shrink: 0;
  box-shadow: var(--shadow-md);
}

.user-info {
  flex: 1;
}

.user-name {
  display: block;
  font-size: 30rpx;
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: 6rpx;
  letter-spacing: -0.5rpx;
}

.user-phone {
  font-size: 24rpx;
  color: var(--text-muted);
  font-weight: var(--font-medium);
}

.user-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 6rpx 16rpx;
  background: var(--success-light);
  color: var(--success-color);
  border-radius: var(--radius-full);
  font-size: 20rpx;
  font-weight: var(--font-semibold);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

/* ═══ 菜单分组 - 现代化设计 ═══ */
.menu-group {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
}

.menu-group-title {
  display: block;
  padding: 24rpx 28rpx 12rpx;
  font-size: 24rpx;
  font-weight: var(--font-semibold);
  color: var(--primary-color);
  letter-spacing: -0.5rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 28rpx;
  border-bottom: 1px solid var(--border-light);
  transition: all var(--transition-normal);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background: var(--primary-light);
  transform: translateX(4rpx);
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.menu-icon {
  width: 52rpx;
  height: 52rpx;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  flex-shrink: 0;
  transition: all var(--transition-normal);
}

.mi-shop {
  background: var(--primary-light);
  color: var(--primary-color);
}

.mi-export {
  background: var(--success-light);
  color: var(--success-color);
}

.mi-import {
  background: var(--info-light);
  color: var(--info-color);
}

.mi-clear {
  background: var(--danger-light);
  color: var(--danger-color);
}

.mi-about {
  background: var(--secondary-light);
  color: var(--secondary-color);
}

.menu-label {
  font-size: 26rpx;
  color: var(--text-primary);
  font-weight: var(--font-medium);
  letter-spacing: -0.5rpx;
}

.menu-label.danger {
  color: var(--danger-color);
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.menu-value {
  font-size: 22rpx;
  color: var(--text-muted);
  max-width: 200rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: var(--font-medium);
}

.menu-arrow {
  font-size: 30rpx;
  color: var(--border-color);
  font-weight: var(--font-bold);
  transition: all var(--transition-normal);
}

.menu-item:active .menu-arrow {
  color: var(--primary-color);
}

/* ═══ 退出按钮 - 现代化设计 ═══ */
.logout-btn {
  margin: 0;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 24rpx 0;
  text-align: center;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.logout-btn:active {
  background: var(--danger-light);
  transform: scale(0.98);
  box-shadow: var(--shadow-lg);
}

.logout-btn text {
  font-size: 28rpx;
  font-weight: var(--font-semibold);
  color: var(--danger-color);
  letter-spacing: -0.5rpx;
}

/* ═══ 弹窗遮罩 - 现代化设计 ═══ */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 40rpx;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: 48rpx 40rpx;
  width: 100%;
  max-width: 560rpx;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--border-color);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  0% { 
    transform: translateY(20rpx); 
    opacity: 0; 
  }
  100% { 
    transform: translateY(0); 
    opacity: 1; 
  }
}

.modal-title {
  display: block;
  font-size: 32rpx;
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin-bottom: 24rpx;
  text-align: center;
  letter-spacing: -0.5rpx;
}

.modal-desc {
  display: block;
  font-size: 24rpx;
  color: var(--text-muted);
  margin-bottom: 24rpx;
  font-weight: var(--font-medium);
  line-height: 1.5;
}

.modal-field {
  margin-bottom: 24rpx;
}

.field-label {
  display: block;
  font-size: 24rpx;
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: 12rpx;
  letter-spacing: -0.5rpx;
}

.field-input {
  width: 100%;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16rpx 20rpx;
  font-size: 26rpx;
  color: var(--text-primary);
  min-height: 60rpx;
  transition: all var(--transition-normal);
  font-weight: var(--font-medium);
}

.field-input:focus {
  border-color: var(--primary-color);
  background: var(--bg-primary);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.import-textarea {
  width: 100%;
  min-height: 240rpx;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16rpx 20rpx;
  font-size: 24rpx;
  color: var(--text-primary);
  resize: vertical;
  font-weight: var(--font-medium);
  transition: all var(--transition-normal);
}

.import-textarea:focus {
  border-color: var(--primary-color);
  background: var(--bg-primary);
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.modal-btns {
  display: flex;
  gap: 20rpx;
  margin-top: 32rpx;
}

.modal-btn {
  flex: 1;
  padding: 20rpx 0;
  border-radius: var(--radius-lg);
  text-align: center;
  font-size: 28rpx;
  font-weight: var(--font-semibold);
  transition: all var(--transition-normal);
  border: 1px solid transparent;
}

.modal-btn:active {
  opacity: 0.9;
  transform: scale(0.98);
}

.modal-btn.cancel {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-color: var(--border-light);
}

.modal-btn.confirm {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: #fff;
  box-shadow: var(--shadow-md);
}
</style>