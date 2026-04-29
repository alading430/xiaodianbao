/**
 * 小店宝 - AI文案生成引擎
 * 
 * 基于行业/商品类型的模板组合系统
 * 每个文案由：开头 + 商品描述 + 亮点 + 行动号召 + 标签 五段组合生成
 * 支持多种风格、自动换词、随机组合避免重复
 */

// ===== 词汇库 =====

const OPENERS = {
  direct: [
    '刚到货的', '新到的', '新鲜出炉的', '刚进来的', '新一批',
    '刚到一批', '新到货', '今天刚到的'
  ],
  friendly: [
    '家人们，', '老铁们，', '亲们，', '各位街坊，', '朋友们，',
    '邻居们，', '亲爱的小伙伴们，'
  ],
  promo: [
    '🔥 特价啦！', '🔥 福利来了！', '🎉 大优惠！', '💥 限时特价！',
    '⚡ 老板发话了！', '🎊 好消息！'
  ],
  warm: [
    '做街坊生意这么多年，', '开店这么多年，', '老话说得好，',
    '咱们做生意的讲究实在，', '一家小店，一份真心，'
  ],
  short: [
    '✅ 到货！', '📦 新到！', '⚡ 上新！', '🎯 来了！'
  ]
}

const COMMODITY_TEMPLATES = [
  '{name}',
  '咱家的{name}',
  '{name}（品质保证）',
  '这批{name}',
  '精选{name}',
  '正宗{name}',
  '新鲜{name}',
  '{name}，好东西不等人'
]

const HIGHLIGHTS = {
  direct: [
    '品质有保证，价格也实在。',
    '新鲜好吃，价格公道。',
    '质量杠杠的，价格还实惠。',
    '都是精挑细选的，放心买。'
  ],
  friendly: [
    '品质有保证，价格也实在，快点来看看吧～',
    '都给你们留着呢，来晚可就没啦！',
    '亲自尝过的，不好吃包退！',
    '特意挑的好货，就等你们来～'
  ],
  promo: [
    '买就送小礼品！手慢无！',
    '比平时便宜好多，错过再等一个月！',
    '今天下单额外赠送，数量有限！',
    '老板说了，这批不赚钱交个朋友！'
  ],
  warm: [
    '靠的就是实在。好东西不愁没人识，',
    '顾客的满意就是我最大的动力，',
    '每一个都是精心挑选的，不能让大家失望，'
  ],
  short: [
    '数量不多，懂的自然懂',
    '手慢拍大腿',
    '先到先得，后到只能看',
    '来晚了可别怪我'
  ]
}

const CALL_TO_ACTIONS = [
  '欢迎新老顾客进店品尝！',
  '店里还有更多好货，欢迎来看看！',
  '欢迎大家过来坐坐～',
  '快点来店里看看吧！',
  '还有什么想吃的，进店聊！',
  '随时欢迎来店，茶泡好了等你！'
]

const TAGS = [
  '#小店宝 #好物推荐 #本地生活',
  '#新鲜到店 #福利 #白城美食',
  '#良心推荐 #街坊生意 #小店',
  '#特价 #实惠 #好货推荐',
  '#本地美食 #新品上市'
]

const EMOJI_MAP = {
  direct: ['🎉', '✅', '📢', '👍'],
  friendly: ['😄', '❤️', '🥰', '😊'],
  promo: ['🔥', '💥', '⚡', '🎊'],
  warm: ['💝', '☕', '🌸', '🌟'],
  short: ['🏃‍♂️💨', '⚡', '🎯', '✅']
}

// ===== 工具函数 =====

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randN(arr, n = 1) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

