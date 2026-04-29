<template>
  <view class="page">
    <!-- ═══ 头部：简约品牌区 ═══ -->
    <view class="hd">
      <view class="hd-inner">
        <view class="hd-top">
          <view class="hd-brand">
            <view class="hd-logo">
              <text class="hd-logo-text">店</text>
            </view>
            <view class="hd-title-wrap">
              <text class="hd-title">小店宝</text>
              <text class="hd-sub">智能掌柜</text>
            </view>
          </view>
          <view class="hd-right">
            <view v-if="currentAccount" class="hd-avatar" @click="toProfile">
              <text class="hd-avatar-text">{{ avatarText }}</text>
            </view>
            <view v-else class="hd-login-btn" @click="toAuth">
              <text>登录</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- ═══ KPI 仪表盘 ═══ -->
    <view class="kpi-section">
      <view class="kpi-row">
        <view class="kpi-card" @click="toInv">
          <text class="kpi-value">{{ kpi.total }}</text>
          <text class="kpi-label">商品</text>
        </view>
        <view class="kpi-card" @click="toMbr">
          <text class="kpi-value">{{ kpi.members }}</text>
          <text class="kpi-label">会员</text>
        </view>
        <view class="kpi-card kpi-warn" @click="toInv">
          <text class="kpi-value kpi-warn-val">{{ kpi.low }}</text>
          <text class="kpi-label">需补</text>
        </view>
        <view class="kpi-card">
          <text class="kpi-value">¥{{ val }}</text>
          <text class="kpi-label">货值</text>
        </view>
      </view>
    </view>

    <!-- ═══ 主体内容 ═══ -->
    <scroll-view class="body" scroll-y show-scrollbar="false">
      <view class="body-inner">

        <!-- 库存预警条 -->
        <view class="alarm" v-if="lowItems.length">
          <text class="alarm-icon">⚠️</text>
          <text class="alarm-text">有 {{ lowItems.length }} 件商品库存不足</text>
          <text class="alarm-action" @click="toInv">去补货 →</text>
        </view>

        <!-- 快捷入口 3×1 -->
        <view class="quick-nav">
          <view class="qnav-item" @click="scan">
            <view class="qnav-icon qnav-scan">📷</view>
            <text class="qnav-label">扫码</text>
          </view>
          <view class="qnav-item" @click="toInv">
            <view class="qnav-icon qnav-stock">📦</view>
            <text class="qnav-label">库存</text>
          </view>
          <view class="qnav-item" @click="toMbr">
            <view class="qnav-icon qnav-mbr">👥</view>
            <text class="qnav-label">会员</text>
          </view>
          <view class="qnav-item" @click="toCpy">
            <view class="qnav-icon qnav-copy">✨</view>
            <text class="qnav-label">文案</text>
          </view>
        </view>

        <!-- 快速录入 -->
        <view class="add-card">
          <view class="add-header">
            <text class="add-title">📝 录入商品</text>
            <view class="add-badge">AI 智能</view>
          </view>

          <!-- NL 自然语言 -->
          <view class="nl-row" :class="{ focused: nlF }">
            <input class="nl-input" v-model="nlQ" placeholder="说一句：可乐5箱进48元" @focus="nlF=1" @blur="nlF=0" @confirm="nlGo" />
            <view class="nl-btn" @click="nlGo">
              <text v-if="nlL">⟳</text>
              <text v-else>✨</text>
            </view>
          </view>

          <view class="divider-wrap">
            <view class="divider-line"></view>
            <text class="divider-text">或手动填写</text>
            <view class="divider-line"></view>
          </view>

          <!-- 手动录入 -->
          <view class="manual-row">
            <input class="manual-input" v-model="f.name" placeholder="名称" @input="clr('name')" />
            <input class="manual-input manual-sm" v-model="f.qty" placeholder="数量" type="number" @input="clr('qty')" />
            <input class="manual-input manual-sm" v-model="f.price" placeholder="¥单价" type="number" @input="clr('price')" />
            <view class="manual-cat" @click="cp=!cp">
              <text>{{ cats[ci] }}</text>
              <text class="manual-arrow">▼</text>
            </view>
            <view class="manual-add" :class="{ disabled: !ok }" @click="addItem">
              <text v-if="aL">⟳</text>
              <text v-else>+</text>
            </view>
          </view>

          <!-- 分类选择 -->
          <view class="cat-picker" v-if="cp">
            <text v-for="(c,i) in cats" :key="c" class="cat-tag" :class="{ active: ci===i }" @click="ci=i;cp=0">{{ c }}</text>
          </view>

          <!-- 错误提示 -->
          <view v-if="err.name||err.qty||err.price" class="err-row">
            <text v-if="err.name" class="err-text">⚠ {{ err.name }}</text>
            <text v-if="err.qty" class="err-text">⚠ {{ err.qty }}</text>
            <text v-if="err.price" class="err-text">⚠ {{ err.price }}</text>
          </view>
        </view>

        <!-- 最近商品 -->
        <view class="section-header">
          <text class="section-title">最近商品</text>
          <view class="section-more" @click="toInv">
            <text>全部</text>
            <text>→</text>
          </view>
        </view>

        <view class="recent-list" v-if="recent.length">
          <view v-for="(it,i) in recent" :key="it.id" class="recent-item" @click="toInv">
            <view class="recent-emoji">{{ emoji(it) }}</view>
            <view class="recent-info">
              <view class="recent-name-row">
                <text class="recent-name">{{ it.name }}</text>
                <text class="recent-tag">{{ it.category||'其他' }}</text>
              </view>
              <text class="recent-price">¥{{ (it.price||0).toFixed(2) }}/{{ it.unit||'件' }}</text>
            </view>
            <view class="recent-qty-wrap">
              <text class="recent-qty" :class="{ warn: it.quantity<=5 }">{{ it.quantity }}</text>
              <text class="recent-unit">{{ it.unit||'件' }}</text>
            </view>
          </view>
        </view>
        <view v-else class="empty-state">
          <text>还没有商品，快来录入吧</text>
        </view>

        <!-- AI 文案预览 -->
        <view class="section-header" v-if="recent.length">
          <text class="section-title">🤖 AI 文案</text>
          <view class="section-more" @click="cycleAI">
            <text>换一批</text>
            <text>✨</text>
          </view>
        </view>

        <view class="ai-preview" v-if="recent.length">
          <view class="ai-header">
            <view class="ai-prod-name">📢 {{ aiProd }}</view>
            <view class="ai-copy-btn" @click="copyAI">📋 复制</view>
          </view>
          <view class="ai-body" v-html="aiTxt"></view>
          <view class="ai-footer">
            <text class="ai-style-tag" @click="cycleAI">🎨 {{ aiStyle }}</text>
            <text class="ai-hot-tag">🔥 朋友圈</text>
          </view>
        </view>

        <!-- 会员快捷入口 -->
        <view class="member-shortcut" @click="toMbr">
          <view class="member-shortcut-left">
            <text class="member-shortcut-title">👤 会员管理</text>
            <text class="member-shortcut-desc">扫码 / 手机号记消费</text>
          </view>
          <view class="member-shortcut-btn">使用 →</view>
        </view>

        <view style="height:180rpx"></view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getInventory, addInventoryItem, getInventoryStats, getMemberStats, loadSampleData } from '@/stores/db.js'
