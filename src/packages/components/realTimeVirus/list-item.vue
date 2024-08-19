<template>
  <div class="list-item">
    <div class="time">{{item.datetime }}</div>
    <div class="company">
      <div
        class="company-city"
        :title="item.location ? item.location.city : ''"
      >
        {{item.location ? item.location.city : ''}}
      </div>
      <div
        class="company-name"
        :title="item.custom_info ? item.custom_info.account_name : ''"
      >
        {{ item.custom_info.account_name }}
      </div>
    </div>
    <div class="virus">
      <div class="virus-type" :title="item.mailware_class_cn">
        {{item.mailware_class_cn}}
      </div>
      <div class="virus-name" :title="item.malware_name">
        {{ item.malware_name }}
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from '@vue/composition-api'
import { useDayjs } from '@/hooks'

export default defineComponent({
  props: {
    item: {
      type: Object,
      default: () => {}
    }
  },
  setup() {
    const {formattedData} = useDayjs()
    return {
      transformTimestamp: (timestamp) => formattedData(timestamp),
    }
  },
})
</script>

<style lang="scss" scoped>
.list-item {
  width: 380px;
  height: 96px;
  // opacity: 0.6;
  background: rgba(55,125,207,0.30);
  box-shadow: inset 0 1px 0 0 #43A5FF;
  border-radius: 3px;
  padding: 8px 20px 11px;
  margin-bottom: 15.32px;
  .time {
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #A1D4FF;
    font-weight: 400;
    margin-bottom: 8px;
  }
  .company {
    display: flex;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #FFFFFF;
    font-weight: 400;
    margin-bottom: 8px;
    &-city {
      width: 68px;
      margin-right: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    &-name {
      flex: 1;
      width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .virus {
    display: flex;
    align-items: center;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #D6EEFF;
    font-weight: 400;
    &-type {
      width: 68px;
      text-align: center;
      background: rgba(75,150,255,0.20);
      border: 1px solid #4B96FF;
      border-radius: 2px;
      margin-right: 14px;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    &-name {
      flex: 1;
      width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
