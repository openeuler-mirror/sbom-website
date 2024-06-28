<template>
  <div class="login-container">
    <div class="login-main">
      <div class="title">账号登录</div>
      <div class="main">
        <div class="img">
          <img src="@/assets/images/loginLogo.png" alt="" />
        </div>
        <el-button @click="handleLogin"> 登录 </el-button>
      </div>
      <div class="tips">
        <img src="@/assets/images/loginIcon.png" alt="" />
        <span> 本平台默认使用码云账号登录 </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'
import SbomDataService from '@/services/SbomDataService'
import ResponseData from '@/types/ResponseData'
import { ElMessage } from 'element-plus'
import { mapMutations } from 'vuex'

export default defineComponent({
  name: 'SbomVulnerabilityTable',
  components: {},
  props: {},
  data() {
    return {}
  },
  computed: {}, 
  watch: {},
  methods: {
    ...mapMutations(['setUser']),
    handleLogin() {
      SbomDataService.handleLogin()
        .then((response: ResponseData) => {
          const { authUrl } = response.data
          location.replace(authUrl)
        })
        .catch((e: any) => {
          if (e.response && e.response.status == 500) {
            ElMessage({
              message: e.response.data,
              type: 'error',
            })
          }
        })
    },

    init() {
      if (this.$route.path === '/login/hasinfo') {
        SbomDataService.getUserInfo().then(async (res: ResponseData) => {
          const { data } = res.data
          this.setUser({
            name: data.name,
            userId: data.id,
            userLogin: data.login,
            avatarUrl: data.avatarUrl
          })
          this.$router.push('/')
        })
      }
    },
  },
  mounted() {
    this.init()
  },
})
</script>

<style lang="less" scoped>
.login-container {
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('../../assets/images/loginBg.png') center center no-repeat;
  .login-main {
    width: 423px;
    height: auto;
    background: #ffffff;
    box-shadow: 0px 5px 16px 0px rgba(140, 140, 140, 0.18);
    border-radius: 8px;
    padding: 60px 45px 70px 45px;
    .title {
      text-align: center;
      font-weight: 500;
      font-size: 24px;
      color: #000000;
      margin-bottom: 40px;
    }
    .main {
      text-align: center;
    }
    .tips {
      font-weight: 500;
      font-size: 14px;
      color: #333333;
      margin-top: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        margin-right: 8px;
      }
    }
    .el-button {
      width: 100%;
      height: 50px;
      background-color: #4971ff;
      border-radius: 7px;
      border: 1px solid #c4cbdd;
      font-weight: 500;
      font-size: 16px;
      color: #ffffff;
      margin-top: 40px;
      letter-spacing: 5px;
    }
  }
}
</style>
<style lang="less">
.login-container {
  .el-form {
    .el-form-item {
      .el-form-item__content {
        .el-input__wrapper {
          border-radius: 7px;
          .el-input__icon {
            font-size: 16px;
            color: #a8afbe;
          }
        }
        .el-input__inner {
          height: 48px;
          background-color: #ffffff;
          color: #000000;
          font-size: 16px;
          &::placeholder {
            color: #a8afbe;
            font-size: 16px;
          }
        }
        .el-button {
          width: 100%;
          height: 50px;
          background-color: #4971ff;
          border-radius: 7px;
          border: 1px solid #c4cbdd;
          font-weight: 500;
          font-size: 16px;
          color: #ffffff;
          margin-top: 22px;
          letter-spacing: 5px;
        }
      }
    }
  }
}
</style>
