<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.eduTeacherQuery.name" placeholder="name" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.eduTeacherQuery.level" placeholder="level" clearable style="width: 100px" class="filter-item">
        <el-option v-for="item in levelOptions" :key="item.level" :label="item.title" :value="item.level" />
      </el-select>
      <el-select v-model="listQuery.eduTeacherQuery.career" placeholder="career" clearable style="width: 100px" class="filter-item">
        <el-option v-for="item in careerOptions" :key="item.career" :label="item.title" :value="item.career===''?'':item.title" />
      </el-select>
      <el-select v-model="listQuery.eduTeacherQuery.isDeleted" placeholder="Type" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in typeOptions" :key="item.isDeleted" :label="item.display_name" :value="item.isDeleted" />
      </el-select>
      <!-- <el-select v-model="listQuery.sort" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
      </el-select> -->
      <el-date-picker
        v-model="gmtCreatePeriod"
        class="filter-item"
        style="margin-right:8px"
        clearable
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :change="getGMTCreateQuery"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
        新增讲师
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="No." prop="number" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.$index+1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="180" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Date" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ (typeof row.gmtCreate === "string"?row.gmtCreate.replace(/T/," "):row.gmtCreate) | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>

        </template>
      </el-table-column>
      <el-table-column label="level" width="80px" align="center">
        <template slot-scope="{row}">
          <!-- <span class="link-type" @click="handleUpdate(row)">{{ row.level }}</span> -->
          <el-tag>{{ row.level | levelFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="career" width="110px" align="center">
        <template slot-scope="{row}">
          <el-tag>{{ row.career }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="name" width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="introduction" width="112" align="center" type="expand">
        <template slot-scope="{row}">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="个人简介">
              <span>{{ row.intro }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column label="讲师状态" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.isDeleted | statusFilter">
            {{ row.isDeleted.toString() | typeFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            Edit
          </el-button>
          <el-button v-if="row.isDeleted.toString() !== typeOptions[2].isDeleted" size="mini" type="danger" @click="handleDelete(row,$index)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.currentPage" :limit.sync="listQuery.rows" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" @closed="resetTemp">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="工作状态" prop="isDeleted">
          <el-select v-if="dialogStatus==='create'" v-model="temp.isDeleted" class="filter-item" placeholder="Please select">
            <el-option :key="typeOptions[1].isDeleted" :label="typeOptions[1].display_name" :value="parseInt(typeOptions[1].isDeleted)" />
          </el-select>

          <el-select v-else v-model="temp.isDeleted" class="filter-item" placeholder="Please select">

            <el-option v-for="(item, index) in typeOptions.slice(1)" :key="item.isDeleted" :label="item.display_name" :value="parseInt(item.isDeleted)" />
          </el-select>
        </el-form-item>
        <el-form-item label="入职日期" prop="gmtCreate">
          <el-date-picker v-model="temp.gmtCreate" type="datetime" placeholder="Please pick a date" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="级别" prop="level">
          <el-select v-model="temp.level" class="filter-item" placeholder="Please select" :value.sync="temp.career">
            <el-option v-for="(item, index) in levelOptions.slice(1)" :key="item.level" :label="item.title" :value="parseInt(item.level)" />
          </el-select>
        </el-form-item>
        <el-form-item label="资历" prop="career">
          <el-select v-model="temp.career" class="filter-item" placeholder="Please select">
            <el-option v-for="(item, index) in careerOptions.slice(1)" :key="item.career" :label="item.title" :value="item.title" />
          </el-select>
        </el-form-item>
        <el-form-item label="照片">
          <AvatarUpload :directory="directory" :image-url="temp.avatar===null?'':temp.avatar" @returnURL="getImageURL" />
        </el-form-item>
        <el-form-item label="个人简历">
          <el-input v-model="temp.intro" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchPv, createArticle, updateArticle } from '@/api/article'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import AvatarUpload from '@/components/AvatarUpload'
import { fetchTeacherList, addTeacher, updateTeacher, removeTeacher } from '@/api/teacher'
const typeOptions = [
  { isDeleted: '', display_name: '全部' },
  { isDeleted: '0', display_name: '在职' },
  { isDeleted: '1', display_name: '离职' }
]

const levelOptions = [
  { level: '', title: '全部' },
  { level: '1', title: '助理' },
  { level: '2', title: '高级' },
  { level: '3', title: '资深' }
]

const careerOptions = [
  { career: '', title: '全部' },
  { career: '1', title: '讲师' },
  { career: '2', title: '教授' }
]

// arr to obj, such as { CN : "China", US : "USA" }

export default {
  name: 'TeacherManagementPage',
  components: { Pagination, AvatarUpload },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        '0': 'success',
        // draft: 'info',
        '1': 'danger'
      }
      return statusMap[status]
    },
    levelFilter(tempLevel) {
      const t = levelOptions.find(item => item.level == tempLevel)
      return t.title
    },
    careerFilter(tempCareer) {
      const t = careerOptions.find(item => item.career == tempCareer)
      return t.title
    },
    typeFilter(type) {
      const t = typeOptions.find(item => item.isDeleted === type)
      return t.display_name
    }
  },
  data() {
    return {
      directory: {
        id: ''
      },
      gmtCreatePeriod: {},
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        currentPage: 1,
        rows: 20,
        eduTeacherQuery: {
          name: undefined,
          level: undefined,
          isDeleted: undefined,
          createStartTime: undefined,
          createEndTime: undefined
        }
      },
      levelOptions,
      typeOptions,
      careerOptions,
      sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        level: undefined,
        intro: '',
        gmtCreate: undefined,
        name: '',
        isDeleted: '',
        career: undefined,
        avatar: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '更新讲师信息',
        create: '新增讲师'
      },
      dialogPvVisible: false,
      pvData: [],
      // 字段校验
      rules: {
        level: [{ required: true, message: 'level is required', trigger: 'change' }],
        gmtCreate: [{ required: true, message: 'timestamp is required', trigger: 'change' }],
        name: [{ required: true, message: 'name is required', trigger: 'blur' }],
        isDeleted: [{ required: true, message: '工作状态必填', trigger: 'change' }],
        career: [{ required: true, message: 'career is required', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  computed: {
    getGMTCreateQuery() {
      console.log(this.gmtCreatePeriod)
      if (this.gmtCreatePeriod != null && this.gmtCreatePeriod.length === 2) {
        this.listQuery.eduTeacherQuery.createStartTime = parseTime(new Date(this.gmtCreatePeriod[0]), '{y}-{m}-{d}T{h}:{i}:{s}')
        this.listQuery.eduTeacherQuery.createEndTime = parseTime(new Date(this.gmtCreatePeriod[1]), '{y}-{m}-{d}T{h}:{i}:{s}')
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getImageURL(imgURL) {
      this.temp.avatar = imgURL
    },
    getList() {
      this.listLoading = true
      fetchTeacherList(this.listQuery).then(response => {
        console.log(response.data.rows)
        this.list = response.data.rows
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 150)
      })
    },
    // 搜索事件处理
    handleFilter() {
      this.listQuery.currentPage = 1
      this.getList()
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.sort = '+id'
      } else {
        this.listQuery.sort = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        level: undefined,
        intro: '',
        gmtCreate: new Date(),
        name: '',
        isDeleted: '',
        career: undefined,
        avatar: undefined
      }
    },
    // 新增讲师
    handleCreate() {
      // this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          console.log(this.temp.career)
          this.temp.author = 'vue-element-admin'
          console.log(this.temp)
          this.temp.gmtCreate = parseTime(new Date(this.temp.gmtCreate), '{y}-{m}-{d}T{h}:{i}:{s}')
          addTeacher(this.temp).then(response => {
            console.log(response)
            this.temp = response.data.user
            // 将新添加的讲师向页面队列中添加
            this.list.unshift(this.temp)
            // 关闭添加讲师dialog
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Created Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.directory.id = this.temp.id
      console.log(this.temp)
      console.log(this.directory)
      this.temp.gmtCreate = new Date(this.temp.gmtCreate)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          // this.nowtime = parseTime(new Date(tempData.gmtCreate), '{y}-{m}-{d}T{h}:{i}:{s}');
          tempData.gmtCreate = parseTime(new Date(tempData.gmtCreate), '{y}-{m}-{d}T{h}:{i}:{s}')// new Date(tempData.gmtCreate) change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          console.log(tempData)
          updateTeacher(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            // splice() 方法用于插入或删除数组中的元素。第三个参数为空则为删除
            // index : 该参数是开始插入和（或）删除的数组元素的下标，必须是数字。
            // howmany	可选。规定应该删除多少元素。必须是数字，但可以是 "0"。 如果未规定此参数，则删除从 index 开始到原数组结尾的所有元素。
            // item1, ..., itemX	可选。要添加到数组的新元素
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: 'Update Successfully',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row, index) {
      console.log(row.id)
      removeTeacher(row.id).then(response => {
        const tempData = Object.assign({}, row)
        tempData.isDeleted = '1'
        console.log(tempData)
        this.list.splice(index, 1, tempData)
        this.$notify({
          title: 'Success',
          message: 'Delete Successfully',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['timestamp', 'title', 'type', 'importance', 'status']
        const filterVal = ['timestamp', 'title', 'type', 'importance', 'status']
        const data = this.formatJson(filterVal)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