import { showToast } from '@/utils/bridge.js'
import { getCurrentUser, getAvatarText } from '@/stores/account.js'

const r = useRouter()
const f = ref({ name:'', qty:'', price:'' })
const currentAccount = ref(null)
const avatarText = ref('')
const nlQ = ref(''); const nlF = ref(0); const nlL = ref(0); const aL = ref(0)
const cats = ['未分类','蔬菜','食杂','饮料','日用品','五金','蔬果','其他']
const ci = ref(0); const cp = ref(0); const err = ref({ name:'', qty:'', price:'' })
const ok = computed(() => f.value.name.trim() && f.value.qty && parseFloat(f.value.price) >= 0)
const kpi = ref({ total:0, members:0, low:0 })
const lowItems = ref([]); const recent = ref([]); const val = ref('0')

const aiStyles = ['亲切','促销','短文案','日常']
const aiStyle = ref('亲切')
const aiProd = ref('')
const aiTxt = ref('')
const aiTmpl = {
  '亲切': p => `🍜 暖心${p}，邻里之味～<br>#社区味道`,
  '促销': p => `🔥 ${p}第二件半价！新鲜到货～<br>#限时抢购`,
  '短文案': p => `${p}，今日上新✨<br>#好物分享`,
  '日常': p => `🌾 一蔬一饭～小店自制${p}❤️<br>#美好食光`
}
function emoji(it) {
  const m={'餐饮':'🍜','食杂':'🏪','五金':'🔧','日用品':'🧴','蔬果':'🥬','饮料':'🥤','蔬菜':'🌿','水果':'🍎'}
  return m[it.category]||'📦'
}
function genAI() {
  if (recent.value.length) aiProd.value = recent.value[0].name
  aiTxt.value = (aiTmpl[aiStyle.value]||aiTmpl['亲切'])(aiProd.value)
}
function cycleAI() {
  aiStyle.value = aiStyles[(aiStyles.indexOf(aiStyle.value)+1)%aiStyles.length]
  genAI(); showToast(`🎨 ${aiStyle.value}风格`)
}
function copyAI() { showToast('📋 文案已复制') }

