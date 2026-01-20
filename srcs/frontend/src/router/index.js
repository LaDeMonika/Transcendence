import SignIn from '@/pages/SignIn.vue'
import SignUp from '@/pages/SignUp.vue'
import Home from '@/pages/Home.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    { path: '/login', component: SignIn },
    { path: '/sign_up', component: SignUp },
  ],
})

export default router
