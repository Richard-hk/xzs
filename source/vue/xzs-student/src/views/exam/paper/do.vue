<template>
  <el-container style="height: 100vh;">

    <el-header style="padding: 0; height: 80px;">
      <el-row>
        <el-col v-if="isHeaderLeftVisiable"
          style="width: 250px; flex: none; height: 80px;  font-size: 14px; overflow: hidden;">
          <div style="display:flex;height: 80px;  ">
            <div>
              <router-link to="index">
                <img src="@/assets/doHeader.png" style="width: 60px; height: 100%; margin: 0 10px 0 20px">
              </router-link>
            </div>
            <div style="height: 80px; ">
              <p>{{ userName }}</p>
              <p>111111111111111111</p>
            </div>
          </div>
        </el-col>
        <el-col :style="{ width: isHeaderLeftVisiable ? 'calc(100% - 250px)' : '100%' }">
          <div style="display: flex;align-items: center;">
            <div>
              <span class="header-padding" style="margin-left: 10px; font-size: 20px; font-weight: bold;">{{ form.name
                }}</span>
            </div>
            <div v-if="isHeaderLeftVisiable"
              style="margin-left: auto;margin-right: 25px; font-size: 14px;font-weight: bold;">
              <p>试卷题数：{{ this.totalCount }}</p>
              <p>试卷总分：{{ form.score }}</p>
            </div>
            <div :style="{ marginRight: isHeaderLeftVisiable ? '25px' : '2px' }"
              style=" font-size: 14px; font-weight: bold;">
              <p>考试时间：{{ form.suggestTime }}分钟</p>
              <p>
                <label>剩余时间：</label>
                <label :class="{
                  'remain-time-red': remainTime < this.suggestTime * 0.25,
                }">{{ formatSeconds(remainTime) }}</label>
              </p>
            </div>
            <el-button type="danger" @click="submitForm(false)"
              :style="{ marginRight: isHeaderLeftVisiable ? '35px' : '2px' }"
              style=" height:50px; font-size: 20px;">提交</el-button>
          </div>
        </el-col>
      </el-row>
    </el-header>

    <el-container style="height: calc(100% - 80px);">
      <el-aside width="250px" style="padding: 20px;border-right: 1px solid #dcdfe6;" v-if="isAsideVisible">
        <div style="display: flex; align-items: center; ">
          作答进度：
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: progress + '%' }" style="margin-top: 0px;">
              {{ progress }}%
            </div>
          </div>
        </div>
        <div>
          <div v-for="(item) in sortedGroupedAnswerItems" :key="item.questionType" class="tag-container"
            style="width: 100%;">
            <p>一 {{ questionTypeMap[item.questionType] }}</p>
            <span v-for="(item) in item.group.items" :key="item.itemOrder">
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
        <el-main style="height: 100% ;padding: 10px;">
          <div
            style=" position: sticky; top: 0; background: white; z-index: 1; border-bottom: 1px solid #dcdfe6;padding-bottom: 10px; ">
            <el-row style=" line-height: 1.5;">{{ index_tag_show }}</el-row>
          </div>
          <el-row style="height:calc(100% - 60px);  ">

            <el-col :span="24" v-if="!isHeaderLeftVisiable"
              style="height: 50%; overflow: auto;  border-bottom: 1px solid #dcdfe6;">
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
            <el-col v-else :span="12" style="height: 100%; overflow: auto; border-right: 1px solid #dcdfe6;">
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

            <el-col :span="24" v-if="!isHeaderLeftVisiable" style="height: 50%; overflow: auto;">
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

            <el-col v-else :span="12" style="height: 100%; overflow: auto;">
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

        <el-footer style="height: 48px;  background-color: #f2f2f2;">
          <el-form :model="form" ref="form" v-loading="formLoading">
            <el-form-item v-if="activeQuestionIndex !== null && currentTitleItem && form.titleItems.length"
              :id="'question-' + currentTitleItem.itemOrder">
              <QuestionEdit :qType="currentTitleItem.questionType" :question="currentTitleItem"
                :answer="answer.answerItems[currentTitleItem.itemOrder - 1]" @update:answer="handleAnswerUpdate" />
            </el-form-item>
          </el-form>
        </el-footer>

        <el-footer style="height: 68px; padding: 16px 35px 16px 20px;">
          <div :style="{
            display: 'flex',
            flexDirection: isFooterVisiable ? 'row' : 'column',
            justifyContent: isFooterVisiable ? 'space-between' : 'flex-start',
          }">
            <div style="display: flex; font-size: 40px;">
              <el-button type="primary" @click="hiddenAside" plain style="padding: 0px; font-size: 16px;">
                <i :class="{
                  'el-icon-arrow-right': this.isAsideVisible == false,
                  'el-icon-arrow-left': this.isAsideVisible == true
                }"></i>
              </el-button>
              <el-button @click="previousQuestion" style="font-size: 16px;">上一题</el-button>
              <el-button type="primary" @click="nextQuestion" style="font-size: 16px">下一题</el-button>
            </div>
            <div style="display: flex;" :style="{marginTop: isFooterVisiable ? '0px' : '20px'}">
              <el-button type="warning" @click="zoomOut" plain style="font-size: 16px">缩小</el-button>
              <el-button type="warning" @click="zoomIn" plain style="font-size: 16px">放大</el-button>
              <el-button type="warning" @click="markQuestion" plain style="font-size: 16px">
                <i :class="{
                  'el-icon-star-off': this.answer.answerItems[this.activeQuestionIndex]?.marked == false,
                  'el-icon-star-on': this.answer.answerItems[this.activeQuestionIndex]?.marked
                }"></i>
                标记</el-button>
              <el-button v-if="isHeaderLeftVisiable" type="warning" @click="showCalculator" plain
                style="font-size: 16px">计算器</el-button>

              <el-dropdown v-if="isHeaderLeftVisiable" @command="settingHandleCommand" style="margin-left: 10px;">
                <el-button type="primary" icon="el-icon-setting" style="font-size: 16px">
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="autoNextExam">自动切换下一题</el-dropdown-item>
                  <el-dropdown-item command="manualNextExam">手动切换下一题</el-dropdown-item>
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
        12: '综合分析选择题',
        10: '最佳选择题',
        11: '配伍选择题',
        20: '多项选择题'
      },
      questionTypeMapChinese: {
        1: '一',
        2: '二',
        3: '三',
        4: '四'
      },
      questionTypeMapDesc: {
        10: '每题的备选项中，只有1个最符合题意',
        11: '题目分为若干组，每组题目对应同一组备选项，备选项可重复选用，也可不选用。每题只有1个备选项最符合题意',
        12: '题目分为若干组，每组题目基于同一个临床情景、病例、实例或者案例的背景信息逐题展开。每题的备选项中，只有1个最符合题意',
        20: '每题的备选项中，有2个或2个以上符合题意。错选、少选均不得分'
      },
      scale: 1,
      exam_id: null,
      userExamIdStartTime: null,
      userExamIdData: null,
      autoNextExam: false,
      suggestTime: 0,
      userExamId: null,
      isHeaderLeftVisiable: true,
      isFooterVisiable: true,
      isAsideVisible: true,
      windowWidth: window.innerWidth,
      groupedAnswerItems: [],
      index_tag_show: '',
      questionTypeOrder: [],
      totalCount: 0
    }
  },
  created() {
    this.exam_id = this.$route.query.id
    if (this.exam_id && parseInt(this.exam_id) !== 0) {
      this.userExamId = this.userName + '_' + this.$route.query.id
      this.userExamIdStartTime = this.userExamId + '_remainTime'
      this.userExamIdData = this.userExamId + '_examData'
      if (!localStorage.getItem(this.userExamIdStartTime)) {
        localStorage.setItem(this.userExamIdStartTime, this.getCurrentTimestamp())
      }
      this.formLoading = true
      examPaperApi.select(this.exam_id).then(re => {
        this.form = re.response
        let savedData = localStorage.getItem(this.userExamIdData)
        this.suggestTime = re.response.suggestTime * 60
        if (savedData) {
          this.loadFromLocalStorage()
          this.groupedQuestionAnswer()
          this.setIndexTagShow(this.activeQuestionIndex)
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
            this.groupedQuestionAnswer()
            this.setActiveQuestion(0)
          }
        } else {
          this.remainTime = this.suggestTime
          this.initAnswer()
          this.groupedQuestionAnswer()
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
    window.removeEventListener('resize', this.handleResize)
  },
  mounted() {
    window.addEventListener('resize', this.handleResize)
    this.checkWindowWidth()
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
      this.timer = setInterval(() => {
        if (this.remainTime <= 0) {
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
      this.setIndexTagShow(index)
      this.answer.answerItems[this.activeQuestionIndex].status = this.answer.answerItems[this.activeQuestionIndex].pre_status
      this.answer.answerItems.forEach((item, itemIndex) => {
        item.status = index === itemIndex ? this.status_current : item.status
      })
      this.activeQuestionIndex = index
      this.saveToLocalStorage()
    },
    setIndexTagShow(index) {
      let indexAnswer = this.answer.answerItems[index]
      let questionType = indexAnswer.questionType
      let score = indexAnswer.score || 0
      let group = this.groupedAnswerItems[questionType]
      // let msg1 = this.questionTypeMapChinese[index + 1] + ' 、'
      let msg2 = this.questionTypeMap[questionType]
      let msg3 = '共' + group.totalCount + '题，共' + group.totalScore + '分，当前第' + (index + 1) + '题，当前题分数' + score + '分。'
      let msg4 = ' （ ' + msg3 + this.questionTypeMapDesc[questionType] + '）'
      this.index_tag_show = msg2 + msg4
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
            itemOrder: question.itemOrder,
            score: question.score
          })
        })
      })
    },
    submitForm(timeout = false) {
      window.clearInterval(this.timer)
      this.formLoading = true
      const uncompletedItems = this.answer.answerItems.filter(item => !item.completed)
      if (uncompletedItems.length > 0 && timeout === false) {
        this.$alert('还有' + uncompletedItems.length + '道未完成的题目，请先完成后再提交', '提示', {
          confirmButtonText: '确定',
          showCancelButton: true,
          cancelButtonText: '直接提交',
          callback: (action) => {
            if (action === 'confirm') {
              this.formLoading = false // 用户选择“确定”
            } else if (action === 'cancel') {
              this.directSubmit() // 用户选择 “直接提交”
            }
          }
        })
        this.formLoading = false
        return
      }
      this.directSubmit()
    },
    directSubmit() {
      this.answer.id = this.form.id
      examPaperAnswerApi.answerSubmit(this.answer).then(re => {
        if (re.code === 1) {
          localStorage.removeItem(this.userExamIdStartTime)
          localStorage.removeItem(this.userExamIdData)
          this.$router.replace('/finish')
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
      if (this.scale < 0.5) {
        return null
      }
      this.scale -= 0.1 // 缩小
    },
    zoomIn() {
      if (this.scale > 1.5) {
        return null
      }
      this.scale += 0.1 // 放大
    },
    showCalculator() {
      window.open('https://www.desmos.com/scientific?lang=zh-CN', '_blank')
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
        scale25: () => { this.scale = 0.5 },
        scale50: () => { this.scale = 0.75 },
        scale100: () => { this.scale = 1 },
        scale150: () => { this.scale = 1.25 },
        scale200: () => { this.scale = 1.5 },
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
    },
    groupedQuestionAnswer() {
      const orderedQuestionTypes = []
      let paperTotalCount = 0
      const groupedItems = this.answer.answerItems.reduce((acc, item) => {
        const questionType = item.questionType
        if (!acc[questionType]) {
          acc[questionType] = {
            items: [],
            totalScore: 0,
            totalCount: 0
          }
          orderedQuestionTypes.push(questionType)
        }
        paperTotalCount += 1
        acc[questionType].items.push(item)
        acc[questionType].totalScore += parseInt(item.score, 10) || 0
        acc[questionType].totalCount += 1
        return acc
      }, {})
      this.questionTypeOrder = orderedQuestionTypes
      this.groupedAnswerItems = groupedItems
      this.totalCount = paperTotalCount
      return groupedItems
    },
    handleResize() {
      this.windowWidth = window.innerWidth
      this.checkWindowWidth()
    },
    checkWindowWidth() {
      this.isAsideVisible = this.windowWidth > 768 // 自定义宽度
      this.isHeaderLeftVisiable = this.windowWidth > 768 // 自定义宽度
      this.isFooterVisiable = this.windowWidth > 480 // 自定义宽度
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
    sortedGroupedAnswerItems() {
      return this.questionTypeOrder.map(questionType => {
        return {
          questionType: questionType,
          group: this.groupedAnswerItems[questionType]
        }
      }).filter(item => item.group)
    }
  }
}
</script>

<style lang="scss" scoped>
@media (max-width: 768px) {
  el-button {
    font-size: 0.8rem;
    /* 窄屏时缩小按钮字体 */
  }

  .el-icon {
    font-size: 1.2em;
    /* 窄屏时缩小图标字体 */
  }
}

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
  // font-size: 16px;
}

.el-tag {
  cursor: pointer;
  font-size: 16px;
}

/* 进度条样式 */
.progress-bar-container {
  margin-top: 0;
  width: 60%;
  height: 30px;
  border-radius: 4px;
  border: 1px solid green;
}

.progress-bar {
  height: 100%;
  background-color: #4caf50;
  border-radius: 4px;
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

.remain-time-red {
  color: red;
}

.el-header {
  background-color: #1579de;
  color: #fff;
  font-size: 16px;
}

.el-footer {
  font-size: 16px;
}

.el-main {
  background-color: #FFF;
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
