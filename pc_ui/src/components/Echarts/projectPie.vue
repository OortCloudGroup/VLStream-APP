<template>
  <comm-echarts
    id="pieEcharts"
    class="chartWH"
    :full-options="fullPtions"
  />
</template>
<script lang='ts' setup>
import CommEcharts from '@/components/Echarts/commEcharts.vue'
import { onMounted, ref } from 'vue'

const props = defineProps(['data', 'color', 'dimensions'])
const fullPtions = ref({})
const optionData = {
  testOption(data: any, dimensions: any) {
    const option = {
      legend: {
        orient: 'vertical',
        bottom: 60,
        left: 80,
        textStyle: { // 图例文字的样式
          color: '#000',
          fontSize: 12
        }
      },
      tooltip: {
        trigger: 'item',
        formatter(params: any) {
          return `${params.value[dimensions[0]]}:${params.value[dimensions[1]]}`
        }
      },
      dataset: {
        dimensions: dimensions,
        source: data
      },
      series: [
        {
          type: 'pie',
          center: ['50%', '35%'],
          radius: ['40%', '75%'],
          itemStyle: {
            borderRadius: 1,
            color: function(params: any) {
              // 自定义颜色
              const colorList = props.color
              return colorList[params.dataIndex]
            }
          },
          avoidLabelOverlap: false,
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 40,
              fontWeight: 'bold'
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
