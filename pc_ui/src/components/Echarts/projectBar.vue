<template>
  <comm-echarts
    id="barEcharts"
    class="chartWH"
    :full-options="fullPtions"
  />
</template>
<script lang='ts' setup>
import CommEcharts from '@/components/Echarts/commEcharts.vue'
import { onMounted, ref } from 'vue'

const props = defineProps(['data', 'dimensions'])
const fullPtions = ref({})
const optionData = {
  testOption(data: any, dimensions: any) {
    const option = {
      grid: {
        left: '10%',
        right: '10%',
        top: '20%',
        bottom: '10%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter(params: any) {
          return `${params[0].value[dimensions[0]]} :${params[0].value[dimensions[1]]}`
        }
      },
      dataset: {
        dimensions: dimensions,
        source: data
      },
      xAxis: {
        show: true,
        type: 'category',
        axisLabel: {
          interval: 0,
          color: '#fff'
        },
        axisLine: {
          show: false// 不展示坐标轴
        },
        axisTick: {
          show: false// 不展示刻度
        },
        splitLine: {
          show: false // 不显示分割线
        }
      },
      yAxis: {
        show: false,
        type: 'value'
      },
      series: [
        {
          type: 'bar',
          itemStyle: {
            color: {
              x: 0,
              y: 1,
              x2: 0,
              y2: 0,
              colorStops: [{
                offset: 0, color: '#1B6FC9' // 0% 处的颜色
              }, {
                offset: 1, color: '#3DE4D8' // 100% 处的颜色
              }],
              global: false // 缺省为 false
            }
          },
          label: {
            show: true,
            position: 'top',
            itemStyle: { // 数值样式
              color: 'black', // 字体颜色
              fontSize: 10// 字体大小
            },
            color: '#fff',
            fontFamily: 'TencentSans'
          },
          encode: {
            //   itemName: dimensions[0],
            //   value: dimensions[1],
            tooltip: dimensions[1]
          }
        }
      ]
    }
    return option
  }
}
onMounted(() => {
  fullPtions.value = optionData.testOption(props.data, props.dimensions)
})
</script>
<style lang='scss' scoped>
.chartWH {
  width: 100%;
  height: 100%;
}
</style>
