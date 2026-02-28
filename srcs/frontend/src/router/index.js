import Home from '@/pages/Home.vue'

import SignIn from '@/pages/SignIn.vue'
import SignUp from '@/pages/SignUp.vue'
import PrivacyPolicy from '@/pages/PrivacyPolicy.vue'
//** LOBBY **
import Lobby from '@/pages/Lobby.vue'
import SingleSetupView from '@/pages/SingleSetupView.vue'
import MultiplayerSetupView from '@/pages/MultiplayerSetupView.vue'

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: Home },
    { path: '/login', component: SignIn },
    { path: '/sign_up', component: SignUp },
    { path: '/privacy_policy', component: PrivacyPolicy },
    { path: '/lobby', component: Lobby, meta: { bodyClass: 'bg-lobby' } },
    { path: '/single/setup', component: SingleSetupView },
    { path: '/multiplayer/setup', component: MultiplayerSetupView},
  ],
})

export default router
