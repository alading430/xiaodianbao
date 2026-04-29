<template>
  <view class="page">
    <view class="nav-header">
      <view class="logo-area">
        <text class="nav-title">👥 记会员</text>
      </view>
      <view class="nav-right">
        <text class="nav-sub" @click="showAddMember = true">➕ 添加</text>
      </view>
    </view>

    <view class="app-screen">
      <!-- 统计卡片 -->
      <view class="stats-row">
        <view class="stats-card">
          <text class="stats-card-num">{{ stats.total }}</text>
          <text class="stats-card-label">总会员</text>
        </view>
        <view class="stats-card">
          <text class="stats-card-num" style="color:#F97316;">¥{{ stats.todayRevenue.toFixed(0) }}</text>
          <text class="stats-card-label">今日流水</text>
        </view>
        <view class="stats-card">
          <text class="stats-card-num" style="color:#F97316;">{{ stats.todayVisits }}</text>
          <text class="stats-card-label">今日消费</text>
        </view>
      </view>

      <!-- 双通道快速入口 -->
      <view class="dual-channel-row">
        <view class="dual-card scan-card" @click="showScanGuide = true">
          <text class="dual-icon">📱</text>
          <text class="dual-primary">扫微信识别</text>
          <text class="dual-sub">扫码自动匹配</text>
        </view>
        <view class="dual-card phone-card" @click="showPhoneInput = true">
          <text class="dual-icon">📞</text>
          <text class="dual-primary">输手机号</text>
          <text class="dual-sub">查询快捷积分</text>
        </view>
      </view>

      <!-- 次级操作 -->
      <view class="sub-action-row">
        <view class="sub-action-btn primary-action" @click="showAddMember = true">➕ 添加会员</view>
        <view class="sub-action-btn primary-action" @click="showRecordModal = true">💰 记消费</view>
      </view>

      <!-- 搜索 -->
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input class="search-input" v-model="searchQuery" placeholder="搜会员名/电话" />
        <text v-if="searchQuery" class="search-clear" @click="searchQuery = ''">✕</text>
      </view>

      <!-- 会员列表 -->
      <view class="list-header">
        <text class="list-title">👥 会员列表</text>
        <text class="list-count">共 {{ filteredMembers.length }} 人</text>
      </view>

      <view class="empty-state" v-if="filteredMembers.length === 0">
        <text class="empty-icon">👥</text>
        <text class="empty-text">{{ searchQuery ? '未找到匹配会员' : '还没有会员' }}</text>
      </view>

      <view class="member-list" v-if="filteredMembers.length > 0">
        <view v-for="member in filteredMembers" :key="member.id" class="member-card" @click="showMemberDetail(member)">
          <view class="member-avatar">
            <text class="avatar-text">{{ member.name.charAt(0) }}</text>
          </view>
          <view class="member-info">
            <view class="member-name-row">
              <text class="member-name">{{ member.name }}</text>
              <text class="member-phone">{{ member.phone || '未绑定' }}</text>
            </view>
            <view class="member-tags">
              <text class="member-tag tag-points">⭐ {{ member.points || 0 }}分</text>
              <text class="member-tag tag-visits">{{ member.visitCount || 0 }}次</text>
              <text class="member-tag tag-consumed">¥{{ (member.totalConsumption || 0).toFixed(0) }}</text>
            </view>
          </view>
          <view class="member-arrow">›</view>
        </view>
      </view>
    </view>

    <!-- 添加会员弹窗 -->
    <view class="overlay" v-if="showAddMember" @click="showAddMember = false">
      <view class="modal" @click.stop>
        <view class="modal-handle"></view>
        <text class="modal-title">➕ 添加会员</text>
        <view class="form-body">
          <view class="field">
            <text class="field-label">姓名 <text style="color:#EF4444;">*</text></text>
            <input class="field-input" v-model="newMember.name" placeholder="顾客姓名" />
          </view>
          <view class="field">
            <text class="field-label">手机号</text>
            <input class="field-input" v-model="newMember.phone" placeholder="手机号（选填）" type="number" maxlength="11" />
          </view>
          <view class="field">
            <text class="field-label">备注</text>
            <input class="field-input" v-model="newMember.note" placeholder="如：喜好、住址等" />
          </view>
          <view class="form-btn primary" @click="addMember">✅ 保存会员</view>
        </view>
      </view>
    </view>

    <!-- 记消费弹窗 -->
    <view class="overlay" v-if="showRecordModal" @click="showRecordModal = false">
      <view class="modal" @click.stop>
        <view class="modal-handle"></view>
        <text class="modal-title">💰 记消费</text>
        <view class="form-body">
          <view class="field">
            <text class="field-label">选择会员</text>
            <view class="member-select" @click="showMemberPicker = !showMemberPicker">
              <text :class="{ placeholder: !selectedMember }">{{ selectedMember ? selectedMember.name + ' ' + (selectedMember.phone||'') : '点击选择会员' }}</text>
              <text>{{ showMemberPicker ? '▲' : '▼' }}</text>
            </view>
            <view v-if="showMemberPicker" class="member-picker-list">
              <view v-for="m in allMembers" :key="m.id" class="picker-item" @click="selectMember(m)">
                <text class="pi-name">{{ m.name }}</text>
                <text class="pi-phone">{{ m.phone }}</text>
              </view>
            </view>
          </view>
          <view class="field">
            <text class="field-label">消费金额 <text style="color:#EF4444;">*</text></text>
            <view class="amount-input-wrap">
              <text class="amount-currency">¥</text>
              <input class="amount-input" v-model="recordAmount" placeholder="0.00" type="number" />
            </view>
          </view>
          <view class="field">
            <text class="field-label">备注</text>
            <input class="field-input" v-model="recordNote" placeholder="买了什么？" />
          </view>
          <view class="form-btn primary" @click="addConsumptionRecord">✅ 保存记录</view>
        </view>
      </view>
    </view>

    <!-- 会员详情弹窗 -->
    <view class="overlay" v-if="detailMember" @click="detailMember = null">
      <view class="modal detail-modal" @click.stop>
        <view class="modal-handle"></view>
        <view class="detail-header">
          <view class="detail-avatar"><text class="detail-avatar-text">{{ detailMember.name.charAt(0) }}</text></view>
          <view class="detail-name-row">
            <text class="detail-name">{{ detailMember.name }}</text>
            <text class="detail-phone">{{ detailMember.phone || '未绑定手机' }}</text>
          </view>
        </view>
        <view class="detail-stats">
          <view class="ds-item"><text class="ds-num">{{ detailMember.points || 0 }}</text><text class="ds-label">积分</text></view>
          <view class="ds-item"><text class="ds-num">{{ detailMember.visitCount || 0 }}</text><text class="ds-label">消费次数</text></view>
          <view class="ds-item"><text class="ds-num">¥{{ (detailMember.totalConsumption || 0).toFixed(0) }}</text><text class="ds-label">累计消费</text></view>
        </view>
        <view class="detail-actions">
          <view class="da-btn" @click="recordForDetailMember"><text>💰 记消费</text></view>
          <view class="da-btn danger" @click="deleteMemberConfirm"><text>🗑️ 删除</text></view>
        </view>
        <view class="detail-section">
          <text class="detail-section-title">消费记录</text>
          <view v-if="memberConsumptions.length === 0" class="ds-empty">暂无消费记录</view>
          <view v-for="rec in memberConsumptions" :key="rec.id" class="ds-record">
            <view class="ds-record-left">
              <text class="ds-record-amount">¥{{ rec.amount.toFixed(0) }}</text>
              <text v-if="rec.note" class="ds-record-note">{{ rec.note }}</text>
            </view>
            <text class="ds-record-date">{{ rec.date }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 扫微信引导弹窗 -->
    <view class="overlay" v-if="showScanGuide" @click="showScanGuide = false">
      <view class="modal scan-modal" @click.stop>
        <view class="modal-handle"></view>
        <view class="scan-icon-big">📱</view>
        <text class="modal-title">扫码识别会员</text>
        <view class="modal-desc">顾客出示微信二维码自动识别</view>
        <view class="scan-frame">
          <view class="scan-corner tl"></view><view class="scan-corner tr"></view>
          <view class="scan-corner bl"></view><view class="scan-corner br"></view>
          <text class="scan-icon-center">🔲</text>
          <view class="scan-line"></view>
        </view>
        <view class="scan-mock-btn" @click="handleMockScan">📷 模拟扫码</view>
        <view class="scan-footer-note">扫码后自动匹配会员档案</view>
      </view>
    </view>

    <!-- 输手机号弹窗 -->
    <view class="overlay" v-if="showPhoneInput" @click="showPhoneInput = false">
      <view class="modal" @click.stop>
        <view class="modal-handle"></view>
        <text class="modal-title">📞 输入手机号</text>
        <view class="form-body">
          <view class="field">
            <input class="field-input phone-input" v-model="phoneSearch" placeholder="输入11位手机号" type="number" maxlength="11" @confirm="searchByPhone" />
          </view>
          <view class="form-btn primary" @click="searchByPhone">🔍 查询会员</view>
        </view>
        <view v-if="phoneResult !== null" class="phone-result">
          <view v-if="phoneResult" class="phone-result-card">
            <view class="phone-result-avatar"><text>{{ phoneResult.name.charAt(0) }}</text></view>
            <view class="phone-result-info">
              <text class="phone-result-name">{{ phoneResult.name }}</text>
              <text class="phone-result-phone">{{ phoneResult.phone }}</text>
            </view>
            <view class="phone-result-btn" @click="recordForMember(phoneResult)">记消费</view>
          </view>
          <view v-else class="phone-not-found">
            <text class="pnf-icon">🔍</text>
            <text class="pnf-text">未找到该手机号</text>
            <view class="form-btn primary" @click="showAddMember = true; showPhoneInput = false">➕ 创建新会员</view>
          </view>
        </view>
      </view>
    </view>

    <view style="height:150rpx"></view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  getMembers, addMember as dbAddMember, deleteMember,
  getMemberStats, getMemberConsumptions, addConsumption,
  searchMembers, loadSampleData
} from '@/stores/db.js'
import { showToast } from '@/utils/bridge.js'

