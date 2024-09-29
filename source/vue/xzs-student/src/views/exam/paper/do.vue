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
      <el-aside width="250px" style="padding: 20px;">
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
        <el-main>
          <el-form :model="form" ref="form" v-loading="formLoading">
            <el-form-item v-if="activeQuestionIndex !== null && currentTitleItem && form.titleItems.length"
              :label="currentTitleItem.itemOrder + '.'" class="exam-question-item"
              :id="'question-' + currentTitleItem.itemOrder">
              <div class="parent-container">

              <QuestionInfo :qType="currentTitleItem.questionType" 
              :question="currentTitleItem"
                :answer="answer.answerItems[currentTitleItem.itemOrder - 1]" 
                :scale="scale"
                />
              </div>
            </el-form-item>
          </el-form>
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
              <el-button @click="previousQuestion">上一题</el-button>
              <el-button type="primary" @click="nextQuestion">下一题</el-button>
            </div>
            <div style="display: flex;">
              <el-button type="warning" @click="zoomOut" plain>缩小</el-button>
              <el-button type="warning" @click="zoomIn" plain>放大</el-button>
              <el-button type="warning" @click="mark" plain icon="el-icon-star-off">标记</el-button>
              <el-button type="warning" @click="showCalculator" plain>计算器</el-button>
              <el-button type="primary" icon="el-icon-setting" @click="openSettings"></el-button>
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
import QuestionInfo from '../components/QuestionInfo'
import QuestionEdit from '../components/QuestionEdit'
import examPaperApi from '@/api/examPaper'
import examPaperAnswerApi from '@/api/examPaperAnswer'

