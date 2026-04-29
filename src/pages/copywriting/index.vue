<template>
  <view class="page">
    <view class="nav-header">
      <view class="nh-left">
        <view class="nh-title-area">
          <text class="nh-title">AI 写文案</text>
          <text class="nh-sub">一键生成朋友圈</text>
        </view>
      </view>
      <view class="nh-right">
        <view class="nh-btn" @click="regenerate">🔄 换一批</view>
      </view>
    </view>

    <view class="app-screen">
      <!-- 输入卡片 -->
      <view class="input-card">
        <view class="input-label-row">
          <text class="input-label">商品名 / 活动名称</text>
        </view>
        <view class="input-row">
          <input class="product-input" v-model="productName" placeholder="比如：草莓、全场8折、新到牛肉" @confirm="generateCopies" />
          <view class="generate-btn" :class="{ active: !generating }" @click="generateCopies">
            <text>{{ generating ? '⏳' : '✨ 生成' }}</text>
          </view>
        </view>
        <!-- 快速模板 -->
        <view class="quick-templates">
          <text v-for="t in quickTemplates" :key="t" class="qt-chip" @click="productName = t; generateCopies()">{{ t }}</text>
        </view>
        <!-- 风格选择 -->
        <view class="style-selector">
          <text class="style-label">风格</text>
          <view v-for="s in styles" :key="s.id" class="style-chip" :class="{ active: selectedStyle === s.id }" @click="selectedStyle = s.id">{{ s.icon }} {{ s.name }}</view>
        </view>
      </view>

      <!-- 生成结果 - 优先展示 -->
      <view class="results-section">
        <view class="results-header">
          <text class="results-title">📝 生成结果</text>
          <view class="results-actions">
            <text class="ra-btn" @click="regenerate">🔄 换一批</text>
            <text class="ra-btn primary" @click="copyAll">📋 复制全部</text>
          </view>
        </view>
        <view class="copy-list" v-if="generatedCopies.length > 0">
          <view v-for="(copy, idx) in displayCopies" :key="idx" class="copy-card" @click="copySingle(copy.text)">
            <view class="copy-tag">{{ copy.tag }}</view>
            <text class="copy-text">{{ copy.text }}</text>
            <view class="copy-actions">
              <text class="ca-btn copy" @click.stop="copySingle(copy.text)">📋 复制</text>
              <text class="ca-btn share" @click.stop="shareCopy(copy.text)">📤 分享</text>
            </view>
          </view>
        </view>
        <view class="copy-list" v-else>
          <view class="empty-result">
            <view class="loading-dots" v-if="generating">
              <view class="lds-ellipsis"><view></view><view></view><view></view><view></view></view>
              <text class="loading-text">AI 正在创作中…</text>
            </view>
            <view v-else class="empty-result-inner">
              <text class="empty-result-icon">✨</text>
              <text class="empty-result-text">输入商品名，点击生成</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 使用小贴士 - 移到下面 -->
      <view class="tips-section">
        <text class="tips-title">💡 使用小贴士</text>
        <view class="tip-grid">
          <view class="tip-item"><text class="tip-icon">📸</text><text class="tip-text">拍张商品照片配文案一起发</text></view>
          <view class="tip-item"><text class="tip-icon">⏰</text><text class="tip-text">饭点前发餐饮，晚上发促销</text></view>
          <view class="tip-item"><text class="tip-icon">💬</text><text class="tip-text">复制后直接粘贴到朋友圈</text></view>
          <view class="tip-item"><text class="tip-icon">🔄</text><text class="tip-text">不满意点"换一批"重新生成</text></view>
        </view>
      </view>

      <!-- 历史记录 -->
      <view class="history-section" v-if="history.length > 0">
        <view class="history-header">
          <text class="history-title">🕐 历史记录</text>
          <text class="history-clear" @click="showClearConfirm = true">清空</text>
        </view>
        <view class="history-list">
          <view v-for="h in history" :key="h.id" class="history-item" @click="reuseHistory(h)">
            <view class="history-icon">{{ detectEmoji(h.product) }}</view>
            <view class="history-info">
              <text class="history-product">{{ h.product }}</text>
              <text class="history-preview">{{ h.copies?.[0]?.text?.slice(0, 40) }}...</text>
            </view>
            <view class="history-meta">
              <text class="history-time">{{ formatTime(h.createdAt) }}</text>
              <text class="history-del" @click.stop="deleteHistoryRecord(h.id)">✕</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 清空确认弹窗 -->
      <view class="overlay" v-if="showClearConfirm" @click="showClearConfirm = false">
        <view class="confirm-modal" @click.stop>
          <text class="confirm-title">清空历史记录？</text>
          <text class="confirm-desc">删除后将无法恢复</text>
          <view class="confirm-actions">
            <view class="confirm-btn cancel" @click="showClearConfirm = false">取消</view>
            <view class="confirm-btn danger" @click="clearHistory">清空</view>
          </view>
        </view>
      </view>
    </view>

    <view style="height:150rpx"></view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { generateCopies as genCopies } from '@/utils/copywriter.js'
