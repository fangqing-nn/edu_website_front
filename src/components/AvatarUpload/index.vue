<template>
  <div>
    <el-upload
      class="avatar-uploader"
      action="http://localhost:8002/oss/file/uploadAvatar"
      :show-file-list="false"
      :on-success="handleAvatarSuccess"
      :data="directory"
      :limit="1"
      :before-upload="beforeAvatarUpload"
    >
      <img v-if="imageUrl" :src="imageUrl" class="avatar">
      <i v-else class="el-icon-plus avatar-uploader-icon" />
    </el-upload>
  </div>
</template>

<script>
export default {
  name: 'AvatarUpload',
  props: {
    imageUrl: {
      type: String,
      default: ''
    },
    directory: {
      type: Object,
      required: true,
      default() {
        return { id: '' }
      }
    }
  },
  mounted() {
    // console.log(this.directory)
  },
  methods: {
    handleAvatarSuccess(res, file) {
      this.imageUrl = res.data.urlPath
      console.log(this.imageUrl)
      this.$emit('returnURL', this.imageUrl)
    },
    beforeAvatarUpload(file) {
      console.log('我是beforeAvatarUpload')
      console.log(file)
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    }
  }
}
</script>

<style scoped>

  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    border-style:solid;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
    border: 1px dashed #d9d9d9;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
