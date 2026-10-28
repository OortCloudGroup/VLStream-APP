<template>
  <div class="add-govern">
    <nav-header-banner title="新增治理" :is-call-back="true" @call-back="onBack" />
    <div class="add_content">
      <van-form class="form">
        <!-- 治理名称 -->
        <van-field v-model="formData.name" placeholder="请输入治理名称" class="addMargin">
          <template #left-icon>
            <img :src="fxqy" alt="必填" class="required-icon" />
          </template>
        </van-field>

        <div class="divider">
          <div class="half-pixel-line" />
        </div>

        <!-- 治理模式 -->
        <div class="mode-row">
          <div class="mode-label">
            <img :src="fxqy" alt="必填" class="required-icon" /> 治理模式
          </div>
          <div class="mode-radio">
            <van-radio-group v-model="formData.mode" direction="horizontal">
              <van-radio name="now">
                即时治理
              </van-radio>
              <van-radio name="loop">
                循环治理
              </van-radio>
            </van-radio-group>
          </div>
        </div>

        <div class="divider">
          <div class="half-pixel-line" />
        </div>

        <!-- 起止/循环时间 -->
        <template v-if="formData.mode === 'now'">
          <!-- 即时治理：时间范围样式和逻辑与分析申请一致 -->
          <div class="time-range-section">
            <img :src="rq" alt="" class="section-icon" />
            <div class="time-range-item">
              <div class="time-label-row">
                <span class="section-title">开始</span>
              </div>
              <div class="time-fields">
                <van-field
                  v-model="formData.startDate"
                  is-link
                  readonly
                  placeholder="日期"
                  class="time-field"
                  @click="showStartDatePicker = true"
                />
                <van-field
                  v-model="formData.startTime"
                  is-link
                  readonly
                  placeholder="时间"
                  class="time-field"
                  @click="showStartTimePicker = true"
                />
              </div>
            </div>
            <div class="time-arrow" />
            <div class="time-range-item">
              <div class="time-label-row">
                <span class="section-title">结束</span>
              </div>
              <div class="time-fields">
                <van-field
                  v-model="formData.endDate"
                  is-link
                  readonly
                  placeholder="日期"
                  class="time-field"
                  @click="showEndDatePicker = true"
                />
                <van-field
                  v-model="formData.endTime"
                  is-link
                  readonly
                  placeholder="时间"
                  class="time-field"
                  @click="showEndTimePicker = true"
                />
              </div>
            </div>
          </div>

          <!-- 开始/结束时间选择弹窗（用原生 van-popup，oort-popup 销毁插槽会让连续打开的下一个选择器失效） -->
          <van-popup v-model:show="showStartDatePicker" position="bottom" round>
            <van-date-picker v-model="startDateParts" @confirm="onStartDateConfirm" @cancel="showStartDatePicker = false" />
          </van-popup>
          <van-popup v-model:show="showStartTimePicker" position="bottom" round>
            <van-time-picker
              v-model="startTimeParts"
              :columns-type="['hour', 'minute', 'second']"
              @confirm="onStartTimeConfirm"
              @cancel="showStartTimePicker = false"
            />
          </van-popup>
          <van-popup v-model:show="showEndDatePicker" position="bottom" round>
            <van-date-picker v-model="endDateParts" @confirm="onEndDateConfirm" @cancel="showEndDatePicker = false" />
          </van-popup>
          <van-popup v-model:show="showEndTimePicker" position="bottom" round>
            <van-time-picker
              v-model="endTimeParts"
              :columns-type="['hour', 'minute', 'second']"
              @confirm="onEndTimeConfirm"
              @cancel="showEndTimePicker = false"
            />
          </van-popup>
        </template>
        <template v-else>
          <!-- 循环治理：模仿循环巡查任务的时间设置 -->
          <van-field readonly label-align="top">
            <template #input>
              <div class="maintainTime">
                <!-- 每天 / 隔天 / 每周 / 每月 -->
                <div class="timeButBox">
                  <div
                    class="timeBut"
                    :class="{ butActive: localEvery === 'every' }"
                    @click="updateEvery('every')"
                  >
                    每天
                  </div>
                  <div
                    class="timeBut"
                    :class="{ butActive: localEvery === 'next' }"
                    @click="updateEvery('next')"
                  >
                    隔天
                  </div>
                  <div
                    class="timeBut"
                    :class="{ butActive: localEvery === 'week' }"
                    @click="updateEvery('week')"
                  >
                    每周
                  </div>
                  <div
                    class="timeBut"
                    :class="{ butActive: localEvery === 'month' }"
                    @click="updateEvery('month')"
                  >
                    每月
                  </div>
                </div>

                <div class="timeSelectBox">
                  <!-- 开始时间 -->
                  <van-field
                    v-model="loopForm.start_at"
                    label-width="80px"
                    required
                    label="开始时间"
                    class="taskDesc"
                    readonly
                    @click="startDatePicker = true"
                  >
                    <template #input>
                      <div class="custom-input">
                        <img :src="noto" alt="时间图标" class="input-icon" />
                        <span v-if="!loopForm.start_at" class="placeholder-text">选择日期时间</span>
                        <span v-else>{{ loopForm.start_at }}</span>
                      </div>
                    </template>
                  </van-field>
                  <oort-popup v-model="startDatePicker" position="bottom">
                    <van-calendar v-model:show="startDatePicker" :min-date="minStartDate" @confirm="onDateConfirm" />
                  </oort-popup>

                  <!-- 触发时间：可多条，带加减 -->
                  <div class="triggerTimeSelect">
                    <div
                      v-for="(time, index) in loopForm.loop_time"
                      :key="index"
                      class="timeItem"
                    >
                      <van-field
                        v-model="loopForm.loop_time[index]"
                        label-width="80px"
                        :label="index === 0 ? '触发时间' : ''"
                        class="taskDesc"
                        readonly
                        @click="openTimePicker(index)"
                      >
                        <template #input>
                          <div class="custom-input">
                            <img :src="noto" alt="时间图标" class="input-icon" />
                            <span v-if="!loopForm.loop_time[index]" class="placeholder-text">00:00:00</span>
                            <span v-else>{{ loopForm.loop_time[index] }}</span>
                          </div>
                        </template>
                      </van-field>
                      <div class="minusAddBox">
                        <img
                          v-if="loopForm.loop_time.length > 1"
                          src="@/assets/img/maintenanceManagement/minus.png"
                          alt=""
                          class="minusAdd"
                          @click="removeTime(index)"
                        />
                        <img
                          src="@/assets/img/maintenanceManagement/add.png"
                          alt=""
                          class="minusAdd"
                          @click="addTime"
                        />
                      </div>
                    </div>
                  </div>
                  <oort-popup v-model="triggerTimePicker" position="bottom">
                    <van-time-picker
                      :columns-type="['hour', 'minute', 'second']"
                      @confirm="onTimeConfirm"
                      @cancel="triggerTimePicker = false"
                    />
                  </oort-popup>

                  <!-- 隔天 / 每周 / 每月的“每隔” -->
                  <van-field
                    v-if="localEvery === 'next'"
                    :model-value="loopForm.loop_gap.toString()"
                    label-width="80px"
                    type="number"
                    label="每隔"
                    class="custom-input"
                    placeholder="0"
                    @input="onLoopGapInput"
                  >
                    <template #right-icon>
                      <span class="timeUnit">天</span>
                    </template>
                  </van-field>

                  <van-field
                    v-if="localEvery === 'week'"
                    :model-value="loopForm.loop_gap.toString()"
                    label-width="80px"
                    type="number"
                    label="每隔"
                    class="custom-input"
                    placeholder="0"
                    @input="onLoopGapInput"
                  >
                    <template #right-icon>
                      <span class="timeUnit">周</span>
                    </template>
                  </van-field>

                  <!-- 每周：勾选星期 -->
                  <van-field
                    v-if="localEvery === 'week'"
                    label-width="80px"
                    required
                    label="星期"
                    class="taskDesc"
                    readonly
                  >
                    <template #input>
                      <div class="day-picker">
                        <div
                          v-for="day in weekDayOptions"
                          :key="day.value"
                          class="day-chip"
                          :class="{ active: loopForm.weekly_days.includes(day.value) }"
                          @click="toggleWeekDay(day.value)"
                        >
                          {{ day.label }}
                        </div>
                      </div>
                    </template>
                  </van-field>

                  <!-- 每月：勾选日期 -->
                  <van-field
                    v-if="localEvery === 'month'"
                    label-width="80px"
                    required
                    label="日期"
                    class="taskDesc"
                    readonly
                  >
                    <template #input>
                      <div class="day-picker">
                        <div
                          v-for="day in monthDayOptions"
                          :key="day"
                          class="day-chip"
                          :class="{ active: loopForm.monthly_days.includes(day) }"
                          @click="toggleMonthDay(day)"
                        >
                          {{ day }}
                        </div>
                      </div>
                    </template>
                  </van-field>

                  <!-- 结束时间 -->
                  <van-field
                    v-model="loopForm.end_at"
                    label-width="80px"
                    required
                    label="结束时间"
                    class="taskDesc"
                    readonly
                    @click="endDatePicker = true"
                  >
                    <template #input>
                      <div class="custom-input">
                        <img :src="noto" alt="时间图标" class="input-icon" />
                        <span v-if="!loopForm.end_at" class="placeholder-text">选择日期时间</span>
                        <span v-else>{{ loopForm.end_at }}</span>
                      </div>
                    </template>
                  </van-field>
                  <oort-popup v-model="endDatePicker" position="bottom">
                    <van-calendar v-model:show="endDatePicker" :min-date="minEndDate" @confirm="onLoopEndDateConfirm" />
                  </oort-popup>

                  <!-- 提示说明 -->
                  <div class="tipBox">
                    <van-icon name="warning-o" />
                    <span>
                      说明：在开始时间点触发后，在设置时间间隔天数后的当天内按设置的时间点触发任务，直到截止时间
                      （截止时间无法一直执行）
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </van-field>
        </template>

        <div class="divider">
          <div class="half-pixel-line" />
        </div>

        <!-- 分析区域 -->
        <div class="section">
          <div class="section-header">
            <span class="section-label">
              <img :src="fxql" alt="" class="section-icon" />
              分析区域
            </span>
            <img :src="add" alt="" class="section-add" @click="onAddArea" />
          </div>
          <div class="tag-list">
            <div v-for="(item, index) in formData.areas" :key="index" class="tag">
              {{ item }}
              <img
                :src="del"
                alt=""
                class="tag-delete"
                @click="removeArea(index)"
              />
            </div>
          </div>
        </div>

        <!-- 分析区域选择弹窗（级联） -->
        <van-popup
          v-model:show="showAreaPopup"
          position="bottom"
          style="width: 100%;height: 60%;"
          round
        >
          <div class="area-popup-wrapper">
            <div class="area-popup-header">
              <span class="area-popup-cancel" @click="onAreaCancel">取消</span>
              <span class="area-popup-title">选择分析区域</span>
              <span class="area-popup-confirm" @click="onAreaConfirm">确定</span>
            </div>
            <div class="area-popup-content">
              <van-cascader
                v-model="tempAreaCascaderValue"
                :options="areaOptions"
                @change="onAreaChange"
                @finish="onAreaFinish"
              />
            </div>
          </div>
        </van-popup>

        <!-- 单租户无区域服务，分析区域改为手填 -->
        <oort-popup v-model="showAreaInput" position="bottom" style="width: 100%;">
          <div class="area-input-popup">
            <div class="area-input-header">
              <span @click="showAreaInput = false">取消</span>
              <span class="area-input-title">输入分析区域</span>
              <span class="area-input-confirm" @click="onAreaInputConfirm">确定</span>
            </div>
            <van-field
              v-model="areaInput"
              placeholder="请输入分析区域名称"
              class="area-input-field"
            />
          </div>
        </oort-popup>

        <!-- AI 算法 -->
        <div class="section">
          <div class="section-header">
            <span class="section-label">
              <img :src="fxqy" alt="必填" class="required-icon" />
              AI算法
            </span>
            <img :src="add" alt="" class="section-add" @click="onAddAlgo" />
          </div>
          <div class="tag-list">
            <div v-for="(item, index) in formData.algos" :key="index" class="tag">
              {{ item }}
              <img
                src="@/assets/img/patrolManagement/delete.png"
                alt=""
                class="tag-delete"
                @click="removeAlgo(index)"
              />
            </div>
          </div>
        </div>

        <!-- 算法选择弹窗（级联：算法仓库 -> 算法） -->
        <van-popup
          v-model:show="showAlgoPopup"
          position="bottom"
          style="width: 100%;height: 60%;"
          round
        >
          <div class="area-popup-wrapper">
            <div class="area-popup-header">
              <span class="area-popup-cancel" @click="onAlgoCancel">取消</span>
              <span class="area-popup-title">选择算法</span>
              <span class="area-popup-confirm" @click="onAlgoConfirm">确定</span>
            </div>
            <div class="area-popup-content">
              <van-cascader
                v-model="tempAlgoCascaderValue"
                :options="algoOptions"
                @change="onAlgoChange"
                @finish="onAlgoFinish"
              />
            </div>
          </div>
        </van-popup>

        <!-- 摄像头 -->
        <div class="section">
          <div class="section-header">
            <span class="section-label">
              <img :src="sxt" alt="" class="section-icon" />
              摄像头
            </span>
            <img :src="add" alt="" class="section-add" @click="onAddCamera" />
          </div>
          <div class="tag-list">
            <div v-for="(item, index) in formData.cameras" :key="index" class="tag">
              {{ item }}
              <img
                :src="del"
                alt=""
                class="tag-delete"
                @click="removeCamera(index)"
              />
            </div>
          </div>
        </div>

        <!-- 摄像头选择弹窗 -->
        <van-popup
          v-model:show="showCameraPopup"
          position="bottom"
          style="width: 100%;height: 60%;"
          round
        >
          <div class="camera-popup-wrapper">
            <div class="camera-popup-header">
              <span class="camera-popup-cancel" @click="onCameraCancel">取消</span>
              <span class="camera-popup-title">选择摄像头</span>
              <span class="camera-popup-confirm" @click="onCameraConfirm">确定</span>
            </div>
            <div class="camera-popup-content">
              <van-checkbox-group v-model="tempCameras">
                <van-checkbox
                  v-for="item in deviceOptions"
                  :key="item.id"
                  :name="String(item.id)"
                  shape="square"
                  class="camera-checkbox"
                >
                  {{ item.deviceName }}
                </van-checkbox>
              </van-checkbox-group>
            </div>
          </div>
        </van-popup>

        <!-- 描述 -->
        <van-field
          v-model="formData.describe"
          type="textarea"
          placeholder="请输入分析描述"
          rows="4"
          class="taskDesc"
        />

        <!-- 常用语 -->
        <div class="common_expressions">
          <CommonExpressions :content="formData.describe" @selectContent="selectContent" />
        </div>
      </van-form>

      <!-- 底部按钮 -->
      <div class="submit-section">
        <van-button type="primary" block @click="submit">
          确认申请
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { saveVlsMobileSceneGovernanceImmediate, saveVlsMobileSceneGovernanceLoop } from '@/api/VLStreamCloud/sceneManagement'
import { getDeviceList } from '@/api/VLStreamCloud/device'
import { definitionDataGroupList } from '@/api/VLStreamCloud/region'
import { getVlsAlgorithmRepositoryt, getVlsAlgorithmt } from '@/api/VLStreamCloud/algorithm'
import config from '@/config'
import { useUserStore } from '@/store/modules/useraPaas'
import CommonExpressions from '@/components/commonExpressions.vue'
import OortPopup from '@/components/popup/oort_popup.vue'
import noto from '@/assets/img/patrolManagement/noto.png'
import fxqy from '@/assets/img/VLStreamCloud/fxqy.png'
import rq from '@/assets/img/VLStreamCloud/fxsq/rq.png'
import fxql from '@/assets/img/VLStreamCloud/fxsq/fxql.png'
import sxt from '@/assets/img/VLStreamCloud/fxsq/sxt.png'
import add from '@/assets/img/VLStreamCloud/fxsq/add.png'
import del from '@/assets/img/VLStreamCloud/fxsq/del.png'
import moment from 'moment/moment'
import { showToast } from 'vant'

