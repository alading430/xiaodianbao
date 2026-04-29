import { makePhoneCall as bridgeCall, setClipboard, showToast } from './bridge.js'

// 拨号
export { makePhoneCall } from './bridge.js'

// 复制
export function copyToClipboard(text, successMsg = '已复制') {
  setClipboard(text, successMsg)
}

// 获取联系信息
export function getContactInfo() {
  return {
    phone: '13039360430',
    wechatQrCode: '/static/images/qr-wechat.jpg',
    address: '白城市',
    serviceHours: '9:00 - 21:00'
  }
}
