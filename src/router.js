export default [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/pages/index/index.vue'),
    meta: { title: 'XiaoShop', tab: true }
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('@/pages/inventory/index.vue'),
    meta: { title: '管库存' }
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('@/pages/members/index.vue'),
    meta: { title: '记会员' }
  },
  {
    path: '/copywriting',
    name: 'Copywriting',
    component: () => import('@/pages/copywriting/index.vue'),
    meta: { title: 'AI写文案' }
  },
  {
    path: '/features',
    name: 'Features',
    component: () => import('@/pages/features/index.vue'),
    meta: { title: '核心功能', tab: true }
  },
  {
    path: '/features/:featureId',
    name: 'FeatureDetail',
    component: () => import('@/pages/features/index.vue'),
    meta: { title: '核心功能' }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('@/pages/contact/index.vue'),
    meta: { title: '联系我们', tab: true }
  },
  {
    path: '/industry/:id',
    name: 'IndustryDetail',
    component: () => import('@/pages/industry-detail/index.vue'),
    meta: { title: '行业方案' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/pages/about/index.vue'),
    meta: { title: '关于小店宝' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/profile/index.vue'),
    meta: { title: '个人中心', tab: true }
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('@/pages/auth/index.vue'),
    meta: { title: '登录/注册' }
  }
]