const emit = defineEmits(['close'])

const props = defineProps({
  defaultMode: {
    type: String,
    default: 'now'
  }
})

const formData = ref({
  name: '',
  mode: props.defaultMode || 'now',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  areas: [],
  algos: [],
  cameras: [],
  describe: ''
})

const store = useUserStore()

// 单租户集群没有 apaas-location-service，分析区域级联没有数据源，改为手填名称
const isLocalAuth = config.authMode === 'local'

// 循环治理时间配置
const localEvery = ref('next')
const startDatePicker = ref(false)
const endDatePicker = ref(false)
const triggerTimePicker = ref(false)
const currentTimeIndex = ref(0)

// 即时治理时间选择
const showStartDatePicker = ref(false)
const showStartTimePicker = ref(false)
const showEndDatePicker = ref(false)
const showEndTimePicker = ref(false)

const pad2 = (value) => String(value).padStart(2, '0')
const todayParts = () => {
  const d = new Date()
  return [String(d.getFullYear()), pad2(d.getMonth() + 1), pad2(d.getDate())]
}
// 选择器默认停在今天/整点，而不是各列的第一个值
const startDateParts = ref(todayParts())
const endDateParts = ref(todayParts())
const startTimeParts = ref(['00', '00', '00'])
const endTimeParts = ref(['23', '59', '59'])

