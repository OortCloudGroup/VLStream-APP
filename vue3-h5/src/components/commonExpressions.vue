<template>
  <div class="common_wrapper">
    <div class="add_common_btn" @click="addCommonOpinion">
      <van-icon name="plus" class="add_common_btn_icon" />
      {{ $t('添加为常用语') }}
    </div>
    <div class="common_btn_list">
      <div v-for="(item,index) in listData" :key="index" class="common_content">
        <div @click="clickContent(item.content)">
          {{ item.content }}
        </div>
        <img class="common_close" src="@/assets/img/patrolManagement/delete.png" alt="" @click="delCommonOpinion(item.id)" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { myOpinionList, myOpinionDel, myOpinionSave } from '@/api/unifiedUsert/logManage'
import { defineProps, onMounted, ref, defineEmits } from 'vue'
import { useUserStore } from '@/store/modules/useraPaas'
const store = useUserStore()
const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})
const listData = ref([])
const getCommonOpinionsList = async() => {
  const params = {
    accessToken: store.token,
    is_open: 0, // 0 个人 1 公开
    page: 0,
    pagesize: 999
  }
  const res = await myOpinionList(params)
  if (res.code === 200) {
    listData.value = res.data.list
  }
}
const addCommonOpinion = async() => {
  const params = {
    accessToken: store.token,
    content: props.content,
    is_open: 0
  }
  const res = await myOpinionSave(params)
  if (res.code === 200) {
    getCommonOpinionsList()
  }
}
const delCommonOpinion = async(id) => {
  const params = {
    accessToken: store.token,
    id: id
  }
  const res = await myOpinionDel(params)
  if (res.code === 200) {
    getCommonOpinionsList()
  }
}
onMounted(() => {
  getCommonOpinionsList()
})
const emit = defineEmits(['selectContent'])
const clickContent = (content) => {
  emit('selectContent', content)
}
</script>
<style scoped lang="scss">
.common_wrapper {
  width: 100%;
}

/* 常用语：白色描边胶囊按钮 + 主色浅底胶囊 */
.add_common_btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 30px;
  padding: 0 12px;
  box-sizing: border-box;
  font-size: 12px;
  font-weight: 500;
  color: var(--vl-ink);
  background: #ffffff;
  border: 1px solid var(--vl-line);
  border-radius: 999px;

  .add_common_btn_icon {
    font-size: 14px;
  }

  &:active {
    background: var(--vl-surface-2);
  }
}

.common_btn_list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;

  &:not(:empty) {
    margin-top: 10px;
  }
}

.common_content {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  min-height: 30px;
  padding: 4px 8px 4px 12px;
  box-sizing: border-box;
  font-size: 12px;
  line-height: 18px;
  color: var(--vl-primary);
  background: var(--vl-primary-soft);
  border-radius: 999px;

  &:active {
    opacity: 0.7;
  }
}

.common_close {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  opacity: 0.7;
}
</style>