import { useRouter } from 'vue-router'
import { getCopywriteHistory, addCopywriteRecord, deleteCopywriteRecord } from '@/stores/db.js'
import { showToast, setClipboard, shareText } from '@/utils/bridge.js'

const productName = ref('')
const selectedStyle = ref('all')
const generating = ref(false)
const generatedCopies = ref([])
const history = ref([])
const showClearConfirm = ref(false)

const quickTemplates = ['东北草莓', '全场8折', '新到牛肉', '纯棉T恤', '开业大吉']

const styles = [
  { id: 'all', icon: '🎯', name: '全部' },
  { id: 'direct', icon: '📢', name: '直白版' },
  { id: 'friendly', icon: '😄', name: '亲切版' },
  { id: 'promo', icon: '🔥', name: '促销版' },
  { id: 'warm', icon: '💝', name: '温情版' },
  { id: 'short', icon: '⚡', name: '短句版' }
]

const displayCopies = computed(() => {
  if (selectedStyle.value === 'all') return generatedCopies.value
  const map = { direct: 0, friendly: 1, promo: 2, warm: 3, short: 4 }
  const idx = map[selectedStyle.value]
  if (idx !== undefined && generatedCopies.value[idx]) return [generatedCopies.value[idx]]
  return generatedCopies.value
})

onMounted(() => { history.value = getCopywriteHistory().slice(0, 20) })

function generateCopies() {
  const product = productName.value.trim()
  if (!product) { showToast('请输入商品名或活动名称'); return }
  generating.value = true
  setTimeout(() => {
    const result = genCopies(product)
    generatedCopies.value = result
    generating.value = false
    addCopywriteRecord(product, result)
    history.value = getCopywriteHistory().slice(0, 20)
    showToast(`✅ 已生成 ${result.length} 条文案`)
  }, 400)
}

function regenerate() { if (productName.value.trim()) generateCopies() }

function copySingle(text) { setClipboard(text, '✅ 已复制，去发朋友圈吧！') }

function copyAll() {
  const text = displayCopies.value.map(c => c.text).join('\n\n————————\n\n')
  setClipboard(text, `✅ ${displayCopies.value.length} 条全部已复制！`)
}

function shareCopy(text) { shareText(text, '分享文案') }

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso); const now = new Date(); const diff = now - d
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

function reuseHistory(h) { productName.value = h.product; generatedCopies.value = h.copies || [] }

function detectEmoji(name) {
  const map = {
    '草莓|樱桃|苹果|香蕉|葡萄|橙子|西瓜|水果|芒果|荔枝|桃子': '🍓',
    '牛肉|羊肉|猪肉|鸡腿|排骨|五花肉|里脊': '🥩',
    '白菜|萝卜|土豆|西红柿|黄瓜|茄子|辣椒|青菜|蔬菜|豆角': '🥬',
    '啤酒|白酒|饮料|矿泉水|可乐|雪碧|果汁|酸奶|牛奶|茶': '🥤',
    '面包|蛋糕|饼干|零食|薯片|糖果|巧克力|瓜子|花生|坚果': '🍪',
    '大米|面粉|食用油|酱油|醋|盐|糖|调料': '🍚',
    '螺丝|钉子|扳手|钳子|工具|五金|水管|电线|灯泡|开关': '🔧',
    '衣服|裤子|鞋子|帽子|围巾|袜子|包包': '👕',
    '手机|充电器|耳机|数据线|手机壳|贴膜': '📱'
  }
  for (const [pattern, emoji] of Object.entries(map)) {
    if (new RegExp(pattern).test(name)) return emoji
  }
  return '🎁'
}

function deleteHistoryRecord(id) { deleteCopywriteRecord(id); history.value = getCopywriteHistory().slice(0, 20); showToast('已删除') }
function scrollToTop() { /* already on page */ }
function clearHistory() {
  const h = getCopywriteHistory(); h.forEach(item => deleteCopywriteRecord(item.id))
  history.value = []; showClearConfirm.value = false; showToast('历史已清空')
}
</script>

