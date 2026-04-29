<template>
  <view class="page">
    <!-- ═══ 现代化导航头部 ═══ -->
    <view class="nav-header">
      <view class="nh-left">
        <view class="nh-title-area">
          <text class="nh-title">库存管理</text>
          <text class="nh-sub">管好每一件商品</text>
        </view>
      </view>
      <view class="nh-right">
        <view class="nh-btn nh-primary" @click="showAddForm = true">
          <text class="nh-btn-icon">✍️</text>
          <text class="nh-btn-text">录入</text>
        </view>
        <view class="nh-btn nh-secondary" @click="mockScan">
          <text class="nh-btn-icon">📷</text>
          <text class="nh-btn-text">扫码</text>
        </view>
      </view>
    </view>

    <view class="app-screen">
      <!-- 搜索框 -->
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input class="search-input" v-model="searchQuery" placeholder="搜商品名 / 条码 / 分类" />
        <text v-if="searchQuery" class="search-clear" @click="clearSearch">✕</text>
      </view>

      <!-- 核心统计卡片（强化信息层级） -->
      <view class="stats-row">
        <view class="stats-card" @click="activeCategory=''">
          <text class="stats-card-num">{{ stats.total }}</text>
          <text class="stats-card-label">总库存</text>
        </view>
        <view class="stats-card value-card" @click="activeCategory=''">
          <text class="stats-card-num" style="color:#F97316;">¥{{ stats.totalValue.toFixed(0) }}</text>
          <view class="stats-unit">库存总值</view>
        </view>
        <view class="stats-card danger-card" @click="activeCategory=''; searchQuery=''">
          <text class="stats-card-num" :style="{color: stats.lowStock > 0 ? '#EF4444' : '#10B981'}">{{ stats.lowStock }}</text>
          <view class="stats-unit">库存不足</view>
        </view>
      </view>

      <!-- 分类筛选 -->
      <view class="category-bar-wrap">
        <scroll-view class="category-bar" scroll-x show-scrollbar="false">
          <view class="category-chip" :class="{ active: activeCategory === '' }" @click="activeCategory = ''">全部</view>
          <view v-for="cat in categories" :key="cat" class="category-chip" :class="{ active: activeCategory === cat }" @click="activeCategory = cat">{{ cat }}</view>
        </scroll-view>
      </view>

      <!-- 库存不足联动红点提示 -->
      <view v-if="stats.lowStock > 0" class="low-stock-hint" @click="activeCategory=''; searchQuery=''">
        <text class="ls-hint-icon">🔴</text>
        <text class="ls-hint-text">{{ stats.lowStock }}件商品库存不足，点击查看</text>
      </view>

      <!-- 商品列表 -->
      <view class="list-header">
        <view>
          <text class="list-title">📋 商品列表</text>
          <text class="list-count" v-if="filteredItems.length > 0">共 {{ filteredItems.length }} 件</text>
        </view>
        <text class="sort-btn" @click="sortOrder = sortOrder === 'qty' ? 'name' : 'qty'">
          {{ sortOrder === 'qty' ? '按名称' : '按库存' }}
        </text>
      </view>

      <view class="empty-state" v-if="filteredItems.length === 0 && !loading">
        <text class="empty-icon">📦</text>
        <text class="empty-text">{{ searchQuery ? '未找到匹配商品' : '还没有库存商品' }}</text>
        <text class="empty-hint" v-if="!searchQuery" @click="showAddForm = true">点击这里添加第一件商品</text>
      </view>

      <view class="item-list" v-if="filteredItems.length > 0">
        <view v-for="item in filteredItems" :key="item.id" class="item-card" :class="{ 'low-stock': (item.quantity || 0) <= 5 }" @click="editItem(item)">
          <view class="item-icon-wrap">
            <text class="item-icon-emoji">{{ item.hasBarcode ? '📷' : '✍️' }}</text>
          </view>
          <view class="item-info">
            <view class="item-name-row">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-cat-chip">{{ item.category }}</text>
            </view>
            <view class="item-detail-row">
              <text class="item-qty" :class="{ 'low-stock': item.quantity <= 5 }">{{ item.quantity }}{{ item.unit }}</text>
              <text class="item-price-chip">¥{{ (item.price || 0).toFixed(2) }}/{{ item.unit }}</text>
              <text v-if="item.quantity <= 5" class="warning-tag">⚠️ 不足</text>
            </view>
            <text class="item-note" v-if="item.note">{{ item.note }}</text>
          </view>
          <view class="item-right">
            <view class="qty-adjust">
              <view class="adj-btn minus" @click.stop="adjustQty(item, -1)">−</view>
              <text class="adj-value">{{ item.quantity }}</text>
              <view class="adj-btn plus" @click.stop="adjustQty(item, 1)">+</view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加/编辑弹窗 -->
    <view class="overlay" v-if="showAddForm" @click="closeForm">
      <view class="modal" @click.stop>
        <view class="modal-handle"></view>
        <view class="modal-header">
          <text class="modal-title">{{ editingItem ? '✏️ 编辑商品' : '➕ 手动录入' }}</text>
          <text class="modal-close" @click="closeForm">✕</text>
        </view>
        <view class="form-body">
          <view class="field required">
            <text class="field-label">商品名</text>
            <input class="field-input" v-model="form.name" placeholder="输入商品名称" :class="{ error: formAddErrors.name }" />
            <text v-if="formAddErrors.name" class="field-err">{{ formAddErrors.name }}</text>
          </view>
          <view class="field-row">
            <view class="field flex-1">
              <text class="field-label">分类</text>
              <view class="field-picker" @click="showFormCat = !showFormCat">
                <text>{{ form.category || '选择' }}</text>
                <text>▼</text>
              </view>
              <view v-if="showFormCat" class="inline-picker">
                <view v-for="c in categories" :key="c" class="ip-item" @click="form.category=c; showFormCat=false">{{ c }}</view>
              </view>
            </view>
            <view class="field flex-1">
              <text class="field-label">单位</text>
              <view class="field-picker" @click="showFormUnit = !showFormUnit">
                <text>{{ form.unit || '个' }}</text>
                <text>▼</text>
              </view>
              <view v-if="showFormUnit" class="inline-picker">
                <view v-for="u in units" :key="u" class="ip-item" @click="form.unit=u; showFormUnit=false">{{ u }}</view>
              </view>
            </view>
          </view>
          <view class="field-row">
            <view class="field flex-1 required">
              <text class="field-label">数量</text>
              <input class="field-input" v-model="form.quantity" placeholder="0" type="number" :class="{ error: formAddErrors.quantity }" />
              <text v-if="formAddErrors.quantity" class="field-err">{{ formAddErrors.quantity }}</text>
            </view>
            <view class="field flex-1">
              <text class="field-label">售价 (¥)</text>
              <input class="field-input" v-model="form.price" placeholder="0.00" type="number" />
            </view>
          </view>
          <view class="field-row">
            <view class="field flex-1">
              <text class="field-label">进价 (¥)</text>
              <input class="field-input" v-model="form.costPrice" placeholder="0.00" type="number" />
            </view>
            <view class="field flex-1">
              <text class="field-label">条码</text>
              <input class="field-input" v-model="form.barcode" placeholder="选填" />
            </view>
          </view>
          <view class="field">
            <text class="field-label">备注</text>
            <input class="field-input" v-model="form.note" placeholder="如：产地、保质期等" />
          </view>
        </view>
        <view class="form-footer">
          <view v-if="editingItem" class="form-btn danger" @click="deleteItem">🗑️ 删除</view>
          <view class="form-btn primary" @click="saveItem">{{ editingItem ? '✅ 保存修改' : '➕ 添加商品' }}</view>
        </view>
      </view>
    </view>

    <view style="height:150rpx"></view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, adjustInventoryQuantity, getInventoryStats, getInventoryCategories, searchInventory, loadSampleData } from '@/stores/db.js'
