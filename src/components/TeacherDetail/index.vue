<template>
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
        <AvatarUpload :action-url="actionUrl" :directory="directory" :image-url.sync="temp.avatar===null?'':temp.avatar" @returnURL="getImageURL" />
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
</template>
<script>
import defaultOptions from './default-options'

</script>