// 分析区域列表（级联）
const areaOptions = ref([])
const showAreaPopup = ref(false)
const areaCascaderValue = ref('')
const tempAreaCascaderValue = ref('')
const tempAreaSelectedOptions = ref([])
// 与 formData.areas 一一对应的区域 uid（后端 location_ids 存的是 ID 集合）
const selectedAreaIds = ref([])
const showAreaInput = ref(false)
const areaInput = ref('')

// 算法列表（级联：仓库 -> 算法）
const algoOptions = ref([])
const showAlgoPopup = ref(false)
const algoCascaderValue = ref('')
const tempAlgoCascaderValue = ref('')
const tempAlgoSelectedOptions = ref([])
const selectedAlgoIds = ref([])
const selectedAlgoNames = ref([])

// 设备列表
const deviceOptions = ref([])
const showCameraPopup = ref(false)
const tempCameras = ref([])
// 摄像头按 ID 选中，避免同名设备被合并；formData.cameras 只用于展示
const selectedCameraIds = ref([])

const loopForm = ref({
  start_at: '',
  end_at: '',
  loop_time: [''],
  loop_gap: 1,
  weekly_days: [],
  monthly_days: []
})

const weekDayOptions = [
  { value: 1, label: '一' },
  { value: 2, label: '二' },
  { value: 3, label: '三' },
  { value: 4, label: '四' },
  { value: 5, label: '五' },
  { value: 6, label: '六' },
  { value: 7, label: '日' }
]

