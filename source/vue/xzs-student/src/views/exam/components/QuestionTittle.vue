<template>
  <div style="line-height: 2" :style="computedStyle">
    <div v-if="qType == 10 || qType==11 || qType==12" v-loading="qLoading" class="question-layout">
      <div class="q-title" v-html="question.title"></div>
    </div>
    <div v-if="qType == 20" v-loading="qLoading" class="question-layout">
      <div class="q-title" v-html="question.title"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionShow',
  props: {
    question: {
      type: Object,
      default: function () {
        return {}
      }
    },
    qLoading: {
      type: Boolean,
      default: false
    },
    qType: {
      type: Number,
      default: 0
    },
    scale: {
      type: Number,
      default: 1
    }
  },
  methods: {
  },
  computed: {
    computedStyle() {
      return {
        transform: `scale(${this.scale})`,
        transformOrigin: 'top left', // 设置缩放的原点在左上角
        position: 'absolute', // 绝对定位
        top: '0px', // 根据需要设置位置
        left: '0px',
        transition: 'transform 0.3s' // 添加过渡效果
      }
    }
  }
}
</script>
<style scoped>
.question-layout {
  display: flex;
  width: 100%;
}
.q-item-span-content {
  font-size: 16px; /* 设置字体大小为16px */
}
</style>
