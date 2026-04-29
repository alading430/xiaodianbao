/**
 * 小店宝本地数据持久化层
 * 使用 LocalStorage 存储，Beta 版离线可用
 * 后续可无缝切换到 IndexedDB 或远端 API
 */

const STORAGE_KEYS = {
  INVENTORY: 'xdb_inventory',
  MEMBERS: 'xdb_members',
  COPYWRITE_HISTORY: 'xdb_copy_history',
  MEMBER_CONSUMPTION: 'xdb_consumption',
  SETTINGS: 'xdb_settings'
}

// ========== 工具函数 ==========

function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch (e) {
    console.warn(`[xdb/db] Failed to load ${key}:`, e)
    return fallback
  }
}

function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (e) {
    console.error(`[xdb/db] Failed to save ${key}:`, e)
    return false
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6)
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function now() {
  return new Date().toISOString()
}

// ========== 库存管理 ==========

export function getInventory() {
  return load(STORAGE_KEYS.INVENTORY, [])
}

export function saveInventory(items) {
  return save(STORAGE_KEYS.INVENTORY, items)
}

export function addInventoryItem(item) {
  const items = getInventory()
  const newItem = {
    id: generateId(),
    name: item.name || '',
    barcode: item.barcode || '',
    category: item.category || '通用',
    quantity: Math.max(0, parseInt(item.quantity) || 0),
    unit: item.unit || '个',
    price: parseFloat(item.price) || 0,
    costPrice: parseFloat(item.costPrice) || 0,
    hasBarcode: !!item.barcode,
    note: item.note || '',
    createdAt: now(),
    updatedAt: now()
  }
  items.unshift(newItem)
  saveInventory(items)
  return newItem
}

export function updateInventoryItem(id, updates) {
  const items = getInventory()
  const idx = items.findIndex(i => i.id === id)
  if (idx === -1) return null
  items[idx] = { ...items[idx], ...updates, updatedAt: now() }
  saveInventory(items)
  return items[idx]
}

export function deleteInventoryItem(id) {
  const items = getInventory()
  const filtered = items.filter(i => i.id !== id)
  saveInventory(filtered)
  return true
}

export function adjustInventoryQuantity(id, delta) {
  const items = getInventory()
  const idx = items.findIndex(i => i.id === id)
  if (idx === -1) return null
  items[idx].quantity = Math.max(0, (items[idx].quantity || 0) + delta)
  items[idx].updatedAt = now()
  saveInventory(items)
  return items[idx]
}

export function searchInventory(query) {
  if (!query || !query.trim()) return getInventory()
  const q = query.trim().toLowerCase()
  return getInventory().filter(i =>
    i.name.toLowerCase().includes(q) ||
    (i.barcode && i.barcode.toLowerCase().includes(q)) ||
    i.category.toLowerCase().includes(q)
  )
}

export function getInventoryCategories() {
  const items = getInventory()
  const cats = [...new Set(items.map(i => i.category))]
  return cats.sort()
}

// ========== 初始化示例数据（方便演示） ==========

const SAMPLE_INVENTORY = [
  { name: '东北草莓', category: '水果', quantity: 30, unit: '斤', price: 25, costPrice: 18, note: '今天刚到，又大又甜' },
  { name: '大白菜', category: '蔬菜', quantity: 50, unit: '斤', price: 1.5, costPrice: 0.8, note: '本地新鲜蔬菜' },
  { name: '五花肉', category: '肉类', quantity: 20, unit: '斤', price: 28, costPrice: 22, note: '精品五花，肥瘦相间' },
  { name: '青岛啤酒', category: '饮品', quantity: 48, unit: '瓶', price: 4, costPrice: 2.5, note: '冰镇更好喝' },
  { name: '螺丝', category: '五金', quantity: 200, unit: '个', price: 0.5, costPrice: 0.2, note: '各种规格都有' },
  { name: '电灯泡', category: '五金', quantity: 15, unit: '个', price: 8, costPrice: 5, note: 'LED节能' },
  { name: '辣条', category: '零食', quantity: 60, unit: '包', price: 1, costPrice: 0.5, note: '小朋友最爱' },
  { name: '纯牛奶', category: '饮品', quantity: 12, unit: '箱', price: 45, costPrice: 38, note: '保质期到5月20日' },
  { name: '土鸡蛋', category: '农产品', quantity: 100, unit: '个', price: 1.5, costPrice: 1, note: '农村散养土鸡' },
  { name: '韭菜', category: '蔬菜', quantity: 5, unit: '斤', price: 3, costPrice: 1.5, note: '刚摘的' }
]

const SAMPLE_MEMBERS = [
  { name: '张阿姨', phone: '138****5566', note: '住在隔壁小区，常买蔬菜' },
  { name: '李老板', phone: '139****2233', note: '开饭店的，天天拿货' },
  { name: '王大爷', phone: '137****8899', note: '退休教师，喜欢买水果' },
  { name: '小刘', phone: '136****1122', note: '上班族，下班顺路买' },
  { name: '赵姐', phone: '135****9988', note: '全职妈妈，给孩子买零食' }
]

/**
 * 加载示例数据（仅首次使用时）
 * 如果库存为空则填充示例数据，方便演示
 */