const monthDayOptions = Array.from({ length: 31 }, (_v, i) => i + 1)

const toggleWeekDay = (value) => {
  const list = loopForm.value.weekly_days
  const index = list.indexOf(value)
  if (index === -1) {
    list.push(value)
  } else {
    list.splice(index, 1)
  }
}

const toggleMonthDay = (value) => {
  const list = loopForm.value.monthly_days
  const index = list.indexOf(value)
  if (index === -1) {
    list.push(value)
  } else {
    list.splice(index, 1)
  }
}

const minStartDate = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
})

const minEndDate = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (loopForm.value.start_at) {
    const startDate = new Date(loopForm.value.start_at)
    startDate.setHours(0, 0, 0, 0)
    return startDate > today ? startDate : today
  }

  return today
})

const removeArea = (index) => {
  formData.value.areas.splice(index, 1)
  selectedAreaIds.value.splice(index, 1)
}
const removeAlgo = (index) => {
  formData.value.algos.splice(index, 1)
  // 三个数组按下标一一对应，漏删会让 algorithmIds 和展示名错位
  selectedAlgoIds.value.splice(index, 1)
  selectedAlgoNames.value.splice(index, 1)
}
const removeCamera = (index) => {
  formData.value.cameras.splice(index, 1)
  selectedCameraIds.value.splice(index, 1)
}

