<template>
  <el-container style="height: 100vh;">
    <el-header style="padding: 12px;">
      <el-row>
        <el-col :span="4">{{ userName }}</el-col>
        <el-col :span="20">
          <div style="display: flex;align-items: center;">
            <span class="header-padding" style="margin-right: auto;">{{ form.name }}</span>
            <span class="header-padding">试卷总分：{{ form.score }}</span>
            <span class="header-padding">考试时间：{{ form.suggestTime }}分钟</span>
            <span class="header-padding">
              <label>剩余时间：</label>
              <label>{{ formatSeconds(remainTime) }}</label>
            </span>
            <el-button type="primary" @click="submitForm" style="margin-left: 20px;">提交</el-button>
          </div>
        </el-col>
      </el-row>
    </el-header>
    <el-container style="height: calc(100% - 60px);">
      <el-aside width="250px" style="padding: 20px;" v-if="isAsideVisible">
        <div style="display: flex; align-items: center;">
          作答进度：
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: progress + '%' }">
              {{ progress }}%
            </div>
          </div>
        </div>
        <div>
          <div v-for="(group, questionType) in groupedAnswerItems" :key="questionType" class="tag-container">
            <p>- {{ questionTypeMap[questionType] }}</p>
            <span v-for="(item) in group" :key="item.itemOrder">
              <el-tag :class="{
                'not-done': item.status === status_not_done,
                'completed': item.status === status_completed,
                'current': item.status === status_current,
                'marked': item.marked === status_marked
              }" class="index-tag" @click="setActiveQuestion(item.itemOrder - 1)">
                <div class="tag-content">{{ item.itemOrder }}</div>
              </el-tag>
            </span>
          </div>
        </div>
      </el-aside>
      <el-container>
        <el-main style="height: 100%;">
          <el-row style="height: 25px;">一、最佳选择题（共**题，每题**分。每题的备选项中，只有1个最符合题意）</el-row>
          <el-row style="height: 100%;">
            <el-col :span="12" style="height: 100%; overflow: auto;">
              <el-form :model="form" ref="form" v-loading="formLoading">
                <el-form-item v-if="activeQuestionIndex !== null && currentTitleItem && form.titleItems.length"
                  class="exam-question-item" :id="'question-' + currentTitleItem.itemOrder">
                  <div class="parent-container">
                    <QuestionTittle :qType="currentTitleItem.questionType" :question="currentTitleItem"
                      :scale="scale" />
                  </div>
                </el-form-item>
              </el-form>
            </el-col>
            <el-col :span="12" style="height: 100%; overflow: auto;">
              <el-form :model="form" ref="form" v-loading="formLoading">
                <el-form-item v-if="activeQuestionIndex !== null && currentTitleItem && form.titleItems.length"
                  class="exam-question-item" :id="'question-' + currentTitleItem.itemOrder">
                  <div class="parent-container">
                    <QuestionSelect :qType="currentTitleItem.questionType" :question="currentTitleItem"
                      :answer="answer.answerItems[currentTitleItem.itemOrder - 1]" :scale="scale" />
                  </div>
                </el-form-item>
              </el-form>
            </el-col>
          </el-row>
        </el-main>

        <el-footer>
          <el-form :model="form" ref="form" v-loading="formLoading">
            <el-form-item v-if="activeQuestionIndex !== null && currentTitleItem && form.titleItems.length"
              class="exam-question-item" :id="'question-' + currentTitleItem.itemOrder">
              <QuestionEdit :qType="currentTitleItem.questionType" :question="currentTitleItem"
                :answer="answer.answerItems[currentTitleItem.itemOrder - 1]" @update:answer="handleAnswerUpdate" />
            </el-form-item>
          </el-form>
        </el-footer>
        <el-footer>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex;">
              <el-button type="primary" @click="hiddenAside" plain style="padding: 0px;">
                <i :class="{
                  'el-icon-arrow-right': this.isAsideVisible == false,
                  'el-icon-arrow-left': this.isAsideVisible == true
                }"></i>
              </el-button>
              <el-button @click="previousQuestion">上一题</el-button>
              <el-button type="primary" @click="nextQuestion">下一题</el-button>
            </div>
            <div style="display: flex;">
              <el-button type="warning" @click="zoomOut" plain>缩小</el-button>
              <el-button type="warning" @click="zoomIn" plain>放大</el-button>
              <el-button type="warning" @click="markQuestion" plain>
                <i :class="{
                  'el-icon-star-off': this.answer.answerItems[this.activeQuestionIndex]?.marked == false,
                  'el-icon-star-on': this.answer.answerItems[this.activeQuestionIndex]?.marked
                }"></i>
                标记</el-button>
              <el-button type="warning" @click="showCalculator" plain>计算器</el-button>

              <el-dropdown @command="settingHandleCommand" style="margin-left: 10px;">
                <el-button type="primary" icon="el-icon-setting" @click="openSettings">
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="autoNextExam">自动切换下一篇题</el-dropdown-item>
                  <el-dropdown-item command="manualNextExam">手动切换下一篇题</el-dropdown-item>
                  <el-dropdown-item command="scale25"> 显示比例25%</el-dropdown-item>
                  <el-dropdown-item command="scale50">显示比例50%</el-dropdown-item>
                  <el-dropdown-item command="scale100">原始比例</el-dropdown-item>
                  <el-dropdown-item command="scale150">显示比例150%</el-dropdown-item>
                  <el-dropdown-item command="scale200">显示比例200%</el-dropdown-item>
                  <el-dropdown-item command="hiddenAside">切换显示</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
        </el-footer>
      </el-container>
    </el-container>
  </el-container>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