const searchQuery = ref('')
const showAddMember = ref(false)
const showRecordModal = ref(false)
const showMemberPicker = ref(false)
const selectedMember = ref(null)
const recordAmount = ref('')
const recordNote = ref('')
const detailMember = ref(null)
const memberConsumptions = ref([])
const newMember = ref({ name: '', phone: '', note: '' })

const showScanGuide = ref(false)
const showPhoneInput = ref(false)
const phoneSearch = ref('')
const phoneResult = ref(null)

const allMembers = ref([])
const stats = ref({ total: 0, todayVisits: 0, todayRevenue: 0 })

onMounted(() => { loadSampleData(); refreshData() })

function refreshData() { allMembers.value = getMembers(); stats.value = getMemberStats() }

const filteredMembers = computed(() => searchQuery.value.trim() ? searchMembers(searchQuery.value) : allMembers.value)

function addMember() {
  if (!newMember.value.name.trim()) { showToast('请输入姓名'); return }
  const result = dbAddMember({ name: newMember.value.name.trim(), phone: newMember.value.phone.trim(), note: newMember.value.note.trim() })
  showToast(result.duplicate ? '⚠️ 该手机号已存在' : '✅ 会员已添加')
  newMember.value = { name: '', phone: '', note: '' }
  showAddMember.value = false; refreshData()
}

