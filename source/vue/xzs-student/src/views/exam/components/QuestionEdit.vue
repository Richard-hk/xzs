<template>
  <div style="line-height: 1.8">
    <div v-if="qType == 1" v-loading="qLoading">
      <div class="edit-checkbox-container">
        <span><i class="el-icon-edit" style="margin-right: 25px;"> 请作答</i></span>
        <el-radio-group v-model="answer.content" @change="handleChange('radio')">
          <el-radio v-for="item in question.items" :key="item.prefix" :label="item.prefix">
            <span class="question-prefix">{{ item.prefix }}.</span>
          </el-radio>
        </el-radio-group>
      </div>
    </div>
    <div v-else-if="qType == 2" v-loading="qLoading">
      <div class="edit-checkbox-container">
        <span><i class="el-icon-edit" style="margin-right: 25px;"> 请作答</i></span>
        <el-checkbox-group v-model="answer.contentArray" @change="handleChange('checkbox')">
          <el-checkbox v-for="item in question.items" :key="item.prefix" :label="item.prefix">
            <span class="question-prefix">{{ item.prefix }}.</span>
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
    <div v-else>
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
    }
  },
  methods: {
    handleChange(value) {
      this.answer.completed = true// 标记为已完成
      if (value === 'checkbox') {
        if (this.answer.contentArray.length === 0) {
          this.answer.completed = false // 标记为未完成
        }
      }
      this.$emit('update:answer', this.answer) // 触发自定义事件，将答案传递给父组件
    }
  }
}
</script>
<style lang="scss" scoped>
.edit-checkbox-container {
  display: flex;
  align-items: center;
}
</style>