// 检测商品类型，返回 emoji
function detectEmoji(name) {
  const map = {
    '草莓|樱桃|苹果|香蕉|葡萄|橙子|西瓜|水果|芒果|荔枝|桃子': '🍓',
    '牛肉|羊肉|猪肉|鸡腿|排骨|五花肉|里脊|肉|香肠|腊肉|火腿': '🥩',
    '白菜|萝卜|土豆|西红柿|黄瓜|茄子|辣椒|青菜|蔬菜|生菜|豆角': '🥬',
    '啤酒|白酒|饮料|矿泉水|可乐|雪碧|果汁|酸奶|牛奶|茶': '🥤',
    '面包|蛋糕|饼干|零食|薯片|糖果|巧克力|瓜子|花生|坚果': '🍪',
    '大米|面粉|食用油|酱油|醋|盐|糖|调料|料酒': '🍚',
    '螺丝|钉子|扳手|钳子|工具|五金|水管|电线|灯泡|开关': '🔧',
    '衣服|裤子|鞋子|帽子|围巾|袜子|包包': '👕',
    '手机|充电器|耳机|数据线|手机壳|贴膜': '📱'
  }
  for (const [pattern, emoji] of Object.entries(map)) {
    if (new RegExp(pattern).test(name)) return emoji
  }
  return '🎁'
}

// ===== 主生成函数 =====

/**
 * 根据商品名称和风格生成一条文案
 * @param {string} productName - 商品或活动名称
 * @param {string} style - 风格: direct/friendly/promo/warm/short
 * @returns {string} 完整文案
 */
function generateSingle(productName, style) {
  const emoji = productName ? detectEmoji(productName) : '🎁'
  const emojis = EMOJI_MAP[style] || ['🎉']
  const es = emojis.join(' ')
  const nameWithEmoji = productName + ' ' + emoji

  const opener = rand(OPENERS[style] || OPENERS.direct)
  const commodity = rand(COMMODITY_TEMPLATES).replace('{name}', nameWithEmoji)
  const highlight = rand(HIGHLIGHTS[style] || HIGHLIGHTS.direct)
  const cta = rand(CALL_TO_ACTIONS)
  const tags = rand(TAGS)

  switch (style) {
    case 'direct':
      return `${es} ${opener}${commodity}，${highlight}${cta} ${es}\n\n${tags}`
    case 'friendly':
      return `${opener}${commodity}，${highlight}${cta} ${es}\n\n${tags}`
    case 'promo':
      return `${opener}${commodity}，${highlight}${cta} ${es}\n\n${tags}`
    case 'warm':
      return `${opener}${commodity}，${highlight}欢迎新老顾客来坐坐～ ${es}\n\n${tags}`
    case 'short':
      return `${es} ${opener}${commodity}${rand(['！', '‼️', '❗', '🚀'])} ${rand(HIGHLIGHTS.short)} ${es}\n\n${tags}`
    default:
      return `${es} ${opener}${commodity}，${highlight}${cta}\n\n${tags}`
  }
}

/**
 * 生成全部风格文案
 * @param {string} productName 
 * @returns {Array<{tag:string, text:string}>}
 */
export function generateCopies(productName) {
  if (!productName || !productName.trim()) return []

  const styles = [
    { id: 'direct', tag: '📢 直白版', icon: '📢' },
    { id: 'friendly', tag: '😄 亲切版', icon: '😄' },
    { id: 'promo', tag: '🔥 促销版', icon: '🔥' },
    { id: 'warm', tag: '💝 温情版', icon: '💝' },
    { id: 'short', tag: '🎯 短句版', icon: '🎯' }
  ]

  return styles.map(s => ({
    tag: s.tag,
    text: generateSingle(productName, s.id)
  }))
}

/**
 * 按风格筛选生成
 */
export function generateByStyle(productName, styleId) {
  if (!productName || !productName.trim()) return null
  const styles = {
    direct: '📢 直白版',
    friendly: '😄 亲切版',
    promo: '🔥 促销版',
    warm: '💝 温情版',
    short: '🎯 短句版'
  }
  return {
    tag: styles[styleId] || '📢 直白版',
    text: generateSingle(productName, styleId || 'direct')
  }
}