import { formatSeconds } from '@/utils'
import QuestionTittle from '../components/QuestionTittle'
import QuestionEdit from '../components/QuestionEdit'
import QuestionSelect from '../components/QuestionSelect'
import examPaperApi from '@/api/examPaper'
import examPaperAnswerApi from '@/api/examPaperAnswer'

export default {
  components: { QuestionEdit, QuestionTittle, QuestionSelect },
  data() {
    return {
      form: {},
      formLoading: false,
      activeQuestionIndex: 0, // 默认显示第一个题目
      answer: {
        questionId: null,
        doTime: 0,
        answerItems: []
      },
      timer: null,
      remainTime: 0,
      status_not_done: 0,
      status_completed: 1,
      status_current: 2,
      status_marked: true,
      questionTypeMap: {
        1: '最佳选择题',
        2: '多项选择题',
        3: '判断题',
        4: '问答题'
      },
      scale: 1,
      exam_id: null,
      userExamIdStartTime: null,
      userExamIdData: null,
      autoNextExam: false,
      suggestTime: 0,
      userExamId: null,
      isAsideVisible: true
    }
  },
  created() {
    this.exam_id = this.$route.query.id
    if (this.exam_id && parseInt(this.exam_id) !== 0) {
      this.userExamId = this.userName + '_' + this.$route.query.id
      this.userExamIdStartTime = this.userExamId + '_remainTime'
      this.userExamIdData = this.userExamId + '_examData'
      if (!localStorage.getItem(this.userExamIdStartTime)) {
        console.log('currentTime:', this.getCurrentTimestamp())
        localStorage.setItem(this.userExamIdStartTime, this.getCurrentTimestamp())
      }
      this.formLoading = true
      examPaperApi.select(this.exam_id).then(re => {
        this.form = re.response
        let savedData = localStorage.getItem(this.userExamIdData)
        this.suggestTime = re.response.suggestTime * 60
        if (savedData) {
          this.loadFromLocalStorage()
          let localAnswerNum = this.answer.answerItems.length
          let apiAnswerNum = this.form.titleItems.reduce((acc, titleItem) => {
            return acc + titleItem.questionItems.length
          }, 0)
          if (localAnswerNum !== apiAnswerNum) {
            this.$alert('本地答案与服务器答案不匹配，请重新开始答题', '通知', {
              confirmButtonText: '确定'
            })
            this.answer.answerItems = []
            this.initAnswer()
            this.setActiveQuestion(0)
          }
        } else {
          this.remainTime = this.suggestTime
          this.initAnswer()
          this.setActiveQuestion(0)
          this.saveToLocalStorage()
        }
        this.timeReduce()
        this.formLoading = false
      })
    } else {
      this.$router.push('/index')
    }
  },
  beforeDestroy() {
    window.clearInterval(this.timer)
  },
  methods: {
    loadFromLocalStorage() {
      const savedData = localStorage.getItem(this.userExamIdData)
      if (savedData) {
        const { activeQuestionIndex, answerItems } = JSON.parse(savedData)
        this.activeQuestionIndex = activeQuestionIndex
        this.answer.answerItems = answerItems
      }
      const savedStartTime = localStorage.getItem(this.userExamIdStartTime)
      if (savedStartTime) {
        const startTime = parseInt(savedStartTime, 10)

        this.remainTime = startTime + this.suggestTime - this.getCurrentTimestamp()
      }
    },
    formatSeconds(theTime) {
      return formatSeconds(theTime)
    },
    timeReduce() {
      console.log('remainTime:', this.remainTime)
      this.timer = setInterval(() => {
        if (this.remainTime <= 0) {
          alert('时间到！')
          this.submitForm(true)
        } else {
          ++this.answer.doTime
          --this.remainTime
        }
      }, 1000)
    },
    questionCompleted(completed) {
      return this.enumFormat(this.doCompletedTag, completed)
    },
    setActiveQuestion(index) {
      if (index < 0 || index >= this.answer.answerItems.length) {
        return
      }
      this.answer.answerItems[this.activeQuestionIndex].status = this.answer.answerItems[this.activeQuestionIndex].pre_status
      this.answer.answerItems.forEach((item, itemIndex) => {
        item.status = index === itemIndex ? this.status_current : item.status
      })
      this.activeQuestionIndex = index
      this.saveToLocalStorage()
    },
    markQuestion() {
      this.answer.answerItems[this.activeQuestionIndex].marked = !this.answer.answerItems[this.activeQuestionIndex].marked
      this.saveToLocalStorage()
    },
    initAnswer() {
      this.answer.id = this.form.id
      this.form.titleItems.forEach(titleItem => {
        titleItem.questionItems.forEach(question => {
          this.answer.answerItems.push({
            questionId: question.id,
            questionType: question.questionType,
            content: null,
            contentArray: [],
            completed: false,
            marked: false, // 新增标注属性
            status: 0, // 新增状态属性，默认未作答
            pre_status: 0, // 新增上一次状态属性
            itemOrder: question.itemOrder
          })
        })
      })
    },
    submitForm(timeout = false) {
      window.clearInterval(this.timer)
      this.formLoading = true
      // 判断是否有未完成的题目
      const uncompletedItems = this.answer.answerItems.filter(item => !item.completed)
      if (uncompletedItems.length > 0 && timeout === false) {
        this.$alert('还有未完成的题目，请先完成后再提交', '提示', {
          confirmButtonText: '确定'
        })
        this.formLoading = false
        return
      }
      examPaperAnswerApi.answerSubmit(this.answer).then(re => {
        if (re.code === 1) {
          this.$alert('试卷得分：' + re.response + '分', '考试结果', {
            confirmButtonText: '返回考试记录',
            callback: action => {
              this.$router.push('/record/index')
            }
          })
          localStorage.removeItem(this.userExamIdStartTime)
          localStorage.removeItem(this.userExamIdData)
        } else {
          this.$message.error(re.message)
        }
        this.formLoading = false
      }).catch(() => {
        this.formLoading = false
      })
    },
    handleAnswerUpdate() {
      if (this.answer.answerItems[this.activeQuestionIndex].completed === true) {
        this.answer.answerItems[this.activeQuestionIndex].status = this.status_current
        this.answer.answerItems[this.activeQuestionIndex].pre_status = this.status_completed
      } else {
        this.answer.answerItems[this.activeQuestionIndex].status = this.status_current
        this.answer.answerItems[this.activeQuestionIndex].pre_status = this.status_not_done
      }
      this.saveToLocalStorage() // 保存数据到本地
      if (this.autoNextExam && this.answer.answerItems[this.activeQuestionIndex].type === 'radio') {
        this.setActiveQuestion(this.activeQuestionIndex + 1)
      }
    },
    previousQuestion() {
      if (this.activeQuestionIndex === 0) {
        return
      }
      this.setActiveQuestion(this.activeQuestionIndex - 1)
      this.saveToLocalStorage() // 保存数据到本地
    },
    nextQuestion() {
      if (this.activeQuestionIndex === this.answer.answerItems.length - 1) {
        return
      }
      this.setActiveQuestion(this.activeQuestionIndex + 1)
      this.saveToLocalStorage() // 保存数据到本地
    },
    zoomOut() {
      if (this.scale < 0.25) {
        return null
      }
      this.scale -= 0.1 // 缩小
    },
    zoomIn() {
      if (this.scale > 2) {
        return null
      }
      this.scale += 0.1 // 放大
    },
    showCalculator() {
      // Logic to show calculator
    },
    openSettings() {
      // Logic to open settings
    },
    saveToLocalStorage() {
      const dataToSave = {
        activeQuestionIndex: this.activeQuestionIndex,
        answerItems: this.answer.answerItems
      }
      localStorage.setItem(this.userExamIdData, JSON.stringify(dataToSave))
    },
    toggleAutoNextExam(enable) {
      this.autoNextExam = enable
    },
    settingHandleCommand(command) {
      const commandMap = {
        autoNextExam: () => { this.autoNextExam = true },
        manualNextExam: () => { this.autoNextExam = false },
        scale25: () => { this.scale = 0.25 },
        scale50: () => { this.scale = 0.5 },
        scale100: () => { this.scale = 1 },
        scale150: () => { this.scale = 1.5 },
        scale200: () => { this.scale = 2 },
        hiddenAside: () => { this.isAsideVisible = !this.isAsideVisible }
      }
      if (command in commandMap) {
        commandMap[command]()
      } else {
        console.error(`未识别的命令: ${command}`)
      }
    },
    getCurrentTimestamp() {
      const currentTimestampInSeconds = Math.floor(Date.now() / 1000)
      return currentTimestampInSeconds
    },
    hiddenAside() {
      this.isAsideVisible = !this.isAsideVisible
    }
  },
  computed: {
    ...mapGetters('enumItem', ['enumFormat', 'userName']),
    ...mapGetters('user', ['userName']),
    ...mapState('enumItem', {
      doCompletedTag: state => state.exam.question.answer.doCompletedTag
    }),
    currentTitleItem() {
      if (this.activeQuestionIndex !== null && this.form.titleItems) {
        const totalTitleItems = this.form.titleItems.length
        if (totalTitleItems === 0) {
          return null
        }
        let itemCounter = 0
        for (let i = 0; i < totalTitleItems; i++) {
          const questionCount = this.form.titleItems[i].questionItems.length
          if (this.activeQuestionIndex < itemCounter + questionCount) {
            return this.form.titleItems[i].questionItems[this.activeQuestionIndex - itemCounter]
          }
          itemCounter += questionCount
        }
      }
      return null
    },
    progress() {
      const answeredCount = this.answer.answerItems ? this.answer.answerItems.filter(item => item.completed).length : 0
      const totalQuestions = this.answer.answerItems ? this.answer.answerItems.length : 0
      return totalQuestions > 0 ? ((answeredCount / totalQuestions) * 100).toFixed(0) : 0
    },
    groupedAnswerItems() {
      return this.answer.answerItems.reduce((acc, item) => {
        const questionType = item.questionType
        if (!acc[questionType]) {
          acc[questionType] = []
        }
        acc[questionType].push(item)
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss" scoped>
.align-center {
  text-align: center;
}

.iconfont.icon-time {
  color: #2776df;
  margin: 0 6px 0 20px;
}

.exam-question-item {
  padding: 10px;

  .el-form-item__label {
    font-size: 16px !important;
  }
}

.header-padding {
  padding: 0 10px;
  font-size: 16px;
}

.el-tag {
  cursor: pointer;
  font-size: 16px;
}

/* 进度条样式 */
.progress-bar-container {
  width: 60%;
  height: 30px;
  border-radius: 5px;
  border: 1px solid green;
}

.progress-bar {
  height: 100%;
  background-color: #4caf50;
  border-radius: 5px;
  text-align: center;
  justify-content: center;
  line-height: 30px;
  transition: width 0.3s;
}

/* 题目状态颜色 */
.not-done {
  background-color: white;
}

.completed {
  background-color: #1d7ecc;
  color: #fff;
}

.current {
  background: #f97217;
  color: #fff;
  border-color: #f97217;
}

.tag-container {
  position: relative;
  display: inline-block;
}

.marked {
  position: relative;
  border: 1px solid #2196F3;
}

.index-tag {
  width: 30px;
  height: 30px;
  display: flex;
  float: left;
  justify-content: center;
  align-items: center;
  margin: 10px;
  font-size: 16px;
}

.tag-content {
  font-size: 16px;
}

.marked::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 15px 15px 0;
  border-color: transparent rgb(248, 0, 0) transparent transparent;
}

.el-header,
.el-footer {
  background-color: #B3C0D1;
  color: #333;
  font-size: 16px;
}

.el-main {
  background-color: #E9EEF3;
  color: #333;
  font-size: 16px;
}

body>.el-container {
  margin-bottom: 40px;
}

.parent-container {
  position: relative;
  height: 100%;
}
</style>