export default {
  components: { QuestionEdit, QuestionInfo },
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
        0: '单选题',
        1: '多选题',
        2: '填空题',
        3: '判断题',
        4: '问答题'
      },
      scale: 1, // 初始缩放比例

    }
  },
  created() {
    let id = this.$route.query.id;
    if (id && parseInt(id) !== 0) {
      this.formLoading = true;
      examPaperApi.select(id).then(re => {
        this.form = re.response;
        this.remainTime = re.response.suggestTime * 60;
        let savedData = localStorage.getItem(this.userName + '_examData');
        if (savedData) {
          this.loadFromLocalStorage(); // 确保这里没有拼写错误
        } else {
          this.initAnswer();
          this.setActiveQuestion(0);
        }
        this.timeReduce();
        this.formLoading = false;
      });
    } else {
      this.$router.push('/index')
    }
  },
  beforeDestroy() {
    window.clearInterval(this.timer)
  },
  methods: {
    loadFromLocalStorage() {
      const savedData = localStorage.getItem(this.userName + '_examData');
      if (savedData) {
        const { activeQuestionIndex, answerItems } = JSON.parse(savedData);
        this.activeQuestionIndex = activeQuestionIndex;
        this.answer.answerItems = answerItems;
      }
    },
    formatSeconds(theTime) {
      return formatSeconds(theTime)
    },
    timeReduce() {
      this.timer = setInterval(() => {
        if (this.remainTime <= 0) {
          this.submitForm()
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
      this.answer.answerItems[this.activeQuestionIndex].status = this.answer.answerItems[this.activeQuestionIndex].pre_status; // 更新上一个题目的状态
      this.answer.answerItems.forEach((item, itemIndex) => {
        item.status = index === itemIndex ? this.status_current : item.status; // 更新状态
      })
      this.activeQuestionIndex = index; // 更新当前活动题目索引
      this.saveToLocalStorage() // 保存数据到本地
    },
    markQuestion() {
      this.toggleMark(this.activeQuestionIndex); // 标注当前题目
      this.saveToLocalStorage() // 保存数据到本地

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
    submitForm() {
      window.clearInterval(this.timer)
      this.formLoading = true
      examPaperAnswerApi.answerSubmit(this.answer).then(re => {
        if (re.code === 1) {
          this.$alert('试卷得分：' + re.response + '分', '考试结果', {
            confirmButtonText: '返回考试记录',
            callback: action => {
              this.$router.push('/record/index')
            }
          })
        } else {
          this.$message.error(re.message)
        }
        this.formLoading = false
      }).catch(() => {
        this.formLoading = false
      })
    },
    handleAnswerUpdate() {
      if (this.answer.answerItems[this.activeQuestionIndex].completed == true) {
        this.answer.answerItems[this.activeQuestionIndex].status = this.status_current
        this.answer.answerItems[this.activeQuestionIndex].pre_status = this.status_completed
      } else {
        this.answer.answerItems[this.activeQuestionIndex].status = this.status_current
        this.answer.answerItems[this.activeQuestionIndex].pre_status = this.status_not_done
      }
      this.saveToLocalStorage() // 保存数据到本地

    },
    previousQuestion() {
      if (this.activeQuestionIndex === 0) {
        return
      }
      this.setActiveQuestion(this.activeQuestionIndex - 1);
      this.saveToLocalStorage() // 保存数据到本地

    },
    nextQuestion() {
      if (this.activeQuestionIndex === this.answer.answerItems.length - 1) {
        return
      }
      this.setActiveQuestion(this.activeQuestionIndex + 1);
      this.saveToLocalStorage() // 保存数据到本地

    },
    zoomOut() {
      this.scale -= 0.1; // 缩小

      // Logic for zooming out
    },
    zoomIn() {
      this.scale += 0.1; // 放大
      // Logic for zooming in
    },
    mark() {
      this.answer.answerItems[this.activeQuestionIndex].marked = !this.answer.answerItems[this.activeQuestionIndex].marked
      // Logic for marking question
    },
    showCalculator() {
      // Logic to show calculator
    },
    openSettings() {
      // Logic to open settings
    }
  },
  computed: {
    ...mapGetters('enumItem', ['enumFormat', 'userName']),
    ...mapGetters('user', ['userName']),
    ...mapState('enumItem', {
      doCompletedTag: state => state.exam.question.answer.doCompletedTag
    }),
    currentTitleItem() {
      if (this.activeQuestionIndex !== null && this.form.titleItems.length > 0) {
        const totalTitleItems = this.form.titleItems.length;
        let itemCounter = 0;
        for (let i = 0; i < totalTitleItems; i++) {
          const questionCount = this.form.titleItems[i].questionItems.length;
          if (this.activeQuestionIndex < itemCounter + questionCount) {
            return this.form.titleItems[i].questionItems[this.activeQuestionIndex - itemCounter];
          }
          itemCounter += questionCount;
        }
      }
      return null;
    },
    progress() {
      const answeredCount = this.answer.answerItems ? this.answer.answerItems.filter(item => item.completed).length : 0;
      const totalQuestions = this.answer.answerItems ? this.answer.answerItems.length : 0;
      return totalQuestions > 0 ? ((answeredCount / totalQuestions) * 100).toFixed(0) : 0;
    },
    groupedAnswerItems() {
      return this.answer.answerItems.reduce((acc, item) => {
        const questionType = item.questionType; // 获取 questiontype
        if (!acc[questionType]) {
          acc[questionType] = [];
        }
        acc[questionType].push(item);
        return acc;
      }, {});
    },
    saveToLocalStorage() {
      const dataToSave = {
        activeQuestionIndex: this.activeQuestionIndex,
        answerItems: this.answer.answerItems
      };
      console.log(dataToSave);
      localStorage.setItem(this.userName + '_examData', JSON.stringify(dataToSave));

    },

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
    font-size: 15px !important;
  }
}

.header-padding {
  padding: 0 10px;
}

.el-tag {
  cursor: pointer;
}

.do-exam-time {
  // margin-left: 20px;
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
  /* 垂直居中 */
  transition: width 0.3s;
}

/* 题目状态颜色 */
.not-done {
  background-color: white;
  /* 未作答 */
}

.completed {
  background-color: #1d7ecc;
  color: #fff
    /* 已作答 */
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
  // padding: 5px ;
}

.index-tag {
  width: 30px;
  /* 固定宽度 */
  height: 30px;
  /* 固定高度 */
  display: flex;
  /* 使用flex布局 */
  float: left;
  justify-content: center;
  /* 水平居中 */
  align-items: center;
  /* 垂直居中 */
  margin: 10px;
}

.tag-content {
  font-size: 12px;
  /* 字体大小 */
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
  /* 根据需要调整大小 */
  border-color: transparent rgb(248, 0, 0) transparent transparent;
  /* 根据需要修改颜色 */
}

.el-header,
.el-footer {
  background-color: #B3C0D1;
  color: #333;
}

.el-main {
  background-color: #E9EEF3;
  color: #333;
  // text-align: center;
}

body>.el-container {
  margin-bottom: 40px;
}
.parent-container {
  position: relative; /* 父类相对定位 */
}
</style>
