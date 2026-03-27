import { App } from 'vue'
import Rect from './basic/Rect.vue'
import Group from './editor/Group.vue'
import EsIcon from './icon/icon.vue'
import Area from './editor/Area.vue'
import GridRect from './editor/GridRect.vue'
import MarkLine from './editor/MarkLine.vue'
import TextEditor from './editor/TextEditor.vue'
import Chart from './basic/chart/Chart.vue'
export {
  Group,
  Area,
  GridRect,
  MarkLine,
  TextEditor
}
export default {
  install: (app: App) => {
    app.component('EsChart', Chart)
    app.component('VRect', Rect)
    app.component('EsIcon', EsIcon)
    app.component('EsGroup', Group)
  }
}
