<template>
  <div class="app-container">
    <el-form :model="queryParam" ref="queryForm" :inline="true">
      <el-form-item label="题目ID：">
        <el-input v-model="queryParam.id" clearable></el-input>
      </el-form-item>
      <el-form-item label="级别：">
        <el-select v-model="queryParam.level" placeholder="级别" @change="levelChange" clearable>
          <el-option v-for="item in levelEnum" :key="item.key" :value="item.key" :label="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="学科：">
        <el-select v-model="queryParam.subjectId" clearable>
          <el-option v-for="item in subjectFilter" :key="item.id" :value="item.id"
            :label="item.name + ' ( ' + item.levelName + ' )'"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="题型：">
        <el-select v-model="queryParam.questionType" clearable>
          <el-option v-for="item in questionType" :key="item.key" :value="item.key" :label="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">查询</el-button>
        <el-button type="primary" @click="dialogVisible = true">批量上传</el-button>
        <el-popover placement="bottom" trigger="click">
          <el-button type="warning" size="mini" v-for="item in editUrlEnum" :key="item.key"
            @click="$router.push({ path: item.value+item.key, query: { questionType: item.key } })">{{ item.name }}
          </el-button>
          <el-button slot="reference" type="primary" class="link-left">添加</el-button>
        </el-popover>
      </el-form-item>
    </el-form>
    <el-dialog title="批量上传题目信息" :visible.sync="dialogVisible" width="30%">
      <el-upload class="upload-demo" action="" :on-change="handleChange" :auto-upload="false" :on-remove="handleRemove"
        :limit="1" :file-list="fileList" accept=".xls, .xlsx">
        <el-button size="small" type="primary">点击上传</el-button>
        <div slot="tip" class="el-upload__tip" style="line-height: 1.5;">
          只能上传xls/xlsx文件，且每个文件最大500kb,<br />
          <span style="color: red; text-align: center;">
            每次上传数据都会新增数据，不会覆盖之前的数据！<br />
            单选题：按照A到F顺序填选项，正确答案请填一个！<br />
            多选题：按照A到F顺序填选项，正确答案有多个请用逗号分割！<br />
          </span>
        </div>
      </el-upload>
      <a href="http://129.204.20.76/assets/template/question.xlsx" download="题目模板.xlsx">
        <el-button size="small" type="success">下载模板</el-button>
      </a>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </el-dialog>

    <el-table v-loading="listLoading" :data="tableData" border fit highlight-current-row style="width: 100%">
      <el-table-column prop="id" label="Id" width="90px" />
      <el-table-column prop="subjectId" label="学科" :formatter="subjectFormatter" width="120px" />
      <el-table-column prop="questionType" label="题型" :formatter="questionTypeFormatter" width="70px" />
      <el-table-column prop="shortTitle" label="题干" show-overflow-tooltip />
      <el-table-column prop="score" label="分数" width="60px" />
      <el-table-column prop="difficult" label="难度" width="60px" />
      <el-table-column prop="createTime" label="创建时间" width="160px" />
      <el-table-column label="操作" align="center" width="220px">
        <template slot-scope="{row}">
          <el-button size="mini" @click="showQuestion(row)">预览</el-button>
          <el-button size="mini" @click="editQuestion(row)">编辑</el-button>
          <el-button size="mini" type="danger" @click="deleteQuestion(row)" class="link-left">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParam.pageIndex" :limit.sync="queryParam.pageSize"
      @pagination="search" />
    <el-dialog :visible.sync="questionShow.dialog" style="width: 100%;height: 100%">
      <QuestionShow :qType="questionShow.qType" :question="questionShow.question" :qLoading="questionShow.loading" />
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import QuestionShow from './components/Show'
import questionApi from '@/api/question'
import * as XLSX from 'xlsx'
export default {
  components: { Pagination, QuestionShow },
  data () {
    return {
      queryParam: {
        id: null,
        questionType: null,
        level: null,
        subjectId: null,
        pageIndex: 1,
        pageSize: 10
      },
      subjectFilter: null,
      listLoading: true,
      tableData: [],
      total: 0,
      questionShow: {
        qType: 0,
        dialog: false,
        question: null,
        loading: false
      },
      dialogVisible: false,
      fileList: [],
      fileInfo: []
    }
  },
  created () {
    this.initSubject()
    this.search()
  },
  methods: {
    submitForm () {
      this.queryParam.pageIndex = 1
      this.search()
    },
    search () {
      this.listLoading = true
      questionApi.pageList(this.queryParam).then(data => {
        const re = data.response
        this.tableData = re.list
        this.total = re.total
        this.queryParam.pageIndex = re.pageNum
        this.listLoading = false
      })
    },
    levelChange () {
      this.queryParam.subjectId = null
      this.subjectFilter = this.subjects.filter(data => data.level === this.queryParam.level)
    },
    addQuestion () {
      this.$router.push('/exam/question/edit/singleChoice')
    },
    showQuestion (row) {
      let _this = this
      this.questionShow.dialog = true
      this.questionShow.loading = true
      questionApi.select(row.id).then(re => {
        _this.questionShow.qType = re.response.questionType
        _this.questionShow.question = re.response
        _this.questionShow.loading = false
      })
    },
    editQuestion (row) {
      let url = this.enumFormat(this.editUrlEnum, row.questionType)
      this.$router.push({ path: url + row.questionType, query: { id: row.id } })
    },
    deleteQuestion (row) {
      let _this = this
      questionApi.deleteQuestion(row.id).then(re => {
        if (re.code === 1) {
          _this.search()
          _this.$message.success(re.message)
        } else {
          _this.$message.error(re.message)
        }
      })
    },
    handleChange (file, fileList) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const filedata = XLSX.utils.sheet_to_json(worksheet)
        console.log(filedata)
        this.fileInfo = filedata.map((row, index) => {
          const questionTypeVal = this.questionType.find(item => item.value === row['题目类型'])
          if (!questionTypeVal) {
            this.$message.warning(`第 ${index + 1} 行的 题目类型 "${row['题目类型']}" 不在有效类型范围内！`)
            return
          }
          let correctVal = row['正确答案']
          let correctArrayVal = []
          if (questionTypeVal['key'] === 20) {
            correctArrayVal = correctVal.replace(/，/g, ',')
            correctArrayVal = correctArrayVal.split(',')
          }
          const gradeLevelVal = this.levelEnum.find(item => item.value === row['级别'])
          if (!gradeLevelVal) {
            this.$message.warning(`第 ${index + 1} 行的 级别 "${row['级别']}" 不在有效类型范围内！`)
            return
          }
          const items = []
          const optionKeys = ['选项A', '选项B', '选项C', '选项D', '选项E', '选项F']
          optionKeys.forEach(key1 => {
            const optionValue = row[key1]
            if (optionValue) {
              const item = { 'prefix': key1.slice(-1), 'content': optionValue }
              items.push(item)
            }
          })
          return {
            questionType: questionTypeVal['key'],
            gradeLevel: gradeLevelVal['key'],
            subjectName: row['学科'],
            gradeLevelName: row['级别'],
            title: row['题干'],
            correct: correctVal,
            correctArray: correctArrayVal,
            items: items,
            score: Number(row['题目分数']) ? Number(row['题目分数']) : 3,
            difficult: 3,
            analyze: ''
          }
        })
        console.log(this.fileInfo)
      }
      reader.readAsArrayBuffer(file.raw)
    },
    handleRemove (file, fileList) {
      this.fileList = fileList
    },
    handleSubmit () {
      if (this.fileInfo.length === 0) {
        this.$message.warning('请先上传文件！或检查文件内容是不是空！')
        return
      }
      questionApi.batchInsert(this.fileInfo).then((data) => {
        this.dialogVisible = false
        this.$message.success('上传成功')
        window.location.reload()
      })
      this.fileInfo = []
      this.fileList = []
    },
    questionTypeFormatter (row, column, cellValue, index) {
      return this.enumFormat(this.questionType, cellValue)
    },
    subjectFormatter (row, column, cellValue, index) {
      return this.subjectEnumFormat(cellValue)
    },
    ...mapActions('exam', { initSubject: 'initSubject' })
  },
  computed: {
    ...mapGetters('enumItem', ['enumFormat']),
    ...mapState('enumItem', {
      questionType: state => state.exam.question.typeEnum,
      editUrlEnum: state => state.exam.question.editUrlEnum,
      levelEnum: state => state.user.levelEnum
    }),
    ...mapGetters('exam', ['subjectEnumFormat']),
    ...mapState('exam', { subjects: state => state.subjects })
  }
}
</script>