<style scoped>
/* ═══ 页面基础样式 - 现代化设计 ═══ */
.page { 
  min-height: 100vh; 
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ═══ 导航头部 - 现代化设计 ═══ */
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

.nh-right { 
  display: flex; 
  align-items: center; 
  gap: 12rpx; 
}

.nh-btn {
  padding: 12rpx 24rpx; 
  border-radius: 40rpx;
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  color: var(--warning-color); 
  font-size: 24rpx; 
  font-weight: var(--font-semibold);
  border: 1px solid rgba(245, 158, 11, 0.2);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.nh-btn:active { 
  background: var(--warning-color);
  color: #fff;
  transform: scale(0.95);
}

.app-screen { 
  padding: 24rpx 32rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

/* ═══ 输入卡片 - 现代化设计 ═══ */
.input-card {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: 32rpx;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.input-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, var(--secondary-color), var(--primary-color));
}

.input-label-row { 
  margin-bottom: 16rpx; 
}

.input-label { 
  font-size: 26rpx; 
  font-weight: var(--font-bold); 
  color: var(--text-primary); 
  letter-spacing: -0.5rpx;
}

.input-row { 
  display: flex; 
  gap: 12rpx; 
  margin-bottom: 20rpx; 
}

.product-input {
  flex: 1; 
  height: 80rpx; 
  border: 1px solid var(--border-color); 
  border-radius: var(--radius-lg);
  padding: 0 28rpx; 
  font-size: 28rpx; 
  background: var(--bg-secondary);
  transition: all var(--transition-normal);
  font-weight: var(--font-medium);
}

.product-input:focus { 
  border-color: var(--primary-color); 
  background: var(--bg-primary); 
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.generate-btn {
  height: 80rpx; 
  padding: 0 32rpx; 
  border-radius: var(--radius-lg); 
  display: flex;
  align-items: center; 
  justify-content: center; 
  font-size: 28rpx; 
  font-weight: var(--font-semibold);
  background: var(--bg-tertiary); 
  color: var(--text-muted); 
  white-space: nowrap; 
  flex-shrink: 0;
  transition: all var(--transition-normal);
  border: 1px solid var(--border-color);
}

.generate-btn.active { 
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark)); 
  color: #fff; 
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
}

.generate-btn:active { 
  opacity: 0.9; 
  transform: scale(0.98);
}

.quick-templates { 
  display: flex; 
  gap: 12rpx; 
  flex-wrap: wrap; 
  margin-bottom: 20rpx; 
}

.qt-chip {
  padding: 10rpx 28rpx; 
  border-radius: var(--radius-full); 
  font-size: 24rpx;
  background: var(--primary-light); 
  color: var(--primary-color);
  font-weight: var(--font-medium);
  transition: all var(--transition-normal);
  border: 1px solid rgba(249, 115, 22, 0.2);
}

.qt-chip:active { 
  background: var(--primary-color); 
  color: #fff;
  transform: scale(0.95);
}

.style-selector { 
  display: flex; 
  align-items: center; 
  gap: 10rpx; 
  flex-wrap: wrap; 
}

.style-label { 
  font-size: 24rpx; 
  font-weight: var(--font-semibold); 
  color: var(--text-primary); 
  margin-right: 8rpx; 
}

.style-chip {
  padding: 8rpx 20rpx; 
  border-radius: var(--radius-full); 
  font-size: 22rpx;
  background: var(--bg-tertiary); 
  color: var(--text-secondary); 
  text-align: center;
  transition: all var(--transition-normal);
  border: 1px solid var(--border-light);
}

.style-chip.active { 
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark)); 
  color: #fff; 
  font-weight: var(--font-semibold); 
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

/* ═══ 结果展示区域 - 现代化设计 ═══ */
.results-section { 
  margin-bottom: 0; 
}

.empty-result { 
  padding: 60rpx 0; 
  text-align: center; 
}

.empty-result-inner { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 16rpx; 
}

.empty-result-icon { 
  font-size: 56rpx; 
  opacity: 0.6;
}

.empty-result-text { 
  font-size: 28rpx; 
  color: var(--text-muted); 
  font-weight: var(--font-medium);
}

/* ═══ 加载动画 - 现代化设计 ═══ */
.loading-dots { 
  padding: 60rpx 0; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 20rpx; 
}

.loading-text { 
  font-size: 26rpx; 
  color: var(--text-muted); 
  font-weight: var(--font-medium);
}

.lds-ellipsis {
  display: inline-block; 
  position: relative; 
  width: 80rpx; 
  height: 40rpx;
}