const selectContent = (content) => {
  formData.value.describe = content
}

// 分析区域与摄像头逻辑（复用分析申请的实现）
const fetchDevices = async() => {
  try {
    const params = {
      accessToken: store.userInfo?.accessToken,
      current: 1,
      size: 200
    }
    const res = await getDeviceList(params)
    if (res && res.code === 200 && res.data && Array.isArray(res.data.records)) {
      deviceOptions.value = res.data.records
    } else {
      deviceOptions.value = []
    }
  } catch (e) {
    deviceOptions.value = []
  }
}

// 获取算法仓库（级联第一层）
const fetchAlgoRepos = async() => {
  try {
    // 后端默认只返回 10 条分页，不带 size 会悄悄漏掉后面的算法仓库
    const res = await getVlsAlgorithmRepositoryt({ current: 1, size: 200 })
    if (res && res.code === 200 && res.data && Array.isArray(res.data.records)) {
      algoOptions.value = res.data.records.map((item) => ({
        value: item.id, // 仓库ID
        text: item.name || '未命名算法库',
        children: []
      }))
    } else {
      algoOptions.value = []
    }
  } catch (e) {
    algoOptions.value = []
  }
}

// 获取分析区域列表（第一级）
const fetchAreas = async() => {
  // 单租户集群没有 apaas-location-service，请求只会变成一条 Network Error 提示
  if (isLocalAuth) {
    areaOptions.value = []
    return
  }
  const params = {
    accessToken: store.userInfo?.accessToken,
    group_type: 1,
    page: 1,
    pagesize: 99,
    puid: ''
  }
  try {
    const res = await definitionDataGroupList(params)
    if (res && res.code === 200 && res.data && Array.isArray(res.data.list)) {
      areaOptions.value = res.data.list.map((item) => ({
        value: item.uid,
        text: item.name,
        children: []
      }))
    } else {
      areaOptions.value = []
    }
  } catch (e) {
    areaOptions.value = []
  }
}

// 循环治理相关逻辑（简化自 RepetitiveTask）
const updateEvery = (value) => {
  localEvery.value = value
}

const openTimePicker = (index) => {
  currentTimeIndex.value = index
  triggerTimePicker.value = true
}

const addTime = () => {
  loopForm.value.loop_time.push(moment(new Date()).format('HH:mm:ss'))
}

const removeTime = (index) => {
  if (loopForm.value.loop_time.length > 1) {
    loopForm.value.loop_time.splice(index, 1)
  }
}

const onTimeConfirm = ({ selectedValues }) => {
  const timeString = selectedValues.join(':')
  loopForm.value.loop_time[currentTimeIndex.value] = timeString
  triggerTimePicker.value = false
}

const onDateConfirm = (values) => {
  loopForm.value.start_at = moment(values).format('YYYY-MM-DD')
  startDatePicker.value = false

  if (loopForm.value.end_at && moment(loopForm.value.start_at).isAfter(moment(loopForm.value.end_at))) {
    loopForm.value.end_at = moment(loopForm.value.start_at).add(1, 'days').format('YYYY-MM-DD')
  }
}

const onLoopEndDateConfirm = (values) => {
  loopForm.value.end_at = moment(values).format('YYYY-MM-DD')
  endDatePicker.value = false
}

const onLoopGapInput = (value) => {
  const numValue = parseInt(value, 10) || 0
  loopForm.value.loop_gap = numValue
}

// 即时治理时间选择逻辑（与分析申请保持一致）
const onStartDateConfirm = ({ selectedValues }) => {
  formData.value.startDate = Array.isArray(selectedValues) ? selectedValues.join('-') : selectedValues
  showStartDatePicker.value = false
}

const onStartTimeConfirm = ({ selectedValues }) => {
  formData.value.startTime = selectedValues.join(':')
  showStartTimePicker.value = false
}

const onEndDateConfirm = ({ selectedValues }) => {
  formData.value.endDate = Array.isArray(selectedValues) ? selectedValues.join('-') : selectedValues
  showEndDatePicker.value = false
}

const onEndTimeConfirm = ({ selectedValues }) => {
  formData.value.endTime = selectedValues.join(':')
  showEndTimePicker.value = false
}