import { showToast } from '@/utils/bridge.js'

const route = useRoute()
const searchQuery = ref('')
const activeCategory = ref('')
const loading = ref(false)
const showAddForm = ref(false)
const editingItem = ref(null)
const showFormCat = ref(false)
const showFormUnit = ref(false)
const sortOrder = ref('name')

const form = ref({ name: '', category: '未分类', quantity: '', unit: '个', price: '', costPrice: '', barcode: '', note: '' })
const formAddErrors = ref({ name: '', quantity: '' })
const categories = ref([])
const units = ['个', '斤', '箱', '瓶', '袋', '包', '盒', '条', '桶', '件', '双', '只', 'kg']
const stats = ref({ total: 0, totalValue: 0, lowStock: 0 })
const allItems = ref([])

onMounted(() => {
  loadSampleData(); refreshData()
  if (route.query.action === 'add') showAddForm.value = true
})

function refreshData() {
  allItems.value = getInventory()
  categories.value = getInventoryCategories()
  stats.value = getInventoryStats()
}

const filteredItems = computed(() => {
  let items = allItems.value
  if (searchQuery.value.trim()) items = searchInventory(searchQuery.value)
  if (activeCategory.value) items = items.filter(i => i.category === activeCategory.value)
  if (sortOrder.value === 'qty') items = [...items].sort((a,b) => (a.quantity || 0) - (b.quantity || 0))
  // Low stock items always on top
  return [...items].sort((a,b) => {
    const aLow = (a.quantity || 0) <= 5 ? 0 : 1
    const bLow = (b.quantity || 0) <= 5 ? 0 : 1
    return aLow - bLow
  })
})

