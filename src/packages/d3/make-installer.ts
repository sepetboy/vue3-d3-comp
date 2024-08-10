import { INSTALLED_KEY } from '../constants'
// import { version } from './version'

import type { App, Plugin } from 'vue'

export const makeInstaller = (components: Plugin[] = []) => {
  const install = (app: App & Record<typeof INSTALLED_KEY, any>) => {
    if(app[INSTALLED_KEY]) return
    app[INSTALLED_KEY] = true
    components.forEach(c => app.use(c))
  }

  return {
    version: "0.0.0",
    install
  }
}