/**
 * 跨平台桥接工具
 * 目前运行在 H5/浏览器环境，后续原样可用于 Uni-app
 * 将对 uni 的调用映射为浏览器实现
 */

export function showToast(msg, type = 'none') {
  if (typeof uni !== 'undefined' && uni.showToast) {
    uni.showToast({ title: msg, icon: type })
    return
  }
  // H5 fallback
  const el = document.createElement('div')
  el.textContent = msg
  el.style.cssText = `
    position: fixed; top: 20%; left: 50%; transform: translateX(-50%);
    background: rgba(0,0,0,0.8); color: #fff;
    padding: 16rpx 32rpx; border-radius: 12rpx;
    font-size: 26rpx; z-index: 9999;
    max-width: 80%; text-align: center;
    transition: opacity 0.3s;
  `
  document.body.appendChild(el)
  setTimeout(() => {
    el.style.opacity = '0'
    setTimeout(() => document.body.removeChild(el), 300)
  }, 2000)
}

export function setClipboard(text, successMsg = '已复制') {
  if (typeof uni !== 'undefined' && uni.setClipboardData) {
    uni.setClipboardData({
      data: text,
      success: () => showToast(successMsg, 'success')
    })
    return
  }
  // H5 fallback
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg)
  }).catch(() => {
    // 降级方案
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    showToast(successMsg)
  })
}

export function shareText(text, title = '分享') {
  if (typeof uni !== 'undefined' && uni.share !== undefined) {
    // Uni-app环境
    return
  }
  // H5 fallback: 复制到剪贴板
  setClipboard(text, '✅ 已复制，可以粘贴分享了')
}

export function makePhoneCall(phoneNumber) {
  if (!phoneNumber || phoneNumber === '186xxxxxxxx') {
    showToast('暂未设置联系电话')
    return
  }
  if (typeof uni !== 'undefined' && uni.makePhoneCall) {
    uni.makePhoneCall({ phoneNumber })
    return
  }
  // H5 fallback: 显示号码
  setClipboard(phoneNumber, '号码已复制，请到拨号盘粘贴拨打')
}