onMounted(()=>{
  loadSampleData()
  rsh()
  const u = getCurrentUser()
  currentAccount.value = u
  if (u) avatarText.value = getAvatarText(u)
})
function rsh() {
  const s=getInventoryStats(); const m=getMemberStats()
  kpi.value={total:s.total,members:m.total,low:s.lowStock}
  const a=getInventory(); val.value=a.reduce((s,i)=>s+(i.price||0)*(i.quantity||0),0).toFixed(0)
  recent.value=a.slice(0,5); lowItems.value=a.filter(i=>i.quantity<=5); genAI()
}
function clr(k) { err.value[k]='' }

function nlGo() {
  const t=nlQ.value.trim(); if(!t){showToast('请输入') ;return}
  nlL.value=1; const p=parseNL(t)
  setTimeout(()=>{
    nlL.value=0
    if(p.name){
      addInventoryItem({name:p.name,quantity:p.quantity||1,unit:p.unit||'个',price:p.price||0,category:p.category||'未分类',note:'NL',hasBarcode:0})
      showToast(`✅ ${p.name}`); nlQ.value=''; rsh()
    } else showToast('未识别，请手动')
  },500)
}
function parseNL(t) {
  const r={name:'',quantity:1,unit:'个',price:0,category:''}
  const q=t.match(/(\d+)\s*(个|斤|箱|瓶|袋|包|盒|条|桶|kg|g|件|双|只)/)
  if(q){r.quantity=parseInt(q[1]);r.unit=q[2]}else{const n=t.match(/(\d+)/);if(n)r.quantity=parseInt(n[1])}
  const p=t.match(/(\d+(?:\.\d+)?)\s*(元|块)/)
  if(p)r.price=parseFloat(p[1])
  let c=t.replace(/\d+(?:\.\d+)?\s*(个|斤|箱|瓶|袋|包|盒|条|桶|kg|g|件|双|只)/g,'').replace(/\d+(?:\.\d+)?\s*(元|块)/g,'').replace(/\s+/g,'').trim()
  if(c)r.name=c
  if(/可乐|雪碧|饮料|水|啤酒|白酒|牛奶|果汁/.test(t))r.category='饮料'
  else if(/菜|肉|鱼|果|蔬|瓜|米|面|油/.test(t))r.category='蔬果'
  return r
}
function addItem() {
  let v=1; const e={name:'',qty:'',price:''}
  if(!f.value.name.trim()){e.name='输入名称';v=0}
  const q=parseInt(f.value.qty)
  if(!f.value.qty||isNaN(q)||q<=0){e.qty='数量>0';v=0}
  const p=parseFloat(f.value.price)
  if(isNaN(p)||p<0){e.price='输入价格';v=0}
  err.value=e; if(!v){showToast('请修正');return}
  aL.value=1
  setTimeout(()=>{
    addInventoryItem({name:f.value.name.trim(),quantity:q,unit:'个',price:p||0,category:cats[ci.value],note:'首页'})
    showToast(`✅ ${f.value.name.trim()}`)
    f.value={name:'',qty:'',price:''}; ci.value=0; err.value={name:'',qty:'',price:''}; aL.value=0; rsh()
  },200)
}
function scan(){showToast('📷 扫码连接设备')}
function toHome(){r.push('/home')}
function toInv(){r.push('/inventory')}
function toMbr(){r.push('/members')}
function toCpy(){r.push('/copywriting')}
function toProfile(){r.push('/profile')}
function toAuth(){r.push('/auth')}
</script>

