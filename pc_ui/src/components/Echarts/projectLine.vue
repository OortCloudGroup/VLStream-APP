<template>
  <comm-echarts
    id="lineEcharts"
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
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          },
          crossStyle: {
            color: '#fff'
          }
        },
        formatter(params: any) {
          return `${params[0].value[dimensions[0]]}${dimensions[2]} :${params[0].value[dimensions[1]]}`
        }
      },
      dataset: {
        dimensions: dimensions,
        source: data
      },
      xAxis: {
        show: true,
        name: dimensions[2],
        nameTextStyle: {
          color: '#fff',
          fontSize: 12
        },
        interval: 0,
        type: 'category',
        axisLine: {
          interval: 0,
          lineStyle: {
            color: '#fff'
          }
        },
        axisLabel: {
          color: '#fff'
        }
      },
      yAxis: {
        show: true,
        name: dimensions[3],
        nameTextStyle: {
          color: '#fff',
          fontSize: 12
        },
        type: 'value',
        axisLabel: {
          color: '#fff'
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: ['rgba(255,255,255,0.27)']
          }
        }
      },
      series: [
        {
          type: 'line',
          smooth: true,
          symbol: 'emptyCircle',
          symbolSize: 6,
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          itemStyle: {
            color: '#1B6FC9',
            borderWidth: 1,
            borderColor: '#fff'
          },
          lineStyle: {
            color: '#1B6FC9'
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
          },
          encode: {
            x: dimensions[0],
            y: dimensions[1]
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: '#027AFF' // 0% 处的颜色
              }, {
                offset: 1, color: 'rgba(2,122,255,0)' // 100% 处的颜色
              }],
              global: false // 缺省为 false
            }
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
