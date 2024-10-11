<template>
    <div class="exam-page" style="height: 100vh;">
        <el-row>
            <el-col :span="16" :offset="4" style="height: 100%;">
                <el-card class="exam-card" style="padding: 0; height: 100%;">
                    <div class="top">
                        <div class="exam-layout">
                            <div class="user-info">
                                <p>姓名：XXX</p>
                                <p>准考证号：{{ userName }}</p>
                                <p>证件号：11111111111111111</p>
                            </div>
                            <div class="exam-info">
                                <p>考试类型：正常考试</p>
                                <p>考试时长：150分钟</p>
                                <p>试卷加载：加载完成</p>
                            </div>
                            <div class="countdown">
                                <p>倒计时：<span id="countdown">{{ timeLeft }}</span></p>
                                <div class="progress-bar">
                                    <div class="progress" :style="{ width: (timeLeft / initialTime * 100) + '%' }">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="tabs" style="height: 54px;">
                            <el-tabs v-model="activeTab" @tab-click="handleTabClick">
                                <el-tab-pane label="考场规则" name="rules"></el-tab-pane>
                                <el-tab-pane label="操作指南" name="guidelines"></el-tab-pane>
                            </el-tabs>
                        </div>
                    </div>

                    <div class="content" v-if="activeTab === 'rules'"
                        style="overflow-y: auto; height: calc(100vh - 260px); line-height: 1.5; ">
                        <h4 style="text-align: center;">考场规则</h4>
                        <p></p>
                        <p>&emsp;&emsp;现提醒应试人员遵守以下规则：</p>
                        <p></p>
                        <p>&emsp;&emsp;一、自考试开始前30分钟起，应试人员凭准考证和有效身份证件（身份信息须与报考时所填报的一致）进入本科目考试所指定考场，按座位号入座，并将准考证和有效身份证件放置在座位右上角。
                        </p>
                        <p></p>
                        <p>&emsp;&emsp;二、本次考试为电子化考试，须在计算机上作答。</p>
                        <p></p>
                        <p>&emsp;&emsp;三、应试人员应提前30分钟到达考场，迟到5分钟以上的应试人员不得进入考场；在开始作答之前，应试人员需测试并确认考试设备运行正常；考试开考90分钟内，应试人员不得交卷离场。
                        </p>
                        <p></p>
                        <p>&emsp;&emsp;四、应试人员须按照考试系统提示的要求进行操作，不得擅自对计算机进行冷、热启动，不得在考试机上自行插入硬件和安装软件，不得关闭电源或做出其他与考试无关的操作。
                        </p>
                        <p></p>
                        <p>&emsp;&emsp;五、应试人员应按照考试系统的提示登录系统，须认真阅读《考场规则》及《操作指南》，并点击“我已阅读”按钮。考试开始后，考试系统将自动进行计时，应试人员作答时间以考试系统计时器显示的结果为准。
                        </p>
                        <p></p>
                        <p>&emsp;&emsp;六、应试人员须在考场内保持安静；独立进行作答，不得与其他应试人员交流讨论，不得要求监考人员解释试题。</p>
                        <p></p>
                        <p>&emsp;&emsp;七、应试人员应自觉接受工作人员的监督和检查，服从工作人员安排。遇到无法登录、系统故障等异常情况时应及时举手示意，由监考人员按规定处理，不得自行处置，否则责任自负。
                        </p>
                        <p></p>
                        <p>&emsp;&emsp;八、应试人员交卷后，须确认界面提示“交卷成功”，方可离开考场；若界面提示“交卷失败”，须及时联系监考人员。</p>
                        <p></p>
                        <p>&emsp;&emsp;九、应试人员不得将相关考试信息以任何方式带出考场，交卷后不得在考场附近逗留、谈论。</p>
                        <p></p>
                        <p>&emsp;&emsp;十、考试违纪违规行为按照人力资源社会保障部《专业技术人员资格考试违纪违规行为处理规定》处理。</p>
                    </div>

                    <div style="display: flex; justify-content: center; margin-top: 10px;">
                        <el-button type="primary"
                                   id="agree-button"
                                   :disabled="isButtonDisabled"
                                   @click="handleSubmit">
                            我已阅读
                        </el-button>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {
      activeTab: 'rules',
      timeLeft: 10,
      initialTime: 10,
      timer: null,
      disabled: false
    }
  },
  created() {
    let id = this.$route.query.id
    if (id === undefined || id === null || id === '') {
      this.$router.replace('/login')
    }
  },
  computed: {
    ...mapGetters('enumItem', ['enumFormat', 'userName']),
    ...mapGetters('user', ['userName']),
    isButtonDisabled() {
      return this.disabled
    }
  },
  methods: {
    handleTabClick(tab) {
      this.activeTab = tab.name
    },
    handleSubmit() {
      this.disabled = true

      if (this.timeLeft <= 0) {
        this.$router.replace('/do?id=' + this.$route.query.id)
      }
    },
    startCountdown() {
      this.timer = setInterval(() => {
        this.timeLeft--
        if (this.timeLeft <= 0) {
          clearInterval(this.timer)
          this.timeLeft = 0
          if (this.disabled === true) {
            this.$router.replace('/do?id=' + this.$route.query.id)
          }
        }
      }, 1000)
    }
  },
  mounted() {
    this.startCountdown()
  },
  beforeDestroy() {
    clearInterval(this.timer)
  }
}
</script>

<style>
.exam-page {
    background-color: #f0f2f5;
    /* 背景色 */
    height: 100vh;
    /* 占满整个视口 */
}

.exam-card {
    flex: 1;
    /* 使卡片高度自适应 */
    padding: 20px;
    border-radius: 8px;
    background-color: #ffffff;
    /* 卡片背景色 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    /* 卡片阴影 */
}

.top {
    /* 设置顶部内容的样式 */
}

.exam-layout {
    display: flex;
    /* 设置为横向布局 */
    justify-content: space-between;
    /* 在子项之间留出空间 */
    align-items: center;
    /* 垂直居中子项 */
}

.progress-bar {
    height: 20px;
    background-color: #e0e0e0;
    margin-top: 10px;
}

.progress {
    height: 100%;
    background-color: #FF9600;
    /* 进度条颜色 */
    text-align: center;
    color: #fff;
    /* 文本颜色 */
}

#agree-button {
    margin-top: 10px;
    /* 确保按钮与卡片之间有一点间距 */
}
</style>