function selectMember(m) { selectedMember.value = m; showMemberPicker.value = false }

function addConsumptionRecord() {
  if (!selectedMember.value) { showToast('请选择会员'); return }
  const amount = parseFloat(recordAmount.value)
  if (!amount || amount <= 0) { showToast('请输入有效金额'); return }
  addConsumption(selectedMember.value.id, amount, recordNote.value.trim())
  showToast(`✅ ${selectedMember.value.name} 消费 ¥${amount.toFixed(0)}`)
  selectedMember.value = null; recordAmount.value = ''; recordNote.value = ''
  showRecordModal.value = false; refreshData()
}

function showMemberDetail(member) { detailMember.value = member; memberConsumptions.value = getMemberConsumptions(member.id) }
function deleteMemberConfirm() { if (!detailMember.value) return; deleteMember(detailMember.value.id); showToast('已删除'); detailMember.value = null; refreshData() }
function recordForDetailMember() { const m = detailMember.value; detailMember.value = null; selectMember(m); showRecordModal.value = true }

function handleMockScan() {
  const members = allMembers.value
  if (members.length === 0) { showToast('还没有会员'); return }
  const picked = members[Math.floor(Math.random() * members.length)]
  showScanGuide.value = false; showToast(`✅ 识别到：${picked.name}`)
  selectMember(picked); showRecordModal.value = true
}