function clearSearch() { searchQuery.value = '' }
function scrollToTop() { /* already on page */ }
function goHome() { routerPush('/home') }
function goMembers() { routerPush('/members') }
function goCopywrite() { routerPush('/copywriting') }

function routerPush(p) {
  try { useRouter().push(p) } catch(e) {}
}

function mockScan() {
  showToast('📷 扫码识别中…')
  setTimeout(() => {
    showAddForm.value = true
    form.value.name = '扫码商品'
  }, 800)
}

function editItem(item) {
  editingItem.value = item
  form.value = {
    name: item.name || '', category: item.category || categories.value[0] || '未分类',
    quantity: String(item.quantity || 0), unit: item.unit || '个',
    price: String(item.price || 0), costPrice: String(item.costPrice || 0),
    barcode: item.barcode || '', note: item.note || ''
  }
  showAddForm.value = true
}

function adjustQty(item, delta) {
  const result = adjustInventoryQuantity(item.id, delta)
  if (result) { refreshData(); showToast(`${delta > 0 ? '➕' : '➖'} 库存已更新`) }
}

function validateForm() {
  const errs = { name: '', quantity: '' }
  if (!form.value.name.trim()) errs.name = '请输入商品名'
  const qty = parseInt(form.value.quantity)
  if (!form.value.quantity || isNaN(qty) || qty < 0) errs.quantity = '请输入有效数量'
  formAddErrors.value = errs
  return !errs.name && !errs.quantity
}

function saveItem() {
  if (!validateForm()) { showToast('请修正表单错误'); return }
  const data = {
    name: form.value.name.trim(), category: form.value.category.trim() || '通用',
    quantity: parseInt(form.value.quantity) || 0, unit: form.value.unit.trim() || '个',
    price: parseFloat(form.value.price) || 0, costPrice: parseFloat(form.value.costPrice) || 0,
    barcode: form.value.barcode.trim(), note: form.value.note.trim()
  }
  if (editingItem.value) { updateInventoryItem(editingItem.value.id, data); showToast('✅ 已更新') }
  else { addInventoryItem(data); showToast('✅ 已添加') }
  closeForm(); refreshData()
}

