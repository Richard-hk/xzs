<template>
  <div class="app-container">
    <el-form :model="queryParam" ref="queryForm" :inline="true">
      <el-form-item label="用户名：">
        <el-input v-model="queryParam.userName"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm">查询</el-button>
        <el-button type="primary" @click="dialogVisible = true">批量上传</el-button>
        <router-link :to="{ path: '/user/student/edit' }" class="link-left">
          <el-button type="primary">添加</el-button>
        </router-link>
      </el-form-item>
    </el-form>

    <el-dialog title="批量上传用户信息" :visible.sync="dialogVisible" width="30%">
      <el-upload class="upload-demo" action="" :on-change="handleChange" :auto-upload="false" :on-remove="handleRemove"
        :file-list="fileList" :limit="1" accept=".xls, .xlsx">
        <el-button size="small" type="primary">点击上传</el-button>
        <div slot="tip" class="el-upload__tip" style="line-height: 1.5;">
          只能上传xls/xlsx文件，且每个文件最大500kb<br />
          <span style="color: red;">请注意相同用户名的身份证号信息会覆盖！</span>
        </div>
      </el-upload>
      <a href="http://129.204.20.76/assets/template/userinfo.xlsx" download="用户模板.xlsx">
        <el-button size="small" type="success">下载模板</el-button>
      </a> <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </span>
    </el-dialog>
    <el-table v-loading="listLoading" :data="tableData" border fit highlight-current-row style="width: 100%">
      <el-table-column prop="id" label="Id" />
      <el-table-column prop="userName" label="用户名" />
      <el-table-column prop="userLevel" label="级别" :formatter="levelFormatter" />
      <el-table-column prop="sex" label="性别" width="60px;" :formatter="sexFormatter" />
      <el-table-column prop="phone" label="手机号" />
      <el-table-column prop="createTime" label="创建时间" width="160px" />
      <el-table-column label="状态" prop="status" width="70px">
        <template slot-scope="{ row }">
          <el-tag :type="statusTagFormatter(row.status)">
            {{ statusFormatter(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column width="270px" label="操作" align="center">
        <template slot-scope="{ row }">
          <el-button size="mini" @click="changeStatus(row)" class="link-left">
            {{ statusBtnFormatter(row.status) }}
          </el-button>
          <router-link :to="{ path: '/user/student/edit', query: { id: row.id } }" class="link-left">
            <el-button size="mini">编辑</el-button>
          </router-link>
          <router-link :to="{ path: '/log/user/list', query: { userId: row.id } }" class="link-left">
            <el-button size="mini">日志</el-button>
          </router-link>
          <el-button size="mini" type="danger" @click="deleteUser(row)" class="link-left">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParam.pageIndex" :limit.sync="queryParam.pageSize"
      @pagination="search" />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Pagination from '@/components/Pagination'
import userApi from '@/api/user'
import * as XLSX from 'xlsx'

export default {
  components: { Pagination },
  data () {
    return {
      queryParam: {
        userName: '',
        role: 1,
        pageIndex: 1,
        pageSize: 10
      },
      listLoading: true,
      tableData: [],
      total: 0,
      dialogVisible: false,
      fileList: [],
      fileInfo: []
    }
  },
  created () {
    this.search()
  },
  methods: {
    search () {
      this.listLoading = true
      userApi.getUserPageList(this.queryParam).then((data) => {
        const re = data.response
        this.tableData = re.list
        this.total = re.total
        this.queryParam.pageIndex = re.pageNum
        this.listLoading = false
      })
    },
    changeStatus (row) {
      let _this = this
      userApi.changeStatus(row.id).then((re) => {
        if (re.code === 1) {
          row.status = re.response
          _this.$message.success(re.message)
        } else {
          _this.$message.error(re.message)
        }
      })
    },
    deleteUser (row) {
      let _this = this
      userApi.deleteUser(row.id).then((re) => {
        if (re.code === 1) {
          _this.search()
          _this.$message.success(re.message)
        } else {
          _this.$message.error(re.message)
        }
      })
    },
    submitForm () {
      this.queryParam.pageIndex = 1
      this.search()
    },
    levelFormatter (row, column, cellValue, index) {
      return this.enumFormat(this.levelEnum, cellValue)
    },
    sexFormatter (row, column, cellValue, index) {
      return this.enumFormat(this.sexEnum, cellValue)
    },
    statusFormatter (status) {
      return this.enumFormat(this.statusEnum, status)
    },
    statusTagFormatter (status) {
      return this.enumFormat(this.statusTag, status)
    },
    statusBtnFormatter (status) {
      return this.enumFormat(this.statusBtn, status)
    },
    handleChange (file, fileList) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const filedata = XLSX.utils.sheet_to_json(worksheet)
        this.fileInfo = filedata.map((row) => {
          return {
            userName: row['用户名'],
            password: row['身份证号']
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
      userApi.insertUsers(this.fileInfo).then((data) => {
        this.dialogVisible = false
        this.$message.success('上传成功')
        window.location.reload()
      }).catch((error) => {
        this.$message.error('上传失败：' + error.message)
      })
      this.fileInfo = []
      this.fileList = []
    }
  },
  computed: {
    ...mapGetters('enumItem', ['enumFormat']),
    ...mapState('enumItem', {
      sexEnum: (state) => state.user.sexEnum,
      statusEnum: (state) => state.user.statusEnum,
      statusTag: (state) => state.user.statusTag,
      statusBtn: (state) => state.user.statusBtn,
      levelEnum: (state) => state.user.levelEnum
    })
  }
}
</script>