function searchByPhone() {
  const phone = phoneSearch.value.trim()
  if (!phone) { showToast('请输入手机号'); return }
  const found = allMembers.value.find(m => m.phone && m.phone.includes(phone))
  phoneResult.value = found || false
}

function recordForMember(member) { showPhoneInput.value = false; selectMember(member); showRecordModal.value = true }
function goHome() { try { useRouter().push('/home') } catch(e) {} }
function goInventory() { try { useRouter().push('/inventory') } catch(e) {} }
function scrollToTop() {}
function goCopywrite() { try { useRouter().push('/copywriting') } catch(e) {} }
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
  background: var(--bg-primary);
  padding: 16rpx 32rpx 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-light);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.nav-title {
  font-size: 36rpx;
  font-weight: var(--font-bold);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  letter-spacing: -0.5rpx;
}

.nav-sub {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: var(--text-white); 
  padding: 12rpx 28rpx; 
  border-radius: var(--radius-full); 
  font-size: 24rpx; 
  font-weight: var(--font-semibold);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.nav-sub:active { 
  transform: scale(0.95);
  box-shadow: var(--shadow-lg);
}

.app-screen { 
  padding: 24rpx 32rpx 40rpx; 
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
  padding: 28rpx 12rpx;
  text-align: center; 
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
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

.stats-card:active { 
  transform: scale(0.96); 
  box-shadow: var(--shadow-xl);
}

.stats-card-num { 
  display: block; 
  font-size: 40rpx; 
  font-weight: var(--font-black); 
  color: var(--primary-color); 
  margin-bottom: 6rpx; 
}

.stats-card-label { 
  font-size: 22rpx; 
  color: var(--text-muted); 
  font-weight: var(--font-medium); 
}

/* ═══ 双通道快速入口 - 现代化设计 ═══ */
.dual-channel-row { 
  display: flex; 
  gap: 16rpx; 
  margin-bottom: 20rpx; 
}

.dual-card {
  flex: 1; 
  background: var(--bg-primary);
  border-radius: var(--radius-lg); 
  padding: 32rpx 20rpx;
  display: flex; 
  flex-direction: column; 
  align-items: center;
  box-shadow: var(--shadow-lg); 
  border: 1px solid var(--border-color); 
  transition: all var(--transition-normal); 
  position: relative;
  overflow: hidden;
}

.dual-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, var(--secondary-color), var(--primary-color));
}

.dual-card:active { 
  transform: scale(0.96); 
  box-shadow: var(--shadow-xl);
}

.dual-card.scan-card { 
  background: linear-gradient(135deg, var(--primary-light), var(--secondary-light)); 
  border-color: var(--primary-light); 
}

.dual-card.phone-card { 
  background: linear-gradient(135deg, var(--secondary-light), var(--accent-light)); 
  border-color: var(--secondary-light); 
}

.dual-icon { 
  font-size: 40rpx; 
  margin-bottom: 8rpx; 
  filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.1));
}

.dual-primary { 
  font-size: 26rpx; 
  font-weight: var(--font-semibold); 
  color: var(--text-primary); 
  letter-spacing: -0.5rpx;
}

.dual-sub { 
  font-size: 20rpx; 
  color: var(--text-muted); 
  margin-top: 4rpx; 
  font-weight: var(--font-medium);
}

/* ═══ 次级操作 - 现代化设计 ═══ */
.sub-action-row { 
  display: flex; 
  gap: 16rpx; 
  margin-bottom: 24rpx; 
}