<style scoped>
/* ═══ 全局样式 - 现代化设计 ═══ */
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ═══ 头部品牌区 - 现代化设计 ═══ */
.hd {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: env(safe-area-inset-top, 0) 0 0;
  position: relative;
  border-bottom: 1px solid rgba(229, 231, 235, 0.6);
}

.hd-inner {
  padding: 32rpx 32rpx 0;
}

.hd-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hd-brand {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.hd-logo {
  width: 64rpx;
  height: 64rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, var(--primary-color) 0%, #EA580C 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8rpx 24rpx rgba(249, 115, 22, 0.3);
  transition: transform 0.3s ease;
}

.hd-logo:active {
  transform: scale(0.95);
}

.hd-logo-text {
  font-size: 32rpx;
  font-weight: 800;
  color: #fff;
}

.hd-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.hd-title {
  font-size: 36rpx;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.1;
  letter-spacing: -0.5rpx;
}

.hd-sub {
  font-size: 20rpx;
  color: var(--text-muted);
  font-weight: 400;
}

.hd-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.hd-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), var(--warning-color));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(249, 115, 22, 0.2);
  transition: transform 0.2s ease;
}

.hd-avatar:active {
  transform: scale(0.9);
}

.hd-avatar-text {
  font-size: 24rpx;
  font-weight: 700;
  color: #fff;
}

.hd-login-btn {
  padding: 16rpx 28rpx;
  border-radius: 40rpx;
  background: linear-gradient(135deg, var(--primary-color), var(--warning-color));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(249, 115, 22, 0.2);
  transition: all 0.2s ease;
}

.hd-login-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 8rpx rgba(249, 115, 22, 0.3);
}

.hd-login-btn text {
  font-size: 24rpx;
  font-weight: 600;
  color: #fff;
}

/* ═══ KPI 仪表盘 - 现代化设计 ═══ */
.kpi-section {
  padding: 24rpx 32rpx 0;
  position: relative;
  z-index: 2;
}

.kpi-row {
  display: flex;
  gap: 20rpx;
}

.kpi-card {
  flex: 1;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 24rpx 12rpx 20rpx;
  text-align: center;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, var(--primary-color), var(--warning-color));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.kpi-card:active {
  transform: scale(0.97);
  box-shadow: var(--shadow-sm);
}

.kpi-card:active::before {
  opacity: 1;
}

