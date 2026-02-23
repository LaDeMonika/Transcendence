import SignIn from '@/pages/SignIn.vue'
import SignUp from '@/pages/SignUp.vue'
import PrivacyPolicy from '@/pages/PrivacyPolicy.vue'
import Home from '@/pages/Home.vue'
import Chat from '@/pages/Chat.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    { path: '/login', component: SignIn },
    { path: '/sign_up', component: SignUp },
    { path: '/privacy_policy', component: PrivacyPolicy },
    { path: '/chat', component: Chat },
  ],
})

export default router