.sub-action-btn {
  flex: 1; 
  height: 72rpx; 
  border-radius: var(--radius-full); 
  display: flex;
  align-items: center; 
  justify-content: center; 
  font-size: 24rpx; 
  font-weight: var(--font-semibold);
  background: var(--bg-primary); 
  color: var(--primary-color); 
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.sub-action-btn:active { 
  background: var(--bg-secondary); 
  transform: scale(0.96); 
}

.sub-action-btn.primary-action {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark)); 
  color: var(--text-white); 
  border: none;
  box-shadow: var(--shadow-md);
}

.sub-action-btn.primary-action:active { 
  transform: scale(0.96); 
  box-shadow: var(--shadow-lg);
}

/* ═══ 搜索框 - 现代化设计 ═══ */
.search-box {
  display: flex; 
  align-items: center; 
  background: var(--bg-primary); 
  border-radius: var(--radius-full);
  padding: 0 24rpx; 
  height: 80rpx; 
  margin-bottom: 20rpx;
  border: 1px solid var(--border-color); 
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.search-box:focus-within {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-lg);
}

.search-icon { 
  font-size: 26rpx; 
  margin-right: 16rpx; 
  color: var(--text-muted);
}

.search-input { 
  flex: 1; 
  height: 100%; 
  border: none; 
  font-size: 28rpx; 
  background: transparent; 
  font-weight: var(--font-medium);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-clear { 
  font-size: 26rpx; 
  color: var(--text-muted); 
  padding: 8rpx; 
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
}

.search-clear:active {
  background: var(--bg-tertiary);
  transform: scale(0.9);
}

/* ═══ 列表头部 - 现代化设计 ═══ */
.list-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 16rpx; 
}

.list-title { 
  font-size: 30rpx; 
  font-weight: var(--font-bold); 
  color: var(--text-primary); 
  letter-spacing: -0.5rpx;
}

.list-count { 
  font-size: 24rpx; 
  color: var(--text-muted); 
  font-weight: var(--font-medium);
}

/* ═══ 空状态 - 现代化设计 ═══ */
.empty-state { 
  text-align: center; 
  padding: 80rpx 0; 
}

.empty-icon { 
  font-size: 80rpx; 
  display: block; 
  margin-bottom: 20rpx; 
  opacity: 0.6;
}

.empty-text { 
  font-size: 30rpx; 
  color: var(--text-muted); 
  font-weight: var(--font-medium);
}

/* ═══ 会员列表 - 现代化设计 ═══ */
.member-list { 
  display: flex; 
  flex-direction: column; 
  gap: 20rpx; 
}

.member-card {
  background: var(--bg-primary); 
  border-radius: var(--radius-xl); 
  padding: 28rpx; 
  display: flex; 
  align-items: center;
  box-shadow: var(--shadow-lg); 
  border: 1px solid var(--border-color); 
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.member-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, var(--secondary-color), var(--primary-color));
}

.member-card:active { 
  transform: scale(0.98); 
  box-shadow: var(--shadow-xl);
}

