<template>
  <div class="app-container">
    <el-form :model="queryParam" ref="queryForm" :inline="true">
      <el-form-item label="学科：">
        <el-select v-model="queryParam.subjectId" clearable>
          <el-option v-for="item in subjects" :key="item.id" :value="item.id" :label="item.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="试卷名称：">
        <el-select v-model="queryParam.examPaperId" clearable>
          <el-option v-for="item in examPapers" :key="item.id" :value="item.id" :label="item.name"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="用户名：">
        <el-input v-model="queryParam.userName"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">查询</el-button>
        <el-button type="primary" @click="exportData">导出</el-button>

      </el-form-item>
    </el-form>

    <el-table v-loading="listLoading" :data="tableData" border fit highlight-current-row style="width: 100%">
      <el-table-column prop="id" label="Id" width="100" />
      <el-table-column prop="paperName" label="试卷名称" />
      <el-table-column prop="userName" label="用户名称" />
      <el-table-column label="得分" width="100px">
        <template slot-scope="{row}">
          {{ row.userScore }} / {{ row.paperScore }}
        </template>
      </el-table-column>
      <el-table-column label="题目对错" width="80px">
        <template slot-scope="{row}">
          {{ row.questionCorrect }} / {{ row.questionCount }}
        </template>
      </el-table-column>
      <el-table-column prop="doTime" label="耗时" width="100px" />
      <el-table-column prop="createTime" label="提交时间" width="160px" />
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParam.pageIndex" :limit.sync="queryParam.pageSize"
      @pagination="search" />
  </div>
</template>

<script>

import { mapGetters, mapState, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import examPaperAnswerApi from '@/api/examPaperAnwser'
import examPaperApi from '@/api/examPaper'

export default {
  components: { Pagination },
  data () {
    return {
      queryParam: {
        subjectId: null,
        pageIndex: 1,
        pageSize: 10,
        type: null,
        examPaperId: null
      },
      listLoading: false,
      tableData: [],
      total: 0,
      examPapers: []
    }
  },
  created () {
    this.initSubject()
    this.examPaperSearch()
    this.search()
  },
  methods: {
    search () {
      this.listLoading = true
      examPaperAnswerApi.page(this.queryParam).then(data => {
        const re = data.response
        this.tableData = re.list
        this.total = re.total
        this.queryParam.pageIndex = re.pageNum
        this.listLoading = false
      })
    },
    examPaperSearch () {
      const param = {
        pageIndex: 1,
        pageSize: 10000
      }
      examPaperApi.pageList(param).then(data => {
        const re = data.response
        this.examPapers = re.list
      })
    },
    submitForm () {
      this.queryParam.pageIndex = 1
      this.search()
    },
    exportData () {
      this.queryParam.type = 'export'
      examPaperAnswerApi.page(this.queryParam)
    },
    ...mapActions('exam', { initSubject: 'initSubject' })
  },
  computed: {
    ...mapGetters('enumItem', ['enumFormat']),
    ...mapGetters('exam', ['subjectEnumFormat']),
    ...mapState('exam', { subjects: state => state.subjects })
  }
}
</script>
