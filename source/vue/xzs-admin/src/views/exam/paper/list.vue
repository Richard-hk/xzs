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
      <el-form-item label="学科：" >
        <el-select v-model="queryParam.subjectId"  clearable>
          <el-option v-for="item in subjectFilter" :key="item.id" :value="item.id" :label="item.name+' ( '+item.levelName+' )'"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">查询</el-button>
        <router-link :to="{path:'/exam/paper/edit'}" class="link-left">
          <el-button type="primary">添加</el-button>
        </router-link>
      </el-form-item>
    </el-form>
    <el-table v-loading="listLoading" :data="tableData" border fit highlight-current-row style="width: 100%">
      <el-table-column prop="id" label="Id" width="90px"/>
      <el-table-column prop="subjectId" label="学科" :formatter="subjectFormatter" width="300px" />
      <el-table-column prop="name" label="名称"  />
      <el-table-column prop="status" label="状态" width="70px">
        <template slot-scope="{row}">
          <el-tag :type="statusTagFormatter(row.status)">
            {{ statusFormatter(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160px"/>
      <el-table-column label="操作" align="center"  width="230px">
        <template slot-scope="{row}">
          <el-button size="mini" @click="$router.push({path:'/exam/paper/edit',query:{id:row.id}})" >编辑</el-button>
          <el-button size="mini" @click="changeStatus(row)" class="link-left" :disabled="row.userName === 'goodadmin'">
            {{ statusBtnFormatter(row.status) }}
          </el-button>
          <el-button size="mini" type="danger" @click="deletePaper(row)" class="link-left">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="queryParam.pageIndex" :limit.sync="queryParam.pageSize"
                @pagination="search"/>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import Pagination from '@/components/Pagination'
import examPaperApi from '@/api/examPaper'

export default {
  components: { Pagination },
  data () {
    return {
      queryParam: {
        id: null,
        level: null,
        subjectId: null,
        pageIndex: 1,
        pageSize: 10
      },
      updataParam: {
        id: null,
        status: null
      },
      subjectFilter: null,
      listLoading: true,
      tableData: [],
      total: 0
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
    statusTagFormatter (status) {
      return this.enumFormat(this.statusTag, status)
    },
    statusFormatter (status) {
      return this.enumFormat(this.statusEnum, status)
    },
    statusBtnFormatter (status) {
      return this.enumFormat(this.statusBtn, status)
    },
    changeStatus (row) {
      let _this = this
      _this.updataParam.status = row.status === 2 ? 1 : 2
      _this.updataParam.id = row.id
      examPaperApi.updateStatus(_this.updataParam).then(re => {
        if (re.code === 1) {
          row.status = _this.updataParam.status
          _this.$message.success(re.message)
        } else {
          _this.$message.error(re.message)
        }
      })
      this.initSubject()
    },
    search () {
      this.listLoading = true
      examPaperApi.pageList(this.queryParam).then(data => {
        const re = data.response
        this.tableData = re.list
        this.total = re.total
        this.queryParam.pageIndex = re.pageNum
        this.listLoading = false
      })
    },
    deletePaper (row) {
      let _this = this
      examPaperApi.deletePaper(row.id).then(re => {
        if (re.code === 1) {
          _this.search()
          _this.$message.success(re.message)
        } else {
          _this.$message.error(re.message)
        }
      })
    },
    levelChange () {
      this.queryParam.subjectId = null
      this.subjectFilter = this.subjects.filter(data => data.level === this.queryParam.level)
    },
    subjectFormatter  (row, column, cellValue, index) {
      return this.subjectEnumFormat(cellValue)
    },
    ...mapActions('exam', { initSubject: 'initSubject' })
  },
  computed: {
    ...mapGetters('enumItem', ['enumFormat']),
    ...mapState('enumItem', {
      levelEnum: state => state.user.levelEnum,
      statusEnum: state => state.user.statusEnum,
      statusTag: state => state.user.statusTag,
      statusBtn: state => state.user.statusBtn
    }),
    ...mapGetters('exam', ['subjectEnumFormat']),
    ...mapState('exam', { subjects: state => state.subjects })
  }
}
</script>