export function loadSampleData() {
  const items = getInventory()
  const members = getMembers()

  if (items.length === 0) {
    SAMPLE_INVENTORY.forEach(item => {
      addInventoryItem(item)
    })
  }

  if (members.length === 0) {
    SAMPLE_MEMBERS.forEach(member => {
      addMember(member)
    })
    // 给张阿姨和李老板加一笔消费记录
    const mems = getMembers()
    if (mems.length >= 2) {
      addConsumption(mems[0].id, 35, '买了草莓和牛奶')
      addConsumption(mems[0].id, 28, '五花肉两斤')
      addConsumption(mems[1].id, 156, '啤酒3箱+蔬菜若干')
    }
  }

  return { itemsLoaded: items.length === 0, membersLoaded: members.length === 0 }
}

export function getInventoryStats() {
  const items = getInventory()
  return {
    total: items.length,
    totalQuantity: items.reduce((s, i) => s + (i.quantity || 0), 0),
    totalValue: items.reduce((s, i) => s + (i.quantity || 0) * (i.price || 0), 0),
    lowStock: items.filter(i => i.quantity <= 5).length,
    noBarcode: items.filter(i => !i.hasBarcode).length
  }
}

// ========== 会员管理 ==========

export function getMembers() {
  return load(STORAGE_KEYS.MEMBERS, [])
}

export function saveMembers(members) {
  return save(STORAGE_KEYS.MEMBERS, members)
}

export function addMember(member) {
  const members = getMembers()
  // 检查重复电话号码
  if (member.phone) {
    const existing = members.find(m => m.phone === member.phone)
    if (existing) return { duplicate: true, member: existing }
  }
  const newMember = {
    id: generateId(),
    name: member.name || '',
    phone: member.phone || '',
    points: 0,
    totalConsumption: 0,
    visitCount: 0,
    lastVisit: null,
    createdAt: now(),
    updatedAt: now(),
    note: member.note || ''
  }
  members.unshift(newMember)
  saveMembers(members)
  return { duplicate: false, member: newMember }
}

export function updateMember(id, updates) {
  const members = getMembers()
  const idx = members.findIndex(m => m.id === id)
  if (idx === -1) return null
  members[idx] = { ...members[idx], ...updates, updatedAt: now() }
  saveMembers(members)
  return members[idx]
}

export function deleteMember(id) {
  const members = getMembers()
  saveMembers(members.filter(m => m.id !== id))
  // 同时删除该会员的消费记录
  const cons = getConsumptionRecords().filter(c => c.memberId !== id)
  saveConsumptionRecords(cons)
  return true
}

export function searchMembers(query) {
  if (!query || !query.trim()) return getMembers()
  const q = query.trim().toLowerCase()
  return getMembers().filter(m =>
    m.name.toLowerCase().includes(q) ||
    (m.phone && m.phone.includes(q))
  )
}

// ========== 消费记录 ==========

export function getConsumptionRecords() {
  return load(STORAGE_KEYS.MEMBER_CONSUMPTION, [])
}

export function saveConsumptionRecords(records) {
  return save(STORAGE_KEYS.MEMBER_CONSUMPTION, records)
}

export function addConsumption(memberId, amount, note = '') {
  const records = getConsumptionRecords()
  const record = {
    id: generateId(),
    memberId,
    amount: parseFloat(amount) || 0,
    points: Math.floor((parseFloat(amount) || 0) / 10), // 每10元积1分
    note,
    date: today(),
    createdAt: now()
  }
  records.unshift(record)
  saveConsumptionRecords(records)

  // 更新会员累计数据
  const members = getMembers()
  const mIdx = members.findIndex(m => m.id === memberId)
  if (mIdx !== -1) {
    members[mIdx].totalConsumption = (members[mIdx].totalConsumption || 0) + record.amount
    members[mIdx].points = (members[mIdx].points || 0) + record.points
    members[mIdx].visitCount = (members[mIdx].visitCount || 0) + 1
    members[mIdx].lastVisit = now()
    saveMembers(members)
  }

  return record
}

export function getMemberConsumptions(memberId) {
  return getConsumptionRecords().filter(c => c.memberId === memberId)
}

export function getMemberStats() {
  const members = getMembers()
  const records = getConsumptionRecords()
  const todayRecords = records.filter(r => r.date === today())
  return {
    total: members.length,
    totalConsumption: records.reduce((s, r) => s + r.amount, 0),
    totalPoints: members.reduce((s, m) => s + (m.points || 0), 0),
    todayVisits: todayRecords.length,
    todayRevenue: todayRecords.reduce((s, r) => s + r.amount, 0)
  }
}

// ========== AI文案历史 ==========

export function getCopywriteHistory() {
  return load(STORAGE_KEYS.COPYWRITE_HISTORY, [])
}

export function saveCopywriteHistory(history) {
  return save(STORAGE_KEYS.COPYWRITE_HISTORY, history)
}

export function addCopywriteRecord(product, copies) {
  const history = getCopywriteHistory()
  const record = {
    id: generateId(),
    product,
    copies,
    createdAt: now()
  }
  history.unshift(record)
  // 只保留最近100条
  if (history.length > 100) history.length = 100
  saveCopywriteHistory(history)
  return record
}

export function deleteCopywriteRecord(id) {
  const history = getCopywriteHistory()
  saveCopywriteHistory(history.filter(h => h.id !== id))
  return true
}
