<template>
  <div style="line-height: 2" :style="computedStyle">
    <div v-if="qType == 10 || qType==11 || qType==12" v-loading="qLoading" class="question-layout">
      <div class="q-title" ref="qTitle" v-html="question.title" @mouseup="highlightText"></div>
    </div>
    <div v-if="qType == 20" v-loading="qLoading" class="question-layout">
      <div class="q-title" ref="qTitle" v-html="question.title" @mouseup="highlightText"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionTittle',
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
  data() {
    return {
      selectText: ''
    }
  },
  methods: {
    highlightText() {
      this.selectText = ''
      const selectedText = window.getSelection().toString()
      this.selectText = selectedText
    },
    highlight() {
      if (this.selectText) {
        this.question.title = this.question.title.replace('<span style="background-color: yellow;display: inline-block;">', '')
        this.question.title = this.question.title.replace('</span>', '')
        this.question.title = this.question.title.replace(this.selectText, `<span style="background-color: yellow;display: inline-block;">${this.selectText}</span>`)
        this.selectText = ''
      }
    },
    unhighlight() {
      this.question.title = this.question.title.replace('<span style="background-color: yellow;display: inline-block;">', '')
      this.question.title = this.question.title.replace('</span>', '')
    }
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
