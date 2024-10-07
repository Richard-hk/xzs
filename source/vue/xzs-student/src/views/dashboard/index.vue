<template>
  <div style="margin-top: 10px">
    <el-row>
      <el-col :span="18" :offset="3">
        <h3 class="index-title-h3">考试项目</h3>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="18" :offset="3" v-for="(item, index) in fixedPaper" :key="index">
        <el-card :body-style="{ padding: '0px' }" style="margin: 5px;" v-loading="loading">
          <div class="flex-container">
            <img src="@/assets/exam-paper/show1.png" class="image" alt="考试图">
            <router-link class="router-link-no-underline" :to="{ path: '/login', query: { id: item.id,name:item.name } }">
              <span>{{ item.name }}</span>
            </router-link>
          </div>
        </el-card>

      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import indexApi from '@/api/dashboard'
export default {
  data() {
    return {
      fixedPaper: [],
      timeLimitPaper: [],
      pushPaper: [],
      loading: false,
      // taskLoading: false,
      taskList: []
    }
  },
  created() {
    let _this = this
    this.loading = true
    indexApi.index().then(re => {
      _this.fixedPaper = re.response.fixedPaper
      _this.timeLimitPaper = re.response.timeLimitPaper
      _this.pushPaper = re.response.pushPaper
      _this.loading = false
    })

    // this.taskLoading = true
    // indexApi.task().then(re => {
    //   _this.taskList = re.response
    //   _this.taskLoading = false
    // })
  },
  methods: {
    statusTagFormatter(status) {
      return this.enumFormat(this.statusTag, status)
    },
    statusTextFormatter(status) {
      return this.enumFormat(this.statusEnum, status)
    }
  },
  computed: {
    ...mapGetters('enumItem', [
      'enumFormat'
    ]),
    ...mapState('enumItem', {
      statusEnum: state => state.exam.examPaperAnswer.statusEnum,
      statusTag: state => state.exam.examPaperAnswer.statusTag
    })
  }
}
</script>

<style lang="scss" scoped>
.index-title-h3 {
  font-size: 22px;
  font-weight: 400;
  color: #1f2f3d;
  border-left: solid 10px #2ce8b4;
  padding-left: 10px;
}

.el-carousel__item h3 {
  color: #475669;
  font-size: 18px;
  opacity: 0.75;
  line-height: 300px;
  margin: 0;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n+1) {
  background-color: #d3dce6;
}

.bottom {
  margin-top: 13px;
  line-height: 12px;
}

.button {
  padding: 0;
  float: right;
}

.image {
  width: 60px;
  margin: 12px;
  margin-right: 10px;
  /* 图片和文字之间的间距 */

}

.clearfix:before,
.clearfix:after {
  // display: table;
  content: "";
}

.clearfix:after {
  // clear: both
}

.router-link-no-underline {
  text-decoration: none;
  /* 去掉下划线 */
  color: #a30300;
}

.flex-container {
  display: flex;
  align-items: center;
  font-size: 24px;
  /* 垂直居中对齐 */
}
</style>
