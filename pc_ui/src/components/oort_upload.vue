<!--
 *@Created by: 兰舰
 * Email: gglanjian@qq.com
 * Phone: 16620805419
 * @Date: 2024-11-15 11:45:51
 * @Last Modified by:  兰舰
 * @Copyright aPaaS-front-team. All rights reserved.
!-->
<template>
  <div class="oort-upload">
    <el-upload
      :action="uploadURL"
      :headers="headers"
      :accept="accept"
      :show-file-list="showFileList"
      :multiple="false"
      :on-success="handleSuccess"
      :before-upload="beforeUpload"
    >
      <slot name="uploader" />
      <div v-if="!uploader" class="avatar-uploader flexRowAC">
        <img v-if="photo && !showFileList" :src="photo" class="avatar1" />
        <div v-else class="licenseItem flexRowAC">
          <el-icon>
            <Plus />
          </el-icon>
          <div class="liTi">
            {{ tip }}
          </div>
        </div>
      </div>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import config from '@/config'
import { ElMessage } from 'element-plus'

const props = defineProps({
  dataObj: {
    type: Boolean,
    default: false
  },
  sizeTip: {
    type: String,
    default: '图片大小不能超过'
  },
  uploader: {
    type: Boolean,
    default: false
  },
  photo: {
    type: Object,
    default: () => ({})
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  sizeLimit: {
    type: Number,
    default: 2
  },
  tip: {
    type: String,
    default: '上传图片'
  },
  showFileList: {
    type: Boolean,
    default: false
  }
})

const headers = ref(config.headers)
const uploadURL = ref(config.URL + config.gateWay + 'oortcloud-fastdfsservice/fastdfs/v1/uploadFile')

const emits = defineEmits(['update:photo', 'dataObj'])
// 上传
const handleSuccess = (res) => {
  if (res.code === 200) {
    let data: any
    if (props.dataObj) data = res.data
    emits('update:photo', res.data.url, data)
  } else {
    ElMessage.error('上传失败')
  }
}

// 文件大小
const beforeUpload = (file) => {
  let isLimit = file.size / 1024 / 1024 < props.sizeLimit
  if (!isLimit) {
    ElMessage.error(props.sizeTip + props.sizeLimit + 'MB!')
  }
  return isLimit
}

</script>

<style lang="scss">
    .oort-upload {
        padding: 0px;
    }

    .oort-upload:hover {
      box-shadow: 0 2px 12px 0 var(--el-color-primary-hb);
    }

    .avatar-uploader {
        background: rgba(0, 0, 0, 0.02);
        border: 1px dashed rgba(0, 0, 0, 0.15);
        border-radius: 2px;

        .avatar1, .licenseItem {
            width: 100px;
            height: 100px;
            justify-content: center;
            flex-direction: column;
            gap: 14px;
            font-size: 14px;
            color: rgba(0,0,0,0.65);
            line-height: 22px;
            font-weight: 400;
        }

    .el-icon {
        font-size: 24px;
    }
  }

</style>
