import { ComponentType, IconType } from '../types'

function createEditorConfig() {
  const componentList: ComponentType[] = []
  const iconList: IconType[] = []
  const formList: ComponentType[] = []
  const dataList: ComponentType[] = []
  const otherList: ComponentType[] = []
  const componentMap = {}
  return {
    componentList,
    iconList,
    formList,
    dataList,
    otherList,
    componentMap,
    registerCommon(component: ComponentType) {
      componentList.push(component)
    },
    registerIcon(icon: IconType) {
      iconList.push(icon)
    },
    registerForm(component: ComponentType) {
      formList.push(component)
    },
    registerData(component: ComponentType) {
      dataList.push(component)
    },
    registerOther(component: ComponentType) {
      otherList.push(component)
    }
  }
}

export const registerConfig = createEditorConfig()

registerConfig.registerCommon({
  component: 'span',
  text: '文本',
  style: {
    fontSize: 18,
    color: '#333'
  }
})
registerConfig.registerCommon({
  component: 'div',
  text: '矩形',
  style: { border: '1px solid var(--el-text-color-primary)' }
})
registerConfig.registerCommon({
  component: 'div',
  text: '圆形',
  width: 100,
  height: 100,
  style: {
    border: '1px solid var(--el-text-color-primary)',
    borderRadius: '50%'
  }
})

registerConfig.registerOther({
  component: 'el-divider',
  text: '分割线'
})

registerConfig.registerOther({
  component: 'el-watermark',
  text: '水印'
})

// 注册icons
const icons = ['Plus', 'Minus', 'CirclePlus', 'Search', 'Female', 'Male']
icons.forEach(icon => {
  registerConfig.registerIcon({
    component: 'EsIcon',
    props: { icon }
  })
})