.member-avatar {
  width: 64rpx; 
  height: 64rpx; 
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex; 
  align-items: center; 
  justify-content: center; 
  margin-right: 20rpx; 
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.avatar-text { 
  font-size: 30rpx; 
  font-weight: var(--font-bold); 
  color: var(--text-white); 
}

.member-info { 
  flex: 1; 
}

.member-name-row { 
  display: flex; 
  align-items: center; 
  gap: 12rpx; 
  margin-bottom: 8rpx; 
}

.member-name { 
  font-size: 30rpx; 
  font-weight: var(--font-semibold); 
  color: var(--text-primary); 
  letter-spacing: -0.5rpx;
}

.member-phone { 
  font-size: 24rpx; 
  color: var(--text-muted); 
  font-weight: var(--font-medium);
}

.member-tags { 
  display: flex; 
  gap: 10rpx; 
}

.member-tag { 
  font-size: 20rpx; 
  padding: 6rpx 14rpx; 
  border-radius: var(--radius-full); 
  font-weight: var(--font-medium);
}

.tag-points { 
  background: var(--primary-light); 
  color: var(--primary-color); 
}

.tag-visits { 
  background: var(--secondary-light); 
  color: var(--secondary-color); 
}

.tag-consumed { 
  background: var(--accent-light); 
  color: var(--accent-color); 
}

.member-arrow { 
  font-size: 36rpx; 
  color: var(--text-muted); 
  margin-left: 16rpx; 
  flex-shrink: 0; 
}

/* ═══ 弹窗通用 - 现代化设计 ═══ */
.overlay {
  position: fixed; 
  top: 0; 
  left: 0; 
  right: 0; 
  bottom: 0;
  background: rgba(0,0,0,0.6); 
  z-index: 2000; 
  display: flex; 
  align-items: flex-end; 
  justify-content: center;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.modal-handle { 
  width: 48rpx; 
  height: 4rpx; 
  background: var(--border-light); 
  border-radius: var(--radius-sm); 
  margin: 16rpx auto 8rpx; 
}

.modal {
  background: var(--bg-primary); 
  border-radius: var(--radius-xl) var(--radius-xl) 0 0; 
  width: 100%; 
  max-height: 85vh;
  overflow-y: auto; 
  padding: 0 32rpx 40rpx; 
  animation: slideUp 0.3s ease-out;
  border: 1px solid var(--border-color);
  border-bottom: none;
}

@keyframes slideUp { 
  from { 
    transform: translateY(100%); 
  } 
  to { 
    transform: translateY(0); 
  } 
}

.modal-title { 
  display: block; 
  font-size: 34rpx; 
  font-weight: var(--font-bold); 
  color: var(--text-primary); 
  text-align: center; 
  padding: 12rpx 0 8rpx; 
  letter-spacing: -0.5rpx;
}

.modal-desc { 
  display: block; 
  font-size: 24rpx; 
  color: var(--text-muted); 
  text-align: center; 
  margin-bottom: 24rpx; 
  font-weight: var(--font-medium);
}

.form-body { 
  padding: 16rpx 0; 
  display: flex; 
  flex-direction: column; 
  gap: 16rpx; 
}

.field { }

.field-label { 
  display: block; 
  font-size: 24rpx; 
  color: var(--text-secondary); 
  margin-bottom: 8rpx; 
  font-weight: var(--font-semibold); 
}

.field-input {
  width: 100%; 
  height: 76rpx; 
  border: 1px solid var(--border-color); 
  border-radius: var(--radius-full);
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

.form-btn {
  width: 100%; 
  height: 80rpx; 
  border-radius: var(--radius-full); 
  display: flex;
  align-items: center; 
  justify-content: center; 
  font-size: 28rpx; 
  font-weight: var(--font-semibold);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.form-btn:active { 
  transform: scale(0.98); 
  box-shadow: var(--shadow-lg);
}

.form-btn.primary { 
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark)); 
  color: var(--text-white);
  box-shadow: var(--shadow-md);
}

/* 记消费 - 会员选择 */
.member-select {
  height: 72rpx; border: 1px solid #E5E7EB; border-radius: 30px; padding: 0 20rpx;
  display: flex; align-items: center; justify-content: space-between; background: #F9FAFB; font-size: 24rpx;
}
.member-select .placeholder { color: #9CA3AF; }
.member-picker-list {
  background: white; border: 1px solid #E5E7EB; border-radius: 16px;
  max-height: 320rpx; overflow-y: auto; margin-top: 4rpx;
}
.picker-item { padding: 18rpx 20rpx; display: flex; gap: 12rpx; border-bottom: 0.5px solid #F3F4F6; }
.picker-item:active { background: #FFF7ED; }
.pi-name { font-size: 26rpx; font-weight: 600; color: #1F2937; }
.pi-phone { font-size: 22rpx; color: #9CA3AF; }

.amount-input-wrap {
  display: flex; align-items: center; height: 80rpx; border: 1px solid #E5E7EB;
  border-radius: 30px; background: #F9FAFB; padding: 0 20rpx;
}
.amount-currency { font-size: 32rpx; font-weight: 700; color: #F97316; margin-right: 8rpx; }
.amount-input { flex: 1; height: 100%; border: none; font-size: 36rpx; font-weight: 700; background: transparent; color: #1F2937; }

/* ═══ 详情弹窗 - 现代化设计 ═══ */
.detail-modal { 
  max-height: 85vh; 
  overflow-y: auto; 
}

.detail-header { 
  display: flex; 
  align-items: center; 
  gap: 20rpx; 
  padding: 16rpx 0 20rpx; 
}

.detail-avatar {
  width: 80rpx; 
  height: 80rpx; 
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex; 
  align-items: center; 
  justify-content: center; 
  flex-shrink: 0;
  box-shadow: var(--shadow-md);
}

.detail-avatar-text { 
  font-size: 36rpx; 
  font-weight: var(--font-bold); 
  color: var(--text-white); 
}

.detail-name-row { 
  display: flex; 
  flex-direction: column; 
}

.detail-name { 
  font-size: 36rpx; 
  font-weight: var(--font-bold); 
  color: var(--text-primary); 
  letter-spacing: -0.5rpx;
}

.detail-phone { 
  font-size: 26rpx; 
  color: var(--text-muted); 
  margin-top: 4rpx; 
  font-weight: var(--font-medium);
}

.detail-stats {
  display: flex; 
  justify-content: space-around;
  background: var(--primary-light); 
  border-radius: var(--radius-lg); 
  padding: 28rpx 20rpx; 
  margin-bottom: 20rpx;
  border: 1px solid var(--border-light);
}

.ds-item { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
}

.ds-num { 
  font-size: 36rpx; 
  font-weight: var(--font-black); 
  color: var(--primary-color); 
}

.ds-label { 
  font-size: 22rpx; 
  color: var(--text-secondary); 
  margin-top: 6rpx; 
  font-weight: var(--font-medium);
}

.detail-actions { 
  display: flex; 
  gap: 16rpx; 
  margin-bottom: 24rpx; 
}

.da-btn {
  flex: 1; 
  height: 76rpx; 
  border-radius: var(--radius-full); 
  display: flex;
  align-items: center; 
  justify-content: center; 
  background: var(--primary-light); 
  color: var(--primary-color);
  font-size: 26rpx; 
  font-weight: var(--font-semibold);
  transition: all var(--transition-normal);
}

.da-btn:active { 
  transform: scale(0.96); 
  background: var(--bg-secondary);
}

.da-btn.danger { 
  background: var(--danger-light); 
  color: var(--danger-color); 
}

.detail-section { 
  margin-bottom: 12rpx; 
}

.detail-section-title { 
  font-size: 28rpx; 
  font-weight: var(--font-bold); 
  color: var(--text-primary); 
  margin-bottom: 16rpx; 
  display: block; 
  letter-spacing: -0.5rpx;
}

.ds-empty { 
  font-size: 24rpx; 
  color: var(--text-muted); 
  text-align: center; 
  padding: 28rpx; 
  background: var(--bg-tertiary); 
  border-radius: var(--radius-md); 
  font-weight: var(--font-medium);
}

.ds-record {
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  padding: 16rpx 24rpx; 
  background: var(--bg-tertiary); 
  border-radius: var(--radius-md); 
  margin-bottom: 10rpx;
  border: 1px solid var(--border-color);
}

.ds-record-left { 
  display: flex; 
  align-items: center; 
  gap: 16rpx; 
}

.ds-record-amount { 
  font-size: 28rpx; 
  font-weight: var(--font-bold); 
  color: var(--primary-color); 
}

.ds-record-note { 
  font-size: 24rpx; 
  color: var(--text-secondary); 
  font-weight: var(--font-medium);
}

.ds-record-date { 
  font-size: 22rpx; 
  color: var(--text-muted); 
  font-weight: var(--font-medium);
}

/* ═══ 扫码弹窗 - 现代化设计 ═══ */
.scan-modal { 
  text-align: center; 
}

.scan-icon-big { 
  font-size: 60rpx; 
  margin-bottom: 12rpx; 
  filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.1));
}

.scan-frame {
  width: 320rpx; 
  height: 220rpx; 
  position: relative; 
  margin: 0 auto 20rpx;
  display: flex; 
  align-items: center; 
  justify-content: center;
  background: var(--primary-light); 
  border-radius: var(--radius-lg); 
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.scan-corner { 
  position: absolute; 
  width: 32rpx; 
  height: 32rpx; 
  border-color: var(--primary-color); 
  border-style: solid; 
}

.scan-corner.tl { 
  top: 12rpx; 
  left: 12rpx; 
  border-width: 4rpx 0 0 4rpx; 
}

.scan-corner.tr { 
  top: 12rpx; 
  right: 12rpx; 
  border-width: 4rpx 4rpx 0 0; 
}

.scan-corner.bl { 
  bottom: 12rpx; 
  left: 12rpx; 
  border-width: 0 0 4rpx 4rpx; 
}

.scan-corner.br { 
  bottom: 12rpx; 
  right: 12rpx; 
  border-width: 0 4rpx 4rpx 0; 
}

.scan-icon-center { 
  font-size: 60rpx; 
  opacity: 0.4; 
}

.scan-line {
  position: absolute; 
  left: 24rpx; 
  right: 24rpx; 
  height: 4rpx;
  background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
  animation: scanLine 1.8s ease-in-out infinite; 
  top: 30%;
}

@keyframes scanLine { 
  0%,100% { 
    top: 20%; 
  } 
  50% { 
    top: 70%; 
  } 
}

.scan-mock-btn {
  height: 76rpx; 
  border-radius: var(--radius-full); 
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex; 
  align-items: center; 
  justify-content: center; 
  color: var(--text-white);
  font-size: 28rpx; 
  font-weight: var(--font-semibold); 
  margin-bottom: 16rpx;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.scan-mock-btn:active { 
  transform: scale(0.98); 
  box-shadow: var(--shadow-lg);
}

.scan-footer-note { 
  font-size: 22rpx; 
  color: var(--text-muted); 
  text-align: center; 
  font-weight: var(--font-medium);
}

/* ═══ 手机号弹窗 - 现代化设计 ═══ */
.phone-input { 
  font-size: 40rpx; 
  letter-spacing: 8rpx; 
  text-align: center; 
  font-weight: var(--font-semibold);
}

.phone-result { 
  margin-top: 24rpx; 
}

.phone-result-card {
  background: var(--primary-light); 
  border-radius: var(--radius-lg); 
  padding: 24rpx;
  display: flex; 
  align-items: center; 
  gap: 20rpx;
  border: 1px solid var(--border-light);
}

.phone-result-avatar {
  width: 72rpx; 
  height: 72rpx; 
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex; 
  align-items: center; 
  justify-content: center; 
  flex-shrink: 0;
  font-size: 32rpx; 
  font-weight: var(--font-bold); 
  color: var(--text-white);
  box-shadow: var(--shadow-sm);
}

.phone-result-info { 
  flex: 1; 
}

.phone-result-name { 
  font-size: 30rpx; 
  font-weight: var(--font-bold); 
  color: var(--text-primary); 
}

.phone-result-phone { 
  font-size: 24rpx; 
  color: var(--text-muted); 
  font-weight: var(--font-medium);
}

.phone-result-btn {
  padding: 12rpx 32rpx; 
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: var(--text-white); 
  border-radius: var(--radius-full); 
  font-size: 24rpx; 
  font-weight: var(--font-semibold); 
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.phone-result-btn:active {
  transform: scale(0.96);
  box-shadow: var(--shadow-md);
}

.phone-not-found { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 20rpx; 
  padding: 36rpx; 
}

.pnf-icon { 
  font-size: 56rpx; 
  opacity: 0.6;
}

.pnf-text { 
  font-size: 28rpx; 
  color: var(--text-secondary); 
  font-weight: var(--font-medium);
}

.bottom-spacer { height: 40rpx; }

/* 底部Tab */
.bottom-tab {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 0.5px solid #F0F0F0;
  display: flex; justify-content: space-around;
  padding: 10rpx 32rpx 24rpx;
  position: sticky; bottom: 0;
}
.tab-item { text-align: center; font-size: 20rpx; color: #9CA3AF; font-weight: 500; }
.tab-item:active { transform: scale(0.92); }
.tab-item.active { color: #F97316; }
.tab-icon { font-size: 36rpx; display: block; margin-bottom: 2rpx; }
.tab-label { font-size: 18rpx; }
</style>