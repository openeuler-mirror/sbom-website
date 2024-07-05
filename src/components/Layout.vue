<template>
  <div :class="{ thirdPart }">
    <div v-if="thirdPart" class="thirdPartHeader">
      <div class="navList" v-show="$route.name != 'package-details'">
        <div 
          v-for="(nav,navIndex) in navList"
          :key="navIndex"
          class="navItem" 
          :class="{active: activeName === nav.value}"
          @click="goPath(nav)"
        >
          <div class="link" :to="nav.path">{{ nav.label }}</div>
          <div class="Bottomborder"></div>
        </div>
      </div>
    </div>
    <div class="header" v-if="!thirdPart">
      <router-link to="/">
        <img src="@/assets/images/logo.png" alt="">
      </router-link>
      <div class="navList" v-show="$route.name != 'package-details'">
        <a 
          v-for="(nav,navIndex) in navList" :key="navIndex"
          class="navItem" 
          :class="{active: activeName === nav.value}" 
          :href="getHref(nav, navIndex)"
          @click.exact="handleContextmenu(nav, navIndex, 'self')" 
          @click.ctrl.exact="handleContextmenu(nav, navIndex, 'blank')"
          @contextmenu.exact="handleContextmenu(nav, navIndex, 'blank')"
        >
          <div class="link"> {{ nav.label }} </div>
          <div class="Bottomborder"></div>
        </a>
        
      </div>
      <div class="userInfo">
        <el-dropdown popper-class="userInfoPopper" trigger="click">
          <div class="el-dropdown-link">
            <div class="user">
              <img :src="getUser.avatarUrl ? getUser.avatarUrl : defaultAvartar" alt="">
              {{ getUser.name }}
              <el-icon :size="16" color="#ffffff">
                <ArrowDown />
              </el-icon>
            </div>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <div class="item" @click="logout">
                  <el-icon :size="16">
                    <switch-button />
                  </el-icon>
                  退出登录
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
      <ProductInformation />
    <!-- <template>
    </template> -->
    <div>
      <!-- <div class="container mt-3"> -->
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { Download, Search, Expand, ArrowDown, SwitchButton } from '@element-plus/icons-vue';
import { defineComponent } from "vue";
import { useRouter } from 'vue-router';
import ProductInformation from '@/components/productInformation.vue';
import { mapMutations, mapGetters} from 'vuex';
import SbomDataService from "@/services/SbomDataService";
import { ElMessage } from "element-plus";
import ResponseData from "@/types/ResponseData";
export default defineComponent({
  name: "App",
  components: {
    ProductInformation,
    ArrowDown,
    SwitchButton
  },
  data() {
    return {
      downloadIcon: Download,
      Search: Search,
      Expand: Expand,
      useRouter: useRouter,
      navList: [
        // { label: '风险看板', path: '/sbomDashboard', value: 'sbomDashboard', href: '' },
        { label: '软件成分查询', path: '/sbomPackages', value: 'sbomPackages', href: ''  },
        { label: '开源软件反向追溯链', path: '/sbomTraceChain', value: 'sbomTraceChain', href: ''  },
        // { label: '漏洞影响范围查询', path: '/sbomVulnerability', value: 'sbomVulnerability', href: ''  },
        // { label: '制品漏洞全景', path: '/sbomPanorama', value: 'sbomPanorama', href: ''  },
      ],
      activeName: this.$route.name || '',
      isShow: false,
      thirdPart: false,
      defaultAvartar: require('@/assets/images/userAvatar.png')
    }
  },
  computed:{
    ...mapGetters([
      'getIsThirdPart',
      'getProductName',
      'getUser'
    ])
  },
  methods: {
    goPath(nav: any) {
      this.$router.push({
        path: nav.path
      })
    },
    openNewTab(nav: any) {
      const { href } = this.$router.resolve({
        path: nav.path,
        query: {
          productName: this.getProductName
        }
      })
      window.open(href, '_blank')
    },
    getHref(nav: any, index) {
      return this.navList[index].href || `#${nav.path}`
    },
    handleContextmenu(nav, index, type) {
      this.navList[index].href = (type === 'self' || !this.getProductName)
        ? `#${nav.path}` 
          : `#${nav.path}?productName=${this.getProductName}`
    },
    logout() {
      SbomDataService.handleLogout()
        .then((response: ResponseData) => {
          this.setUser({})
          this.$router.push('/login')
        })
        .catch((e: any) => {
          if (e.response && e.response.status == 500) {
            ElMessage({
              message: e.response.data,
              type: "error",
            });
          }
        });
    },
    ...mapMutations(['setIsThirdPart', 'setUser'])

  },
  watch: {
    $route: {
      deep: true,
      handler(route) {
        this.isShow = !route.path.includes('sbomPackageDetail')
        if(this.isShow) {
          this.activeName = route.name || ''
        }
        // 判断是否第三方平台
        if(route.query) {
          const query = route.query
          if(query.thirdPart) {
            this.setIsThirdPart(query.thirdPart)
          }
        }
      }
    },
    getIsThirdPart() {
      this.thirdPart = this.getIsThirdPart
    }
  },
  mounted() {
    this.thirdPart = this.getIsThirdPart
    this.isShow = !this.$route.path.includes('sbomPackageDetail')
  },

  provide() {
    return {
      
    }
  }
});
</script>

<style lang="less" scoped>
  .header{
    height: 73px;
    background-color: #191A35;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30px;
    font-size: 14px;
    .navList{
      width:calc(100% - 420px);
      display: flex;
      align-items: center;
      padding-top: 10px;
      .navItem{
        margin-left: 84px;
        min-width: 60px;
        text-align: center;
        cursor: pointer;
        .Bottomborder{
          height: 3px;
          background-color: transparent;
          width: 30px;
          margin: 10px auto 0;
        }
        .link{
          color: #ffffff;
          opacity: 0.5;
        }
        &:hover,
        &.active{
          text-decoration: none;
          .link{
            opacity: 1;
          }
          .Bottomborder{
            background-color: #fff;
          }
        }
      }
    }
    .userInfo{
      min-width: 50px;
      .user{
        display: flex;
        align-items: center;
        color: #fff;
        font-size: 14px;
        img{
          width: 30px;
          height: 30px;
          margin-right: 8px;
          border-radius: 50%;
        }
        .el-icon{
          margin-left: 15px;
        }
      }
    }
  }
  .thirdPartHeader{
    border-bottom: 1px solid #e7eaeb;
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding-left: 30px;
    .navList{
      display: flex;
      align-items: center;
      .navItem{
        font-size: 16px;
        color: #191A35;
        padding: 20px 0;
        margin-right: 50px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        &.active{
          color: #4971FF;
          border-bottom-color: #4971FF;
        }
      }
    }
  }
</style>
<style lang="less">
.el-popper.userInfoPopper{
  .el-dropdown-menu__item .item{
    display: flex;
    align-items: center;
  }
}
</style>