.lds-ellipsis view {
  position: absolute; 
  top: 16rpx; 
  width: 12rpx; 
  height: 12rpx;
  border-radius: 50%; 
  background: var(--primary-color);
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}

.lds-ellipsis view:nth-child(1) {
  left: 4rpx; 
  animation: lds-ellipsis1 0.6s infinite;
}

.lds-ellipsis view:nth-child(2) {
  left: 4rpx; 
  animation: lds-ellipsis2 0.6s infinite;
}

.lds-ellipsis view:nth-child(3) {
  left: 32rpx; 
  animation: lds-ellipsis2 0.6s infinite;
}

.lds-ellipsis view:nth-child(4) {
  left: 60rpx; 
  animation: lds-ellipsis3 0.6s infinite;
}

@keyframes lds-ellipsis1 { 
  0% { transform: scale(0); } 
  100% { transform: scale(1); } 
}

@keyframes lds-ellipsis3 { 
  0% { transform: scale(1); } 
  100% { transform: scale(0); } 
}

@keyframes lds-ellipsis2 { 
  0% { transform: translate(0, 0); } 
  100% { transform: translate(28rpx, 0); } 
}

/* ═══ 结果头部 - 现代化设计 ═══ */
.results-header {
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 20rpx;
}

.results-title { 
  font-size: 30rpx; 
  font-weight: var(--font-bold); 
  color: var(--text-primary); 
  letter-spacing: -0.5rpx;
}

.results-actions { 
  display: flex; 
  gap: 12rpx; 
}

.ra-btn {
  padding: 10rpx 24rpx; 
  border-radius: var(--radius-full); 
  font-size: 24rpx;
  background: var(--bg-tertiary); 
  color: var(--text-secondary);
  font-weight: var(--font-medium);
  transition: all var(--transition-normal);
  border: 1px solid var(--border-light);
}

.ra-btn:active { 
  opacity: 0.8; 
  transform: scale(0.95);
}

.ra-btn.primary { 
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark)); 
  color: #fff; 
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

/* ═══ 文案卡片 - 现代化设计 ═══ */
.copy-list { 
  display: flex; 
  flex-direction: column; 
  gap: 20rpx; 
}

