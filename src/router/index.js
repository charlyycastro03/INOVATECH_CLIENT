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

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('clientToken')
  const rawUser = localStorage.getItem('clientUser')

  // Paths that require authentication
  const authRequiredRoutes = ['/dashboard', '/helpdesk/kpis', '/helpdesk/settings/notifications']
  const adminOnlyRoutes = ['/helpdesk/kpis', '/helpdesk/settings/notifications']

  if (authRequiredRoutes.includes(to.path)) {
    if (!token || !rawUser) {
      return next('/login')
    }

    if (adminOnlyRoutes.includes(to.path)) {
      try {
        const parsedUser = JSON.parse(rawUser)
        const email = parsedUser.email || parsedUser.Email || ''
        const role = parsedUser.role || parsedUser.RoleID || ''
        const isAdminOrInovatech = email.endsWith('@inovatech.com.mx') || email === 'charlyycastro03@inovatech.com.mx' || role === 'ADMIN' || role === 1

        if (!isAdminOrInovatech) {
          return next('/dashboard')
        }
      } catch (e) {
        return next('/login')
      }
    }
  }

  next()
})

export default router
