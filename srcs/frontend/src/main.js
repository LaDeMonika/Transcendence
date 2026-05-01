import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle'
import 'bootstrap-vue-next/dist/bootstrap-vue-next.css'
import { createBootstrap } from 'bootstrap-vue-next/plugins/createBootstrap'
import { setUnauthorizedHandler } from '@/services/client.js'

const app = createApp(App)

app.use(createBootstrap())
app.use(router)

setUnauthorizedHandler(() => {
  router.push('/login')
})

app.mount('#app')
