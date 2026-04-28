import Home from '@/pages/Home.vue'
import SignIn from '@/pages/SignIn.vue'
import SignUp from '@/pages/SignUp.vue'
import PrivacyPolicy from '@/pages/PrivacyPolicy.vue'
import Chat from '@/pages/Chat.vue'
//** LOBBY **
import Lobby from '@/pages/Lobby.vue'
import ChooseQuiz from '@/pages/ChooseQuiz.vue'
import Game from '@/pages/Game.vue'
import GameLeaderboard from '@/pages/GameLeaderboard.vue'
import CreateJoinRoom from '@/pages/CreateJoinRoom.vue'
import JoinRoom from '@/pages/JoinRoomID.vue'
import LandingPage from '@/pages/LandingPage.vue'
import Profile from '@/pages/Profile.vue'

import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: LandingPage, meta: { layout: 'public' } },
    { path: '/login', component: SignIn, meta: { layout: 'public' } },
    { path: '/sign_up', component: SignUp, meta: { layout: 'public' } },
    { path: '/privacy_policy', component: PrivacyPolicy, meta: { layout: 'public' } },
    { path: '/home', component: Home, meta: { bodyClass: 'bg-lobby', layout: 'auth' } },
    { path: '/chat', component: Chat, meta: { layout: 'auth' } },
    { path: '/choose-quiz', component: ChooseQuiz, meta: { layout: 'auth' } },
    { path: '/game/:sessionId?', name: 'Game', component: Game, meta: { layout: 'auth' } },
    { path: '/leaderboard', component: GameLeaderboard, meta: { layout: 'auth' } },
    { path: '/multiplayer-create-join-room', component: CreateJoinRoom, meta: { layout: 'auth' } },
    { path: '/join-room', component: JoinRoom, meta: { layout: 'auth' } },
    { path: '/lobby', component: Lobby, meta: { layout: 'auth' } },
    { path: '/profile', component: Profile, meta: { layout: 'auth' } },
    { path: '/profile/:userId', component: Profile, meta: { layout: 'auth' } },
  ],
})

export default router
