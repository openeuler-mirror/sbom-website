<template>
  <el-config-provider :locale="locale">
    <div id="app">
      <router-view />
    </div>
  </el-config-provider>
</template>

<script lang="ts">
import { ElConfigProvider } from 'element-plus';
import { defineComponent } from "vue";
import zhCn from "element-plus/lib/locale/lang/zh-cn";
export default defineComponent({
  name: "App",
  components: {
    ElConfigProvider
  },
  data() {
    return {
      locale: zhCn
    }
  },
  methods: {},
  provide() {
    return {
      
    }
  }
});
</script>

<style lang="less">
@import './assets/css/common.less';
#app{
  background-color: #F0F3F6;
  min-height: 100vh;
  min-width: 1400px;
  overflow: auto;
}
</style>