// 级联点击时加载下一级区域
const onAreaChange = async({ selectedOptions }) => {
  tempAreaSelectedOptions.value = selectedOptions || []

  const opts = selectedOptions || []
  if (!opts.length) return
  const last = opts[opts.length - 1]
  if (!last || (Array.isArray(last.children) && last.children.length)) {
    return
  }

  const parentValue = last.value
  if (!parentValue) return

  const params = {
    accessToken: store.userInfo?.accessToken,
    group_type: 1,
    page: 1,
    pagesize: 99,
    puid: parentValue
  }
  try {
    const res = await definitionDataGroupList(params)
    if (res && res.code === 200 && res.data && Array.isArray(res.data.list) && res.data.list.length > 0) {
      last.children = res.data.list.map((item) => ({
        value: item.uid,
        text: item.name
      }))
    } else {
      delete last.children
    }
  } catch (e) {
    delete last.children
  }
}

// 级联选择完成时保存完整路径
const onAreaFinish = ({ selectedOptions }) => {
  tempAreaSelectedOptions.value = selectedOptions || []
}

// 取消选择区域
const onAreaCancel = () => {
  showAreaPopup.value = false
  tempAreaCascaderValue.value = ''
  tempAreaSelectedOptions.value = []
}

// 确认选择区域
const onAreaConfirm = () => {
  showAreaPopup.value = false
  const opts = tempAreaSelectedOptions.value || []
  const text = opts.map((opt) => opt.text).join('/')
  if (text && !formData.value.areas.includes(text)) {
    formData.value.areas.push(text)
    const leaf = opts[opts.length - 1]
    selectedAreaIds.value.push(leaf && leaf.value !== undefined ? String(leaf.value) : text)
  }
  areaCascaderValue.value = tempAreaCascaderValue.value
}

// 单租户手填分析区域
const onAreaInputConfirm = () => {
  const text = areaInput.value.trim()
  if (text && !formData.value.areas.includes(text)) {
    formData.value.areas.push(text)
    selectedAreaIds.value.push(text)
  }
  areaInput.value = ''
  showAreaInput.value = false
}

const onAddArea = () => {
  if (isLocalAuth) {
    showAreaInput.value = true
    return
  }
  if (!areaOptions.value.length) {
    fetchAreas()
  }
  tempAreaCascaderValue.value = areaCascaderValue.value
  tempAreaSelectedOptions.value = []
  showAreaPopup.value = true
}

const onAddCamera = () => {
  tempCameras.value = [...selectedCameraIds.value]
  showCameraPopup.value = true
}

const onCameraConfirm = () => {
  selectedCameraIds.value = [...tempCameras.value]
  const nameMap = {}
  ;(deviceOptions.value || []).forEach(item => {
    nameMap[String(item.id)] = item.deviceName
  })
  formData.value.cameras = tempCameras.value.map(id => nameMap[String(id)] || id)
  showCameraPopup.value = false
}

const onCameraCancel = () => {
  showCameraPopup.value = false
}

// 打开算法选择弹窗
const onAddAlgo = () => {
  if (!algoOptions.value.length) {
    fetchAlgoRepos()
  }
  tempAlgoCascaderValue.value = algoCascaderValue.value
  tempAlgoSelectedOptions.value = []
  showAlgoPopup.value = true
}

// 算法级联变更：选择仓库时按需加载算法列表
const onAlgoChange = async({ selectedOptions }) => {
  tempAlgoSelectedOptions.value = selectedOptions || []

  const opts = selectedOptions || []
  if (!opts.length) return

  if (opts.length > 1) {
    return
  }

  const last = opts[opts.length - 1]
  if (!last || (Array.isArray(last.children) && last.children.length)) {
    return
  }

  const repoId = last.value
  if (!repoId) return

  try {
    const res = await getVlsAlgorithmt({ repositoryId: repoId, current: 1, size: 200 })
    if (res && res.code === 200 && res.data && Array.isArray(res.data.records)) {
      last.children = res.data.records.map((item) => ({
        value: item.id,
        text: item.name || ''
      }))
    } else {
      last.children = []
    }
  } catch (e) {
    last.children = []
  }
}

// 算法级联选择完成
const onAlgoFinish = ({ selectedOptions }) => {
  tempAlgoSelectedOptions.value = selectedOptions || []
}

const onAlgoCancel = () => {
  showAlgoPopup.value = false
  tempAlgoCascaderValue.value = ''
  tempAlgoSelectedOptions.value = []
}

const onAlgoConfirm = () => {
  showAlgoPopup.value = false
  const opts = tempAlgoSelectedOptions.value || []
  if (!opts.length) return

  const leaf = opts[opts.length - 1]
  const leafId = leaf && leaf.value
  // 后端 algorithm_ids 只认数字 ID，没选到具体算法就确认等于没选
  if (opts.length < 2 || leafId === undefined || leafId === null) {
    showToast({ type: 'fail', message: '请选择到具体的算法' })
    return
  }

  const path = opts.map(o => o.text).filter(Boolean).join('/')
  if (!path || formData.value.algos.includes(path)) return

  formData.value.algos.push(path)
  selectedAlgoNames.value.push(path)
  selectedAlgoIds.value.push(String(leafId))

  algoCascaderValue.value = tempAlgoCascaderValue.value
}

