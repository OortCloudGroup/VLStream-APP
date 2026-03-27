<template>
  <comm-echarts
    id="barrEcharts"
    class="chartWH"
    :full-options="fullPtions"
  />
</template>
<script lang='ts' setup>
import CommEcharts from './commEcharts.vue'
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
        }

      },
      dataset: {
        dimensions: dimensions,
        source: data
      },
      xAxis: {
        show: false,
        type: 'value'
      },
      yAxis: {
        show: true,
        type: 'category',
        split: { show: true },
        axisLine: {
          show: false// 不展示坐标轴
        },
        axisTick: {
          show: false// 不展示刻度
        },
        splitLine: {
          show: false // 不显示分割线
        },
        axisLabel: {
          color: '#fff'
        }
      },
      series: [
        {
          type: 'bar',
          smooth: true,
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'right',
            // offset: [100,0],
            itemStyle: { // 数值样式
              color: 'black', // 字体颜色
              fontSize: 10// 字体大小
            },
            color: '#fff',
            fontFamily: 'TencentSans'
          },
          itemStyle: {
            borderRadius: [10, 10, 10, 10],
            color: {
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [{
                offset: 0, color: '#3978E6' // 0% 处的颜色
              }, {
                offset: 1, color: '#30CAFF' // 100% 处的颜色
              }],
              global: false // 缺省为 false
            }
          },

          emphasis: {
            label: {
              show: true,
              fontSize: 40,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
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
