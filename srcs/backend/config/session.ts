// config/session.ts
import { defineConfig, stores } from '@adonisjs/session'

export default defineConfig({
  /**
   * Default store name
   */
  store: 'cookie',

  /**
   * Session cookie name
   */
  cookieName: 'adonis-session',

  clearWithBrowser: false,

  cookie: {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // set true behind HTTPS
  },

  /**
   * Store definitions
   */
  stores: {
    cookie: stores.cookie(),
  },
})