function deleteItem() {
  if (!editingItem.value) return
  deleteInventoryItem(editingItem.value.id)
  showToast('已删除'); closeForm(); refreshData()
}

function closeForm() {
  showAddForm.value = false; editingItem.value = null
  form.value = { name: '', category: '未分类', quantity: '', unit: '个', price: '', costPrice: '', barcode: '', note: '' }
  formAddErrors.value = { name: '', quantity: '' }
  showFormCat.value = false; showFormUnit.value = false
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

.nh-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.nh-btn {
  padding: 12rpx 24rpx;
  border-radius: var(--radius-full);
  font-size: 24rpx;
  font-weight: var(--font-semibold);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 6rpx;
  border: 1px solid transparent;
}

.nh-btn:active {
  opacity: 0.9;
  transform: scale(0.95);
}

.nh-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: #fff;
  box-shadow: var(--shadow-md);
}

.nh-secondary {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-color: var(--border-light);
}

/* ═══ 内容区域 - 现代化设计 ═══ */
.app-screen {
  padding: 0 32rpx 32rpx;
}

/* ═══ 搜索框 - 现代化设计 ═══ */
.search-box {
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border-radius: var(--radius-full);
  padding: 0 28rpx;
  height: 80rpx;
  margin-bottom: 24rpx;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.search-box:focus-within {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-md);
}

.search-icon {
  font-size: 28rpx;
  margin-right: 16rpx;
  color: var(--text-muted);
}

.search-input {
  flex: 1;
  height: 100%;
  border: none;
  font-size: 28rpx;
  background: transparent;
  color: var(--text-primary);
  font-weight: var(--font-medium);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-clear {
  font-size: 24rpx;
  color: var(--text-muted);
  padding: 8rpx;
  transition: all var(--transition-normal);
}

.search-clear:active {
  color: var(--primary-color);
  transform: scale(0.9);
}

/* ═══ 统计卡片 - 现代化设计 ═══ */
.stats-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.stats-card {
  flex: 1;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 32rpx 16rpx;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
}

.stats-card:active {
  transform: scale(0.96);
  box-shadow: var(--shadow-xl);
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, var(--secondary-color), var(--primary-color));
}

.stats-card-num {
  display: block;
  font-size: 44rpx;
  font-weight: var(--font-extrabold);
  color: var(--primary-color);
  margin-bottom: 8rpx;
  letter-spacing: -1rpx;
}

.stats-unit {
  font-size: 22rpx;
  color: var(--text-muted);
  font-weight: var(--font-medium);
}

.stats-card-label {
  font-size: 22rpx;
  color: var(--text-muted);
  font-weight: var(--font-medium);
}

/* ═══ 库存不足提示 - 现代化设计 ═══ */
.low-stock-hint {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: var(--danger-light);
  border-radius: var(--radius-lg);
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
  border-left: 6rpx solid var(--danger-color);
  transition: all var(--transition-normal);
}

.low-stock-hint:active {
  transform: scale(0.98);
  background: var(--danger-light-hover);
}

.ls-hint-icon { font-size: 24rpx; }
.ls-hint-text { font-size: 24rpx; color: var(--danger-dark); font-weight: var(--font-semibold); }

/* ═══ 分类筛选 - 现代化设计 ═══ */
.category-bar-wrap { margin-bottom: 24rpx; }
.category-bar { white-space: nowrap; padding: 8rpx 0; }
.category-chip {
  display: inline-block;
  padding: 16rpx 36rpx;
  margin-right: 16rpx;
  border-radius: var(--radius-full);
  font-size: 26rpx;
  color: var(--text-secondary);
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
  font-weight: var(--font-medium);
}

.category-chip:active { transform: scale(0.95); }
.category-chip.active {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: #fff;
  font-weight: var(--font-semibold);
  border-color: transparent;
  box-shadow: var(--shadow-md);
}

