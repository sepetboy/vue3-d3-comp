<template>
  <div class="real-time-virus">
    <div class="virus-header">
      <div class="virus-header-icon"></div>
      <div class="virus-header-title">实时病毒快报</div>
      <div
        class="virus-header-button"
        :class="[isDesensitization ? 'button-hidden' : 'button-visible']"
        @click="handleDesensitization"
      ></div>
    </div>
    <div
      class="virus-list"
      @mouseenter="handlerMouseenter"
      @mouseleave="handlerMouseleave"
    >
      <div class="new-list">
        <VirusListItem
          :item="item"
          class="new-list-item pointer"
          :class="[isAnimation ? 'slide-item' : '']"
          v-for="(item, index) in newList"
          :key="item.orgid + index"
          @click.native="handleClick(item)"
          @animationend.native="onAnimationEnd"
        />
      </div>
      <div class="old-list">
        <VirusListItem
          class="old-list-item"
          v-for="(item, index) in oldList"
          :key="item.iorgid + index"
          :item="item"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { useMouse2Overflow } from "@/hooks"
import VirusListItem from './list-item.vue'
import { getVirusList } from '@/api/business.js'
const { mouseenter, mouseleave} = useMouse2Overflow()
let timestamp = 0

export default {
  components: {
    VirusListItem
  },
  fdx: {
    states: {
      virusDetail: "project.virusDetail",
      virusDetailVisible: "project.virusDetailVisible"
    }
  },
  data() {
    return {
      allList: [],
      newList: [],
      oldList: [],
      timer: null,
      isAnimation: true,
      isDesensitization: false//是否脱敏
    }
  },
  methods: {
    async fetchData() {
      let result = await getVirusList({
        size: 10,
        timestamp
      })
      if(!Array.isArray(result) || Array.isArray(result) && result.length == 0) return
      timestamp = result?.[0]?.timestamp ?? 0
      // 如果要脱敏
      if(this.isDesensitization) {
        result = this.handleDesensitizationList(result)
      }
      this.allList = [...result, ...this.allList].slice(0, 200)
      this.generateRenderList()
    },
    generateRenderList() {
      this.newList = this.allList.slice(0, 8)
      this.oldList = this.allList.slice(8)
    },
    handlerMouseenter(e) {
      this.timer && clearTimeout(this.timer)
      this.timer = null
      mouseenter(e, 'overflowY')
      this.isAnimation = false
    },
    handlerMouseleave(e) {
      mouseleave(e, 'overflowY')
      this.timer && clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.isAnimation = true
      }, 5000)
    },
    // 动画结束后清除slide-item，请求到数据以后再重新添加动画
    async onAnimationEnd() {
      this.isAnimation = false
      await this.fetchData()
      console.log("onAnimationEnd")
      this.isAnimation = true
    },
    // 处理脱敏
    handleDesensitization() {
      this.isDesensitization = !this.isDesensitization
      this.allList = this.handleDesensitizationList(this.allList)
      this.generateRenderList()
    },
    // 加密列表
    handleDesensitizationList(list) {
      return list.map(item => {
        let account_name = item?.custom_info?.account_name ??''
        let origin_account_name = item?.custom_info?.origin_account_name ??''
        // 存一份数据用于恢复
        if(origin_account_name === '') {
          origin_account_name = account_name
        }
        if(this.isDesensitization) {
          account_name = this.handleCompanyDesensitization(account_name)
        } else {
          account_name = origin_account_name
        }
        return {
          ...item,
          custom_info: {
            ...item.custom_info,
            account_name,
            origin_account_name
          }
        }
      })
    },
    // 脱密
    handleCompanyDesensitization(name = "") {
      const prefixLen = 2
      const midLen = 2
      const prefix = name.slice(0, prefixLen)
      let encryption = ''
      for(let i = 0; i < midLen; i++) {
        encryption += '*'
      }
      const tail = name.slice(prefixLen+midLen)
      return prefix + encryption + tail
    },
    handleClick(item) {
      this.virusDetail = {
        mailware_class_cn: item.mailware_class_cn || '-',
        ip: item?.ext_info?.client_ip || '-',
        city : item?.location?.city || '-',
        account_name : item?.custom_info?.account_name || '-',
        malware_name: item?.malware_name || '-',
        os: item?.ext_info?.os || '-',
        osv: (item?.ext_info?.os && item?.ext_info?.osv) ? (item?.ext_info?.os + item?.ext_info?.osv) : '-',
        md5sha1: item?.ext_info?.md5sha1 || '-',
        file_size: item?.ext_info?.file_size ? (item?.ext_info?.file_size + 'B') : '-',
        file_name: item?.ext_info?.file_name || '-',
      }
      this.virusDetailVisible = true
    }
  },
  async mounted() {
    this.fetchData()
  }
}
</script>

<style lang="less" scoped>
@import '../../assets/style/slide.less';
.real-time-virus {
  .virus-header {
    width: 444px;
    height: 35px;
    background: url('@/assets/title.png') no-repeat;
    background-size: contain;
    position: relative;
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;
    &-icon {
      width: 20px;
      height: 17px;
      background: url('@/assets/message.svg') no-repeat;
      background-size: contain;
      margin-right: 8px;
      margin-left: 30px;
    }
    &-title {
      line-height: 14px;
      font-family: PingFangSC-Regular;
      font-size: 22px;
      color: #FFFFFF;
      font-weight: 400;
      flex: 1;
      width: 0;
    }
    &-button {
      width: 30px;
      height: 19px;
      margin-right: 50px;
      position: relative;
      bottom: 0px;
      cursor: pointer;
      &.button-visible {
        background: url('@/assets/visible.svg') no-repeat;
        background-size: contain;
      }
      &.button-hidden {
        height: 21px;
        background: url('@/assets/hidden.svg') no-repeat;
        background-size: contain;
        bottom: 2px;
      }
    }
  }
  .virus-list {
    width: 380px;
    height: 876px;
    margin: 0 auto;
    overflow: hidden;
    .new-list {
      margin-bottom: 15.32px;
      .slide-right-once(8);
    }
  }
}
</style>