.kpi-card.kpi-warn {
  background: linear-gradient(135deg, #FEF2F2, var(--bg-primary));
  border-color: rgba(239, 68, 68, 0.2);
}

.kpi-card.kpi-warn::before {
  background: var(--danger-color);
}

.kpi-value {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 6rpx;
  line-height: 1;
  letter-spacing: -0.5rpx;
}

.kpi-value.kpi-warn-val {
  color: var(--danger-color);
}

.kpi-label {
  font-size: 20rpx;
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.5rpx;
}

/* ═══ 主体内容 - 修复布局叠加问题 ═══ */
.body {
  flex: 1;
  position: relative;
  z-index: 1;
}

.body-inner {
  padding: 24rpx 32rpx 20rpx;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 24rpx; /* 添加组件间距，避免叠加 */
}

/* 预警条 - 修复布局叠加问题 */
.alarm {
  background: linear-gradient(135deg, #FEF2F2, var(--bg-primary));
  border-radius: var(--radius-md);
  padding: 20rpx 24rpx;
  margin-bottom: 0; /* 移除底部间距，由body-inner的gap控制 */
  display: flex;
  align-items: center;
  gap: 16rpx;
  border: 1px solid rgba(239, 68, 68, 0.1);
  box-shadow: var(--shadow-sm);
  animation: pulse 2s infinite;
  width: 100%;
  box-sizing: border-box;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.alarm-icon {
  font-size: 24rpx;
  flex-shrink: 0;
  animation: shake 1s infinite;
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

.alarm-text {
  font-size: 24rpx;
  color: var(--danger-color);
  flex: 1;
  font-weight: 600;
}

.alarm-action {
  font-size: 22rpx;
  font-weight: 600;
  color: var(--danger-color);
  background: #fff;
  padding: 8rpx 24rpx;
  border-radius: 40rpx;
  flex-shrink: 0;
  border: 1px solid rgba(239, 68, 68, 0.2);
  transition: all 0.2s ease;
}

.alarm-action:active {
  background: var(--danger-color);
  color: #fff;
}

/* ═══ 快捷入口 - 修复布局叠加问题 ═══ */
.quick-nav {
  display: flex;
  gap: 20rpx;
  margin-bottom: 0; /* 移除底部间距，由body-inner的gap控制 */
}

.qnav-item {
  flex: 1;
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 24rpx 0 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.qnav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, var(--secondary-color), var(--primary-color));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.qnav-item:active {
  transform: scale(0.95);
  box-shadow: var(--shadow-sm);
}

.qnav-item:active::before {
  opacity: 1;
}

.qnav-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  transition: transform 0.3s ease;
}

.qnav-item:active .qnav-icon {
  transform: scale(1.1);
}

.qnav-scan { background: linear-gradient(135deg, #FEF3C7, #FDE68A); }
.qnav-stock { background: linear-gradient(135deg, #FED7AA, #FDBA74); }
.qnav-mbr { background: linear-gradient(135deg, #FEF9C3, #FEF08A); }
.qnav-copy { background: linear-gradient(135deg, #FFEDD5, #FED7AA); }

.qnav-label {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.5rpx;
}

/* ═══ 录入卡片 - 修复布局叠加问题 ═══ */
.add-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 28rpx;
  margin-bottom: 0; /* 移除底部间距，由body-inner的gap控制 */
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.add-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: linear-gradient(90deg, var(--primary-color), var(--warning-color));
}

.add-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.add-title {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.5rpx;
}

.add-badge {
  font-size: 18rpx;
  color: var(--warning-color);
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  padding: 4rpx 18rpx;
  border-radius: 40rpx;
  line-height: 32rpx;
  font-weight: 600;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

/* 自然语言输入 - 现代化设计 */
.nl-row {
  display: flex;
  gap: 12rpx;
  align-items: center;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 6rpx;
  border: 2px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nl-row.focused {
  border-color: var(--primary-color);
  background: var(--bg-primary);
  box-shadow: 0 0 0 6rpx rgba(249, 115, 22, 0.1);
  transform: translateY(-2rpx);
}

.nl-input {
  flex: 1;
  padding: 12rpx 16rpx;
  font-size: 24rpx;
  background: transparent;
  border: none;
  color: var(--text-primary);
  min-height: 56rpx;
  letter-spacing: 0.5rpx;
}

.nl-input:focus {
  outline: none;
}

.nl-input::placeholder {
  color: var(--text-muted);
}

.nl-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--warning-color));
  border-radius: 40rpx;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 4rpx 16rpx rgba(249, 115, 22, 0.3);
  transition: all 0.2s ease;
}

.nl-btn:active {
  transform: scale(0.9);
  box-shadow: 0 2rpx 8rpx rgba(249, 115, 22, 0.4);
}

.divider-wrap{
  display:flex;
  align-items:center;
  gap:14rpx;
  margin:16rpx 0;
}
.divider-line{flex:1;height:0.5px;background:#E5E7EB;}
.divider-text{font-size:20rpx;color:#9CA3AF;flex-shrink:0;}

/* ═══ 手动录入行 - 修复右侧遮挡问题 ═══ */
.manual-row{
  display:flex;
  gap:10rpx;
  align-items:center;
  width: 100%;
  overflow-x: auto;
  padding: 4rpx 0;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.manual-row::-webkit-scrollbar {
  display: none;
}

.manual-input{
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 12rpx 16rpx;
  font-size: 24rpx;
  flex: 1;
  min-width: 120rpx;
  height: 60rpx;
  color: var(--text-primary);
  transition: all var(--transition-normal);
  font-weight: var(--font-medium);
}

.manual-input:focus{
  border-color: var(--primary-color);
  background: var(--bg-primary);
  box-shadow: var(--shadow-sm);
  outline:none;
}

.manual-input.manual-sm{
  max-width: 130rpx;
  flex: none;
  min-width: 100rpx;
}

.manual-cat{
  display:flex;
  align-items:center;
  gap:6rpx;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0 16rpx;
  height: 60rpx;
  font-size: 22rpx;
  flex-shrink:0;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-weight: var(--font-medium);
  transition: all var(--transition-normal);
}

.manual-cat:active{
  background: var(--bg-secondary);
  transform: scale(0.98);
}

.manual-arrow{
  font-size: 16rpx;
  color: var(--text-muted);
}

.manual-add{
  background: var(--primary-color);
  border-radius: var(--radius-md);
  width: 60rpx;
  height: 60rpx;
  display:flex;
  align-items:center;
  justify-content:center;
  color: var(--text-white);
  font-size: 32rpx;
  flex-shrink:0;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
  position: relative;
  z-index: 1;
}

.manual-add:active{
  transform: scale(0.95);
  box-shadow: var(--shadow-md);
}

.manual-add.disabled{
  background: var(--text-muted);
  pointer-events:none;
  opacity: 0.6;
}

.cat-picker{
  display:flex;
  gap:8rpx;
  flex-wrap:wrap;
  margin-top:10rpx;
}
.cat-tag{
  padding:4rpx 16rpx;
  border-radius:30rpx;
  font-size:18rpx;
  color:#6B7280;
  border:1px solid #E5E7EB;
  background:#fff;
}
.cat-tag.active{
  background:#FFF7ED;
  color:#F97316;
  border-color:#FED7AA;
  font-weight:600;
}

.err-row{
  display:flex;
  gap:8rpx;
  flex-wrap:wrap;
  margin-top:8rpx;
}
.err-text{
  font-size:18rpx;
  color:#EF4444;
  background:#FEF2F2;
  padding:2rpx 14rpx;
  border-radius:30rpx;
  line-height:34rpx;
}

/* ═══ Section 通用 - 修复遮挡问题 ═══ */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  position: relative;
  z-index: 2;
}

.section-title {
  font-size: 28rpx;
  font-weight: var(--font-bold);
  color: var(--text-primary);
  letter-spacing: -0.5rpx;
  position: relative;
  z-index: 3;
}

.section-more {
  display: flex;
  align-items: center;
  gap: 6rpx;
  position: relative;
  z-index: 3;
}

.section-more text {
  font-size: 22rpx;
  color: var(--primary-color);
  font-weight: var(--font-semibold);
}

/* ═══ 最近商品列表 - 修复布局叠加问题 ═══ */
.recent-list {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 0; /* 移除底部间距，由body-inner的gap控制 */
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  position: relative;
  z-index: 2;
  width: 100%;
  box-sizing: border-box;
}
.recent-item {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  border-bottom: 1px solid var(--border-light);
  position: relative;
  z-index: 1;
  transition: all var(--transition-normal);
}

.recent-item:last-child {
  border-bottom: none;
}

.recent-item:active {
  background: var(--primary-light);
  transform: translateX(4rpx);
}

.recent-emoji {
  width: 52rpx;
  height: 52rpx;
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  flex-shrink: 0;
  margin-right: 16rpx;
  position: relative;
  z-index: 2;
}

.recent-info {
  flex: 1;
  position: relative;
  z-index: 2;
}

.recent-name-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 4rpx;
}

.recent-name {
  font-weight: var(--font-semibold);
  font-size: 26rpx;
  color: var(--text-primary);
  letter-spacing: -0.5rpx;
}

.recent-tag {
  font-size: 16rpx;
  color: var(--primary-color);
  background: var(--primary-light);
  padding: 2rpx 10rpx;
  border-radius: var(--radius-full);
  line-height: 26rpx;
  font-weight: var(--font-medium);
}

.recent-price {
  font-size: 20rpx;
  color: var(--text-secondary);
}

.recent-qty-wrap {
  text-align: right;
  margin-left: 16rpx;
  position: relative;
  z-index: 2;
}

.recent-qty {
  font-size: 32rpx;
  font-weight: var(--font-bold);
  color: var(--text-primary);
  display: block;
  line-height: 1;
  letter-spacing: -0.5rpx;
}

.recent-qty.warn {
  color: var(--danger-color);
}

.recent-unit {
  font-size: 18rpx;
  color: var(--text-muted);
}
.empty-state{
  background:#fff;
  border-radius:20rpx;
  padding:40rpx 20rpx;
  text-align:center;
  font-size:24rpx;
  color:#9CA3AF;
  margin-bottom:24rpx;
}

/* ═══ AI 文案预览 - 修复布局叠加问题 ═══ */
.ai-preview {
  background: linear-gradient(135deg, #FFFAF5, var(--bg-primary));
  border-radius: var(--radius-lg);
  padding: 24rpx;
  margin-bottom: 0; /* 移除底部间距，由body-inner的gap控制 */
  border: 1px solid rgba(253, 232, 208, 0.8);
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
  transition: all var(--transition-normal);
  z-index: 1;
  width: 100%;
  box-sizing: border-box;
}

.ai-preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, var(--warning-color), var(--primary-color));
}

.ai-preview:hover {
  transform: translateY(-2rpx);
  box-shadow: var(--shadow-lg);
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.ai-prod-name {
  font-size: 26rpx;
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  letter-spacing: -0.5rpx;
}

.ai-copy-btn {
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  padding: 8rpx 20rpx;
  border-radius: 40rpx;
  font-size: 22rpx;
  color: var(--warning-color);
  font-weight: var(--font-semibold);
  border: 1px solid rgba(245, 158, 11, 0.2);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.ai-copy-btn:active {
  transform: scale(0.95);
  background: var(--warning-color);
  color: #fff;
}

.ai-body {
  background: linear-gradient(135deg, #FEF9E6, #FEF3C7);
  border-radius: var(--radius-md);
  padding: 20rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: var(--text-primary);
  margin-bottom: 16rpx;
  border: 1px solid rgba(254, 243, 199, 0.5);
  position: relative;
}

.ai-body::before {
  content: '✨';
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  font-size: 32rpx;
  opacity: 0.3;
}

.ai-footer {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.ai-style-tag, .ai-hot-tag {
  padding: 6rpx 18rpx;
  border-radius: var(--radius-full);
  font-size: 22rpx;
  font-weight: var(--font-medium);
  transition: all var(--transition-normal);
  border: 1px solid transparent;
}

.ai-style-tag {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.ai-style-tag:active {
  background: var(--primary-color);
  color: #fff;
  transform: scale(0.95);
}

.ai-hot-tag {
  background: linear-gradient(135deg, #FFF1F0, #FEE2E2);
  color: var(--danger-color);
  border-color: rgba(239, 68, 68, 0.2);
}

.ai-hot-tag:active {
  background: var(--danger-color);
  color: #fff;
  transform: scale(0.95);
}

/* ═══ 会员快捷入口 - 修复布局叠加问题 ═══ */
.member-shortcut {
  background: linear-gradient(135deg, #EEF4FF, var(--bg-primary));
  border-radius: var(--radius-lg);
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0; /* 移除底部间距，由body-inner的gap控制 */
  border: 1px solid rgba(59, 130, 246, 0.1);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.member-shortcut::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, var(--secondary-color), var(--primary-color));
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.member-shortcut:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-sm);
}

.member-shortcut:active::before {
  opacity: 1;
}

.member-shortcut-title {
  display: block;
  font-size: 26rpx;
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: 6rpx;
  letter-spacing: -0.5rpx;
}

.member-shortcut-desc {
  font-size: 22rpx;
  color: var(--text-secondary);
}

.member-shortcut-btn {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  border-radius: 40rpx;
  padding: 12rpx 32rpx;
  color: #fff;
  font-size: 24rpx;
  font-weight: var(--font-semibold);
  white-space: nowrap;
  box-shadow: 0 4rpx 16rpx rgba(249, 115, 22, 0.3);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.member-shortcut-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 8rpx rgba(249, 115, 22, 0.4);
}
</style>