/* ═══ 列表头部 - 现代化设计 ═══ */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.list-title {
  font-size: 30rpx;
  font-weight: var(--font-bold);
  color: var(--text-primary);
  letter-spacing: -0.5rpx;
}

.list-count {
  font-size: 22rpx;
  color: var(--text-muted);
  margin-top: 4rpx;
  display: block;
  font-weight: var(--font-medium);
}

.sort-btn {
  font-size: 24rpx;
  color: var(--primary-color);
  font-weight: var(--font-semibold);
  padding: 12rpx 16rpx;
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
}

.sort-btn:active {
  background: var(--primary-light);
  transform: scale(0.95);
}

/* ═══ 空状态 - 现代化设计 ═══ */
.empty-state {
  text-align: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 88rpx;
  display: block;
  margin-bottom: 24rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 30rpx;
  color: var(--text-muted);
  margin-bottom: 12rpx;
  font-weight: var(--font-medium);
}

.empty-hint {
  font-size: 26rpx;
  color: var(--primary-color);
  font-weight: var(--font-semibold);
  transition: all var(--transition-normal);
}

.empty-hint:active {
  color: var(--primary-dark);
  transform: scale(0.95);
}

/* ═══ 商品列表 - 现代化设计 ═══ */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.item-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 28rpx;
  display: flex;
  align-items: center;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.item-card:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-xl);
}

.item-card.low-stock {
  background: var(--danger-light);
  border-color: var(--danger-light-border);
}

.item-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 24rpx;
  bottom: 24rpx;
  width: 6rpx;
  border-radius: 3rpx;
  background: linear-gradient(180deg, var(--primary-color), var(--primary-dark));
}

.item-card.low-stock::before {
  background: linear-gradient(180deg, var(--danger-color), var(--danger-dark));
}

.item-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--primary-light), var(--primary-light-hover));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
  transition: all var(--transition-normal);
}

.item-card:active .item-icon-wrap {
  transform: scale(1.05);
}

.item-icon-emoji { font-size: 36rpx; }
.item-info { flex: 1; }

.item-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.item-name {
  font-size: 30rpx;
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  letter-spacing: -0.5rpx;
}

.item-cat-chip {
  font-size: 18rpx;
  color: var(--primary-color);
  background: var(--primary-light);
  padding: 6rpx 16rpx;
  border-radius: var(--radius-full);
  font-weight: var(--font-medium);
}

.item-detail-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.item-qty {
  font-size: 26rpx;
  color: var(--text-secondary);
  font-weight: var(--font-semibold);
}

.item-qty.low-stock {
  color: var(--danger-color);
  font-weight: var(--font-bold);
}

.item-price-chip {
  font-size: 22rpx;
  color: var(--primary-color);
  font-weight: var(--font-medium);
}

.warning-tag {
  font-size: 18rpx;
  color: var(--danger-color);
  background: var(--danger-light);
  padding: 4rpx 12rpx;
  border-radius: var(--radius-full);
  font-weight: var(--font-semibold);
}

.item-note {
  font-size: 22rpx;
  color: var(--text-muted);
  margin-top: 6rpx;
  display: block;
  font-weight: var(--font-medium);
}

.item-right {
  margin-left: 16rpx;
  flex-shrink: 0;
}

.qty-adjust {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  padding: 8rpx 12rpx;
  border: 1px solid var(--border-light);
}

.adj-btn {
  min-width: 48rpx;
  min-height: 48rpx;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: var(--font-bold);
  transition: all var(--transition-normal);
}

.adj-btn.plus {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  box-shadow: var(--shadow-sm);
}

.adj-btn.minus {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
}

.adj-btn:active {
  transform: scale(0.85);
}

.adj-value {
  font-size: 26rpx;
  font-weight: var(--font-bold);
  color: var(--text-primary);
  min-width: 48rpx;
  text-align: center;
}