.copy-card {
  background: var(--bg-primary); 
  border-radius: var(--radius-lg); 
  padding: 32rpx;
  box-shadow: var(--shadow-md); 
  transition: all var(--transition-normal);
  position: relative; 
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.copy-card::before { 
  content: ""; 
  position: absolute; 
  left: 0; 
  top: 24rpx; 
  bottom: 24rpx; 
  width: 6rpx; 
  border-radius: 3rpx; 
  background: linear-gradient(180deg, var(--primary-color), var(--primary-dark)); 
}

.copy-card:active { 
  transform: scale(0.98); 
  background: var(--primary-light); 
  box-shadow: var(--shadow-lg);
}

.copy-tag {
  display: inline-block; 
  padding: 6rpx 20rpx; 
  border-radius: var(--radius-full); 
  font-size: 22rpx;
  color: var(--primary-color); 
  background: var(--primary-light); 
  margin-bottom: 16rpx;
  font-weight: var(--font-medium);
  border: 1px solid rgba(249, 115, 22, 0.2);
}

.copy-text {
  display: block; 
  font-size: 28rpx; 
  color: var(--text-primary); 
  line-height: 1.8;
  margin-bottom: 20rpx; 
  white-space: pre-line;
  font-weight: var(--font-medium);
}

.copy-actions { 
  display: flex; 
  gap: 16rpx; 
}

.ca-btn { 
  font-size: 24rpx; 
  padding: 10rpx 28rpx; 
  border-radius: var(--radius-full); 
  font-weight: var(--font-medium);
  transition: all var(--transition-normal);
}

.ca-btn:active { 
  opacity: 0.8; 
  transform: scale(0.95);
}

.ca-btn.copy { 
  background: var(--bg-tertiary); 
  color: var(--text-secondary); 
  border: 1px solid var(--border-light);
}

.ca-btn.share { 
  background: linear-gradient(135deg, #FEF3C7, #FDE68A); 
  color: var(--warning-color); 
  border: 1px solid rgba(245, 158, 11, 0.2);
}

/* ═══ 小贴士 - 现代化设计 ═══ */
.tips-section { 
  margin-bottom: 0; 
}

.tips-title { 
  font-size: 28rpx; 
  font-weight: var(--font-bold); 
  color: var(--text-primary); 
  margin-bottom: 16rpx; 
  display: block; 
  letter-spacing: -0.5rpx;
}

.tip-grid { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 16rpx; 
}

.tip-item {
  background: var(--bg-primary); 
  border-radius: var(--radius-lg); 
  padding: 24rpx;
  box-shadow: var(--shadow-sm); 
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
}

.tip-item:active {
  transform: scale(0.98);
  background: var(--primary-light);
}

.tip-icon { 
  font-size: 32rpx; 
  display: block; 
  margin-bottom: 8rpx; 
  text-align: center;
}

.tip-text { 
  font-size: 24rpx; 
  color: var(--text-secondary); 
  line-height: 1.5; 
  text-align: center;
  font-weight: var(--font-medium);
}

/* ═══ 历史记录 - 现代化设计 ═══ */
.history-section { 
  margin-bottom: 0; 
}

.history-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 16rpx; 
}

.history-title { 
  font-size: 28rpx; 
  font-weight: var(--font-bold); 
  color: var(--text-primary); 
  letter-spacing: -0.5rpx;
}

.history-clear { 
  font-size: 24rpx; 
  color: var(--text-muted); 
  font-weight: var(--font-medium);
  transition: all var(--transition-normal);
}

.history-clear:active {
  color: var(--danger-color);
}

.history-list {
  background: var(--bg-primary); 
  border-radius: var(--radius-lg); 
  overflow: hidden;
  box-shadow: var(--shadow-md); 
  border: 1px solid var(--border-color);
}

.history-item { 
  display: flex; 
  align-items: center; 
  padding: 24rpx; 
  border-bottom: 1px solid var(--border-light); 
  transition: all var(--transition-normal);
}

.history-item:last-child { 
  border-bottom: none; 
}

.history-item:active { 
  background: var(--primary-light); 
  transform: translateX(4rpx);
}

.history-icon { 
  font-size: 36rpx; 
  margin-right: 16rpx; 
  flex-shrink: 0; 
}

.history-info { 
  flex: 1; 
}

.history-product { 
  font-size: 28rpx; 
  font-weight: var(--font-semibold); 
  color: var(--text-primary); 
  display: block; 
  letter-spacing: -0.5rpx;
}

.history-preview { 
  font-size: 24rpx; 
  color: var(--text-muted); 
  margin-top: 6rpx; 
  display: block; 
  font-weight: var(--font-medium);
}

.history-meta { 
  display: flex; 
  align-items: center; 
  gap: 16rpx; 
  flex-shrink: 0; 
}

.history-time { 
  font-size: 22rpx; 
  color: var(--text-muted); 
  font-weight: var(--font-medium);
}

.history-del { 
  font-size: 26rpx; 
  color: var(--border-color); 
  padding: 8rpx; 
  transition: all var(--transition-normal);
}

.history-del:active {
  color: var(--danger-color);
  background: var(--danger-light);
  border-radius: var(--radius-sm);
}

/* ═══ 确认弹窗 - 现代化设计 ═══ */
.overlay {
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
  padding: 40rpx;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.confirm-modal {
  background: var(--bg-primary); 
  border-radius: var(--radius-xl); 
  padding: 48rpx;
  width: 100%; 
  max-width: 520rpx; 
  text-align: center;
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

.confirm-title { 
  font-size: 34rpx; 
  font-weight: var(--font-bold); 
  color: var(--text-primary); 
  display: block; 
  margin-bottom: 12rpx; 
  letter-spacing: -0.5rpx;
}

.confirm-desc { 
  font-size: 26rpx; 
  color: var(--text-muted); 
  display: block; 
  margin-bottom: 32rpx; 
  font-weight: var(--font-medium);
}

.confirm-actions { 
  display: flex; 
  gap: 20rpx; 
}

.confirm-btn {
  flex: 1; 
  height: 80rpx; 
  border-radius: var(--radius-lg); 
  display: flex;
  align-items: center; 
  justify-content: center; 
  font-size: 28rpx; 
  font-weight: var(--font-semibold);
  transition: all var(--transition-normal);
  border: 1px solid transparent;
}

.confirm-btn:active { 
  opacity: 0.9; 
  transform: scale(0.98);
}

.confirm-btn.cancel { 
  background: var(--bg-tertiary); 
  color: var(--text-secondary); 
  border-color: var(--border-light);
}

.confirm-btn.danger { 
  background: linear-gradient(135deg, var(--danger-color), #DC2626); 
  color: #fff; 
  box-shadow: var(--shadow-md);
}

.bottom-spacer { 
  height: 40rpx; 
}

</style>