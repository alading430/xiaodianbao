/**
 * 小店宝账号数据层
 * 使用 LocalStorage 存储账号信息，纯前端离线方案
 * 支持多账号 demo（切换账号仍存同一设备）
 */

const ACCOUNT_KEY = 'xdb_account'        // 当前登录用户
const ACCOUNTS_KEY = 'xdb_accounts'      // 所有已注册账号

// ========== 工具函数 ==========

function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch (e) {
    console.warn('[xdb/account] Failed to load', key, e)
    return fallback
  }
}

function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('[xdb/account] Failed to save', key, e)
    return false
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 6)
}

function now() {
  return new Date().toISOString()
}

// ========== 账号管理 ==========

/**
 * 获取所有注册账号
 */
export function getAllAccounts() {
  return load(ACCOUNTS_KEY, {})
}

/**
 * 保存所有账号数据
 */
function saveAllAccounts(accounts) {
  return save(ACCOUNTS_KEY, accounts)
}

/**
 * 注册新账号
 * @param {string} phone - 手机号
 * @param {string} password - 密码
 * @param {string} nickname - 昵称
 * @returns {object} { success, message, user }
 */
export function register(phone, password, nickname) {
  if (!phone || !phone.trim()) {
    return { success: false, message: '请输入手机号' }
  }
  if (!/^1\d{10}$/.test(phone.trim())) {
    return { success: false, message: '手机号格式不正确' }
  }
  if (!password || password.length < 6) {
    return { success: false, message: '密码至少6位' }
  }

  const accounts = getAllAccounts()

  if (accounts[phone.trim()]) {
    return { success: false, message: '该手机号已注册，请直接登录' }
  }

  const user = {
    id: generateId(),
    phone: phone.trim(),
    nickname: nickname || phone.trim().slice(0, 3) + '***' + phone.trim().slice(-4),
    password,
    avatar: '',
    shopName: '',
    shopPhone: phone.trim(),
    shopAddress: '',
    createdAt: now(),
    updatedAt: now()
  }

  accounts[user.phone] = user
  saveAllAccounts(accounts)

  // 自动登录
  setCurrentUser(user)

  return { success: true, message: '注册成功', user }
}

/**
 * 登录（手机号+密码）
 * @param {string} phone - 手机号
 * @param {string} password - 密码
 * @returns {object} { success, message, user }
 */
export function login(phone, password) {
  if (!phone || !phone.trim()) {
    return { success: false, message: '请输入手机号' }
  }

  const accounts = getAllAccounts()
  const user = accounts[phone.trim()]

  if (!user) {
    return { success: false, message: '该手机号未注册，请先注册' }
  }

  // 密码兼容：已有用户 password 为 undefined 时允许任意密码登录
  if (user.password !== undefined && user.password !== password) {
    return { success: false, message: '密码错误' }
  }

  setCurrentUser(user)

  return { success: true, message: '登录成功', user }
}

/**
 * 账号名/手机号+密码 登录
 * @param {string} account - 账号名或手机号
 * @param {string} password - 密码
 * @returns {object} { success, message, user }
 */
export function loginByAccount(account, password) {
  if (!account || !account.trim()) {
    return { success: false, message: '请输入账号' }
  }

  const accounts = getAllAccounts()

  // 先按手机号精确匹配
  let user = accounts[account.trim()]

  // 未找到则按 nickname 或 phone 字段模糊匹配
  if (!user) {
    const matched = Object.values(accounts).find(u =>
      (u.nickname && u.nickname === account.trim()) ||
      (u.phone && u.phone === account.trim())
    )
    user = matched || null
  }

  if (!user) {
    return { success: false, message: '账号未注册，请先注册' }
  }

  // 密码兼容：已有用户 password 为 undefined 时允许任意密码登录
  if (user.password !== undefined && user.password !== password) {
    return { success: false, message: '密码错误' }
  }

  setCurrentUser(user)

  return { success: true, message: '登录成功', user }
}

/**
 * 获取当前登录用户
 */
export function getCurrentUser() {
  return load(ACCOUNT_KEY, null)
}

/**
 * 设置当前登录用户
 */
function setCurrentUser(user) {
  save(ACCOUNT_KEY, user)
}

/**
 * 退出登录
 */
export function logout() {
  localStorage.removeItem(ACCOUNT_KEY)
  return true
}

/**
 * 更新店铺设置
 * @param {object} updates - { shopName, shopPhone, shopAddress }
 * @returns {object} { success, user }
 */
export function updateShopSettings(updates) {
  const user = getCurrentUser()
  if (!user) {
    return { success: false, message: '未登录' }
  }

  // 更新当前用户缓存
  const updatedUser = {
    ...user,
    shopName: updates.shopName !== undefined ? updates.shopName : user.shopName,
    shopPhone: updates.shopPhone !== undefined ? updates.shopPhone : user.shopPhone,
    shopAddress: updates.shopAddress !== undefined ? updates.shopAddress : user.shopAddress,
    nickname: updates.nickname !== undefined ? updates.nickname : user.nickname,
    updatedAt: now()
  }

  setCurrentUser(updatedUser)

  // 同步更新 accounts 列表
  const accounts = getAllAccounts()
  if (accounts[user.phone]) {
    accounts[user.phone] = updatedUser
    saveAllAccounts(accounts)
  }

  return { success: true, user: updatedUser }
}

/**
 * 更新用户头像缩写
 */
export function updateAvatar(avatar) {
  const user = getCurrentUser()
  if (!user) return { success: false }
  const updated = { ...user, avatar, updatedAt: now() }
  setCurrentUser(updated)
  const accounts = getAllAccounts()
  if (accounts[user.phone]) {
    accounts[user.phone] = updated
    saveAllAccounts(accounts)
  }
  return { success: true, user: updated }
}

/**
 * 获取用户头像缩写（昵称前1-2个字）
 */
export function getAvatarText(user) {
  if (!user) return ''
  if (user.avatar) return user.avatar
  // 取昵称前2个字
  const name = user.nickname || user.phone || ''
  const cleaned = name.replace(/[^a-zA-Z\u4e00-\u9fa5]/g, '')
  return cleaned.slice(0, 2) || name.slice(0, 2) || '?'
}

/**
 * 导出所有业务数据
 */
export function exportAllData() {
  const data = {}
  const keys = ['xdb_inventory', 'xdb_members', 'xdb_consumption', 'xdb_copy_history']
  keys.forEach(key => {
    try {
      data[key] = JSON.parse(localStorage.getItem(key))
    } catch {
      data[key] = null
    }
  })
  data.exportedAt = now()
  return JSON.stringify(data, null, 2)
}

/**
 * 导入业务数据（覆盖式）
 */
export function importAllData(jsonStr) {
  try {
    const data = JSON.parse(jsonStr)
    const keys = ['xdb_inventory', 'xdb_members', 'xdb_consumption', 'xdb_copy_history']
    let count = 0
    keys.forEach(key => {
      if (data[key] !== undefined) {
        localStorage.setItem(key, JSON.stringify(data[key]))
        count++
      }
    })
    return { success: true, message: `已导入 ${count} 项数据` }
  } catch (e) {
    return { success: false, message: '数据格式错误：' + e.message }
  }
}

/**
 * 清空所有业务数据（保留账号）
 */
export function clearAllBusinessData() {
  const keys = ['xdb_inventory', 'xdb_members', 'xdb_consumption', 'xdb_copy_history', 'xdb_settings']
  keys.forEach(key => localStorage.removeItem(key))
  return { success: true, message: '已清空所有业务数据' }
}