/* ═══ 弹窗 - 现代化设计 ═══ */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-handle {
  width: 48rpx;
  height: 4rpx;
  background: var(--border-color);
  border-radius: 4rpx;
  margin: 16rpx auto 8rpx;
}

.modal {
  background: var(--bg-primary);
  border-radius: 32px 32px 0 0;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 0 32rpx 40rpx;
  animation: slideUp 0.25s ease-out;
  box-shadow: var(--shadow-2xl);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1px solid var(--border-light);
}

.modal-title {
  font-size: 34rpx;
  font-weight: var(--font-bold);
  color: var(--text-primary);
  letter-spacing: -0.5rpx;
}

.modal-close {
  font-size: 32rpx;
  color: var(--text-muted);
  padding: 8rpx;
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
}

.modal-close:active {
  background: var(--bg-tertiary);
  transform: scale(0.9);
}

/* ═══ 表单 - 现代化设计 ═══ */
.form-body {
  padding: 24rpx 0;
}

.field {
  margin-bottom: 24rpx;
}

.field-label {
  display: block;
  font-size: 24rpx;
  color: var(--text-secondary);
  margin-bottom: 8rpx;
  font-weight: var(--font-semibold);
}

.field.required .field-label::after {
  content: ' *';
  color: var(--danger-color);
}

.field-input {
  width: 100%;
  height: 80rpx;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 0 24rpx;
  font-size: 28rpx;
  background: var(--bg-tertiary);
  transition: all var(--transition-normal);
  font-weight: var(--font-medium);
}

.field-input:focus {
  border-color: var(--primary-color);
  background: var(--bg-primary);
  box-shadow: var(--shadow-sm);
  outline: none;
}

.field-input.error {
  border-color: var(--danger-color);
  background: var(--danger-light);
}

.field-err {
  font-size: 20rpx;
  color: var(--danger-color);
  margin-top: 6rpx;
  display: block;
  font-weight: var(--font-medium);
}

.field-picker {
  height: 80rpx;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-tertiary);
  font-size: 28rpx;
  transition: all var(--transition-normal);
  font-weight: var(--font-medium);
}

.field-picker:active {
  background: var(--bg-secondary);
}

.field-row {
  display: flex;
  gap: 16rpx;
}

.flex-1 {
  flex: 1;
}

.inline-picker {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  margin-top: 8rpx;
  max-height: 280rpx;
  overflow-y: auto;
  box-shadow: var(--shadow-md);
}

.ip-item {
  padding: 20rpx 24rpx;
  font-size: 26rpx;
  border-bottom: 1px solid var(--border-light);
  transition: all var(--transition-normal);
  font-weight: var(--font-medium);
}

.ip-item:active {
  background: var(--primary-light);
}

.ip-item:last-child {
  border-bottom: none;
}

.form-footer {
  display: flex;
  gap: 16rpx;
  padding-top: 16rpx;
}

.form-btn {
  flex: 1;
  height: 84rpx;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: var(--font-semibold);
  transition: all var(--transition-normal);
}

.form-btn:active {
  opacity: 0.9;
  transform: scale(0.98);
}

.form-btn.primary {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: #fff;
  box-shadow: var(--shadow-md);
}

.form-btn.danger {
  background: var(--danger-light);
  color: var(--danger-color);
  border: 1px solid var(--danger-light-border);
}

/* ═══ 底部Tab - 现代化设计 ═══ */
.bottom-tab {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: space-around;
  padding: 16rpx 32rpx 32rpx;
  position: sticky;
  bottom: 0;
}

.tab-item {
  text-align: center;
  font-size: 22rpx;
  color: var(--text-muted);
  font-weight: var(--font-medium);
  transition: all var(--transition-normal);
}

.tab-item:active {
  transform: scale(0.92);
}

.tab-item.active {
  color: var(--primary-color);
}

.tab-icon {
  font-size: 40rpx;
  display: block;
  margin-bottom: 4rpx;
}

.tab-label {
  font-size: 20rpx;
}
</style>