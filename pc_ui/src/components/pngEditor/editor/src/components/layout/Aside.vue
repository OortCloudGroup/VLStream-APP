<template>
  <div class="es-layout-aside">
    <slot>
      <el-collapse v-model="activeNames">
        <el-collapse-item title="通用" name="1">
          <div class="collapse-content">
            <div
              v-for="item in config.componentList"
              :key="item.text"
              class="es-block"
              draggable="true"
              @dragstart="dragstart($event, item)"
              @dragend="dragend"
            >
              <Icon :name="item.text" />
              <span class="block-text">{{ item.text }}</span>
            </div>
          </div>
        </el-collapse-item>
        <el-collapse-item title="图标" name="2">
          <div class="collapse-content">
            <div
              v-for="item in config.iconList"
              :key="item.props.icon"
              class="es-block"
              draggable="true"
              @dragstart="dragstart($event, item)"
              @dragend="dragend"
            >
              <EsIcon :icon="item.props.icon" v-bind="item.props" />
              <!-- <component
                :is="item.component"
                v-if="item.component"
                v-bind="item.props"
              />
              <template v-else>
                {{ item.props.icon }}
              </template> -->
            </div>
          </div>
        </el-collapse-item>
        <!-- <el-collapse-item title="其他" name="3">
          <div class="collapse-content">
            <div
              v-for="item in config.otherList"
              class="es-block"
              draggable="true"
              @dragstart="dragstart($event, item)"
              @dragend="dragend"
            >
              <span class="block-text">{{ item.text }}</span>
            </div>
          </div>
        </el-collapse-item> -->
      </el-collapse>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { registerConfig as config } from '../../utils/editor-config'
import { ComponentType } from '../../types'
import Icon from '../common/svgIcon/Icon.vue'
import EsIcon from '../icon/icon.vue'

const emit = defineEmits(['dragstart', 'dragend'])

const activeNames = ref(['1', '2', '3'])

function dragstart(e: DragEvent, component: ComponentType) {
  let width = 50
  let height = 50
  if (component.component !== 'EsIcon') {
    width = component.width || (e.target as HTMLElement).offsetWidth
    height = component.height || (e.target as HTMLElement).offsetHeight
  }
  emit('dragstart', {
    ...component,
    width,
    height
  })
}

function dragend() {
  emit('dragend')
}
</script>

<style lang="scss">
.es-layout-aside {
  flex-shrink: 0;
  width: var(--es-layout-aside-width);
  height: 100%;
  border-right: var(--es-border);
  background-color: var(--es-color-bg);
  overflow-y: auto; /* 添加垂直滚动 */
  background-color: #ffffff;
  border-right: 1px solid #f7f7f7;

  .el-collapse-item__header {
    padding: 0 10px;
  }

  .collapse-content {
    padding: 8px 12px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    overflow-y: auto;
    max-height: calc(100vh - 50px);

    .es-block {
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid #e2e2e2;
      border-radius: 2px;
      width: 45%;
      height: 40px;
      margin-bottom: 10px;
      cursor: grab;
      background-color: var(--el-bg-color);

      .block-text {
        margin-left: 6px;
      }
    }
  }
}
</style>
