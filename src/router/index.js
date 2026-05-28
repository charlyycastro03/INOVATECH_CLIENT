import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/AdminLogin.vue')
  },
  {
    path: '/helpdesk/settings/notifications',
    name: 'NotifSettings',
    component: () => import('../views/NotifSettings.vue')
  },
  {
    path: '/helpdesk/kpis',
    name: 'Kpis',
    component: () => import('../views/Kpis.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue')
  },
  {
    path: '/survey/:trackingId',
    name: 'Survey',
    component: () => import('../views/Survey.vue')
  }
]


const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
