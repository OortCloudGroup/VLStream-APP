<template>
  <div ref="chart" :class="className" />
</template>
<script setup lang="ts">
// 按需导入需要用到的 vue函数 和 echarts
import { onMounted, onBeforeUnmount, watch, ref } from 'vue'
import * as echarts from 'echarts'
// 获取 dom 和 父组件数据 并定义"myChart"用于初始化图表
let myChart: echarts.ECharts
const props = defineProps({
  className: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  fullOptions: {
    type: Object,
    default: () => ({}),
    required: true
  }
})

const emit = defineEmits(['click'])

// 重绘图表函数
const resizeHandler = () => {
  myChart.resize()
}
// 设置防抖，保证无论拖动窗口大小，只执行一次获取浏览器宽高的方法
const debounce = (fun: { (): void; (): void; }, delay: number | undefined) => {
  let timer: any
  return function() {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fun()
    }, delay)
  }
}
const cancalDebounce = debounce(resizeHandler, 50)

const chart = ref<HTMLElement | null>(null)
// 页面成功渲染，开始绘制图表
onMounted(() => {
  // 配置为 svg 形式，预防页面缩放而出现模糊问题；图表过于复杂时建议使用 Canvas
  myChart = echarts.init(chart.value, { renderer: 'svg' })
  myChart.showLoading({
    text: '',
    textColor: '#000',
    zlevel: 0,
    lineWidth: 2
  })
  if (!props.loading) {
    myChart.hideLoading()
    myChart.setOption(props.fullOptions, true)
  }
  // 添加点击事件监听
  myChart.on('click', (params) => {
    emit('click', params)
  })
  console.log(props.fullOptions)
  // 自适应不同屏幕时改变图表尺寸
  window.addEventListener('resize', cancalDebounce)
})
// 页面销毁前，销毁事件和实例
onBeforeUnmount(() => {
  window.removeEventListener('resize', cancalDebounce)
  myChart.dispose()
})
// 监听图表数据时候变化，重新渲染图表
watch(() => [props.fullOptions, props.loading], () => {
  if (!props.loading) {
    myChart.hideLoading()
    myChart.setOption(props.fullOptions, true)
  }
  if (props.fullOptions) {
    myChart.setOption(props.fullOptions, true)
  }
}, { deep: true })
</script>