// 组装通用治理参数
const buildBasePayload = () => {
  return {
    name: formData.value.name || '',
    governanceMode: formData.value.mode === 'now' ? 'immediate' : 'loop',
    cycleType: '',
    intervalDays: 0,
    weeklyDays: '',
    monthlyDays: '',
    startTime: '',
    endTime: '',
    triggerTimes: '',
    locationIds: (selectedAreaIds.value || []).join(','),
    algorithmIds: (selectedAlgoIds.value || []).join(','),
    cameraIds: (selectedCameraIds.value || []).join(','),
    description: formData.value.describe || '',
    algorithmNames: (selectedAlgoNames.value || []).join(','),
    cameraNames: (formData.value.cameras || []).join(',')
  }
}

const submit = async() => {
  if (!formData.value.name) {
    showToast({ type: 'fail', message: '请填写治理名称' })
    return
  }
  // 后端 validateCommon 这四个字段都是必填，先在前端拦住，避免只拿到一句接口报错
  if (!formData.value.areas.length) {
    showToast({ type: 'fail', message: '请选择分析区域' })
    return
  }
  if (!selectedAlgoIds.value.length) {
    showToast({ type: 'fail', message: '请选择AI算法' })
    return
  }
  if (!selectedCameraIds.value.length) {
    showToast({ type: 'fail', message: '请选择摄像头' })
    return
  }

  let payload = buildBasePayload()

  if (formData.value.mode === 'now') {
    const hasStartDate = !!formData.value.startDate
    const hasStartTime = !!formData.value.startTime
    const hasEndDate = !!formData.value.endDate
    const hasEndTime = !!formData.value.endTime

    if (!hasStartDate || !hasEndDate) {
      showToast({ type: 'fail', message: '请选择开始和结束日期' })
      return
    }

    const defaultTime = '00:00:00'

    const startDateTime = `${formData.value.startDate} ${hasStartTime ? formData.value.startTime : defaultTime}`
    const endDateTime = `${formData.value.endDate} ${hasEndTime ? formData.value.endTime : defaultTime}`

    if (moment(endDateTime).isBefore(moment(startDateTime))) {
      showToast({ type: 'fail', message: '结束时间不能早于开始时间' })
      return
    }

    payload.startTime = startDateTime
    payload.endTime = endDateTime

    try {
      const res = await saveVlsMobileSceneGovernanceImmediate(payload)
      if (res && (res.code === 200)) {
        showToast({ type: 'success', message: '新增即时治理成功' })
        emit('close')
      } else {
        showToast({ type: 'fail', message: res?.msg || '新增即时治理失败' })
      }
    } catch (e) {
      showToast({ type: 'fail', message: '请求失败，请稍后重试' })
    }
  } else {
    // 循环治理参数
    // 循环周期类型：everyday / everyOtherDay / weekly / monthly
    if (localEvery.value === 'every') {
      payload.cycleType = 'everyday'
    } else if (localEvery.value === 'next') {
      payload.cycleType = 'everyOtherDay'
      payload.intervalDays = loopForm.value.loop_gap || 0
      if (!payload.intervalDays || payload.intervalDays <= 0) {
        showToast({ type: 'fail', message: '隔天模式间隔天数必须大于0' })
        return
      }
    } else if (localEvery.value === 'week') {
      payload.cycleType = 'weekly'
      payload.weeklyDays = [...loopForm.value.weekly_days].sort((a, b) => a - b).join(',')
      if (!payload.weeklyDays) {
        showToast({ type: 'fail', message: '请选择每周执行日' })
        return
      }
    } else if (localEvery.value === 'month') {
      payload.cycleType = 'monthly'
      payload.monthlyDays = [...loopForm.value.monthly_days].sort((a, b) => a - b).join(',')
      if (!payload.monthlyDays) {
        showToast({ type: 'fail', message: '请选择每月执行日' })
        return
      }
    }

    if (!loopForm.value.start_at || !loopForm.value.end_at) {
      showToast({ type: 'fail', message: '请选择开始和结束时间' })
      return
    }

    const times = Array.isArray(loopForm.value.loop_time) ? loopForm.value.loop_time.filter(t => t) : []
    if (!times.length) {
      showToast({ type: 'fail', message: '请选择触发时间' })
      return
    }

    payload.startTime = `${loopForm.value.start_at} 00:00:00`
    payload.endTime = `${loopForm.value.end_at} 23:59:59`
    payload.triggerTimes = times.join(',')

    try {
      const res = await saveVlsMobileSceneGovernanceLoop(payload)
      if (res && (res.code === 0 || res.code === 200 || res.success === true)) {
        showToast({ type: 'success', message: '新增循环治理成功' })
        emit('close')
      } else {
        showToast({ type: 'fail', message: res?.msg || '新增循环治理失败' })
      }
    } catch (e) {
      showToast({ type: 'fail', message: '请求失败，请稍后重试' })
    }
  }
}

