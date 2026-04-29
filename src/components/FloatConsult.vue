<template>
  <view class="float-consult" @click="handleClick">
    <text class="float-icon">💬</text>
    <text class="float-text">免费咨询</text>
  </view>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { makePhoneCall, getContactInfo } from '@/utils/phone.js'
import { showToast } from '@/utils/bridge.js'

const router = useRouter()

function handleClick() {
  // H5用简单的菜单代替
  const action = window.confirm('选择操作:\n确定 = 立即拨号\n取消 = 其他选项')
  if (action) {
    makePhoneCall(getContactInfo().phone)
  } else {
    const other = window.confirm('确定 = 填写需求\n取消 = 关于小店宝')
    if (other) {
      router.push('/contact')
    } else {
      router.push('/about')
    }
  }
}
</script>

<style scoped>
/* ═══ 浮动咨询按钮 - 现代化设计 ═══ */
.float-consult {
  position: fixed;
  right: 32rpx;
  bottom: 160rpx;
  width: 132rpx;
  height: 132rpx;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-2xl);
  border: 2px solid rgba(255, 255, 255, 0.2);
  z-index: 999;
  cursor: pointer;
  transition: all var(--transition-normal);
  animation: pulse 2s infinite;
}

.float-consult:active {
  transform: scale(0.92);
  box-shadow: var(--shadow-3xl);
}

.float-consult::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.float-consult:active::before {
  opacity: 1;
}

.float-icon {
  font-size: 40rpx;
  margin-bottom: 6rpx;
  filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.2));
}

.float-text {
  font-size: 20rpx;
  color: var(--text-white);
  font-weight: var(--font-semibold);
  letter-spacing: 0.5rpx;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.3);
}

@keyframes pulse {
  0% {
    box-shadow: var(--shadow-2xl);
  }
  50% {
    box-shadow: 0 0 0 10rpx rgba(249, 115, 22, 0.2);
  }
  100% {
    box-shadow: var(--shadow-2xl);
  }
}
</style>