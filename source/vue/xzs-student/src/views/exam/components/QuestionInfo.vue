<template>
  <div style="line-height: 1.8" :style="computedStyle">
    <div v-if="qType == 1" v-loading="qLoading" class="question-layout">
      <div class="q-title" v-html="question.title"></div>
      <div class="q-content">
        <div v-for="item in question.items" :key="item.prefix" style="margin-bottom: 10px;">
          <span class="question-prefix">{{ item.prefix }}</span>
          <span v-html="item.content" class="q-item-span-content"></span>
        </div>
      </div>
    </div>
    <div v-if="qType == 2" v-loading="qLoading" class="question-layout">
      <div class="q-title" v-html="question.title"></div>
      <div class="q-content" style="text-align: left;">
        <div v-for="item in question.items" :key="item.prefix" style="margin-bottom: 10px;">
          <span class="question-prefix">{{ item.prefix }}</span>
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
    },    scale: {
      type: Number,
      default: 1,
    },

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
        transition: 'transform 0.3s', // 添加过渡效果
      };
    },
  }
}
</script>
<style scoped>
.question-layout {
  display: flex;
  width: 100%;
}

.q-title {
  flex: 1; /* 占据一半 */
}

.q-content {
  flex: 1; /* 另一半 */
}
</style>
