import { App, Plugin } from 'vue'
export type { DragData, MarklineData } from './src/drager'
export { DragerProps } from './src/drager.ts'
import Drager from './src/drager.vue'

export const install = (app: App) => {
  app.component('EsDrager', Drager)
}

Drager.install = install

export { Drager as ESDrager }
export default Drager as Plugin & typeof Drager