const onBack = () => {
  emit('close')
}

onMounted(() => {
  fetchDevices()
  fetchAreas()
})
</script>

<style scoped lang="scss">
.add-govern {
  height: 100vh;
  overflow: hidden;
  background: #f3f3f3;
}

.add_content {
  height: calc(100vh - 48px - 60px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 80px;
}

.form {
  background: #fff;
}

.divider {
  padding: 0 16px;
}

.half-pixel-line {
  height: 0.5px;
  background: #ebedf0;
}

.mode-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fff;
}

.mode-label {
  font-size: 14px;
  color: #999;
}

.mode-radio {
  font-size: 14px;
  color: #333;
}

/* 开始/结束时间样式 */
.time-range-section {
  padding: 16px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

.section-title {
  font-size: 14px;
  color: #969799;
}

.time-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.time-field {
  padding: 0;
}

.time-arrow {
  position: relative;
  width: 32px;
  height: 40px;
  margin: 0 24px;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1px;
    height: 32px;
    background: #b0bcc8;
    transform: translate(-50%, -50%) rotate(60deg);
  }
}

:deep(.time-field .van-cell__right-icon) {
  display: none;
}

.maintainTime {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.timeButBox {
  display: flex;
  align-items: center;
}

.timeBut {
  width: 60px;
  line-height: 20px;
  border-radius: 5px;
  background-color: #f6f6f6;
  text-align: center;
  margin: 10px 5px;
  font-size: 12px;
  color: #999999;
}

.butActive {
  background-color: #2f69f8;
  color: #fff;
}

.timeSelectBox {
  width: 300px;
  border: 1px solid #bababc;
  border-radius: 5px;
}

.timeSelectBox .van-field {
  width: 80%;
}

.triggerTimeSelect {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.timeItem {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 8px;
}

.minusAddBox {
  flex: 1;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.minusAdd {
  width: 20px;
  height: 20px;
}

.custom-input {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 30px;
}

.input-icon {
  width: 20px;
  height: 20px;
  margin-right: 3px;
  flex-shrink: 0;
}

.placeholder-text {
  color: #999999;
  font-size: 16px;
  font-weight: 500;
}

.timeUnit {
  color: #999;
  font-size: 14px;
  border-left: 1px solid #b6b6b8;
  padding: 0 10px;
}

.tipBox {
  align-items: flex-start;
  padding: 10px;
  margin: 10px;
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 6px;
  font-size: 12px;
  color: #1f84f0;
  line-height: 20px;
  font-weight: 400;
  gap: 8px;
  display: flex;

  .van-icon {
    font-size: 16px;
    color: #409eff;
    flex-shrink: 0;
    margin-top: 2px;
  }
}

.section {
  padding: 16px;
  background: #fff;
  margin-top: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-label {
  font-size: 14px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-add {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 6px 10px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  display: flex;
  align-items: center;
  column-gap: 6px;
}

.tag-delete {
  width: 14px;
  height: 14px;
}

.taskDesc :deep(.van-field__body) {
  margin-left: 5px !important;
}

.common_expressions {
  background-color: #fff;
  margin: 10px 10px 10px 25px;
  border-top: 1px solid #d8d8d8;
}

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.custom-required {
  color: #ee0a24;
  font-size: 14px;
  margin-right: 4px;
}

.required-icon {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

/* 摄像头选择弹窗样式 */
.camera-popup-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.camera-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  font-size: 14px;
}

.camera-popup-cancel,
.camera-popup-confirm {
  color: #1989fa;
}

.camera-popup-title {
  font-weight: 600;
  color: #323233;
}

.camera-popup-content {
  padding: 12px 16px 24px;
  overflow-y: auto;
}

.camera-checkbox {
  margin-bottom: 8px;
}

/* 分析区域级联弹窗样式 */
.area-popup-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.area-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  font-size: 14px;
}

.area-popup-cancel,
.area-popup-confirm {
  color: #1989fa;
}

.area-popup-title {
  font-weight: 600;
  color: #323233;
}

.area-popup-content {
  padding: 12px 16px 24px;
  overflow-y: auto;
  flex: 1;
}

/* 隐藏 van-cascader 的默认头部 */
:deep(.van-cascader__header) {
  display: none !important;
}

.day-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 0;
}

.day-chip {
  min-width: 28px;
  padding: 4px 8px;
  text-align: center;
  border-radius: 14px;
  background: #f2f4f8;
  color: #646566;
  font-size: 13px;
}

.day-chip.active {
  background: rgba(47, 105, 248, 1);
  color: #fff;
}

.area-input-popup {
  padding: 12px 16px 20px;
}

.area-input-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: #646566;
  margin-bottom: 12px;
}

.area-input-title {
  font-weight: 600;
  color: #323233;
}

.area-input-confirm {
  color: #1989fa;
}
</style>

