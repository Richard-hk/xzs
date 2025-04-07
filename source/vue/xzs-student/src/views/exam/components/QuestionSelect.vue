<template>
  <div style="line-height: 2" :style="computedStyle">
    <div v-if="qType == 10 || qType == 11 || qType ==12" v-loading="qLoading" class="question-layout">
      <div class="q-content" style="margin-left: 10px;">
        <div v-for="(item, index) in question.items" :key="item.prefix" style="margin-bottom: 10px;" ref="questionSelect" @mouseup="highlightText(index)">
          <span class="question-prefix">{{ item.prefix }}</span>
          <span v-html="item.content" class="q-item-span-content" ></span>
        </div>
      </div>
    </div>
    <div v-if="qType == 20" v-loading="qLoading" class="question-layout">
      <div class="q-content" style="text-align: left; margin-left: 10px;">
        <div v-for="(item, index) in question.items" :key="item.prefix" style="margin-bottom: 10px;" ref="questionSelect" @mouseup="highlightText(index)">
          <span class="question-prefix" >{{ item.prefix }}</span>
          <span v-html="item.content" class="q-item-span-content"></span>
        </div>
      </div>
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
    answer: {
      type: Object,
      default: function () {
        return { id: null, content: '', contentArray: [] }
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
      highlightedTitle: this.question.title,
      highIndex: null,
      selectText: '',
      hightStyle: '<span style="background-color: yellow;display: inline-block;">',
      hightStyle1: '</span>'
    }
  },
  methods: {
    highlightText(index) {
      this.highIndex = index
      const selectedText = window.getSelection().toString()
      this.selectText = selectedText
    },
    highlight() {
      if (this.selectText) {
        this.question.items[this.highIndex].content = this.question.items[this.highIndex].content.replace(this.selectText, this.hightStyle + this.selectText + this.hightStyle1)
        this.selectText = ''
      }
    },
    unhighlight() {
      if (this.highIndex !== null) {
        for (let i = 0; i < this.question.items.length; i++) {
          this.question.items[i].content = this.question.items[i].content.replace(this.hightStyle, '')
          this.question.items[i].content = this.question.items[i].content.replace(this.hightStyle1, '')
        }
      }
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
