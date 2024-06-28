<template>
  <div class="sbomPackageDetail-container">
    <div class="sbomPackageDetail-main">
      <div class="sbomPackageDetail-title">软件包详情</div>
      <el-tabs v-model="activeName" type="card" class="sbomPackageDetailTabs">
        <el-tab-pane label="SBOM 元数据" name="sbomData">
          <sbom-data
            :sbomData="packageDetails"
            :vulnerabilityData="vulnerabilityData"
          />
        </el-tab-pane>
        <el-tab-pane label="CVE" name="bug">
          <SbomVulnerabilityTable
            :packageId="$route.params.id.toString()"
            :productName="productName"
          />
        </el-tab-pane>
        <el-tab-pane label="软件包依赖" name="package">
          <package-dependency />
        </el-tab-pane>
        <el-tab-pane label="上游社区&Patch" name="upstreamAndPatch">
          <upstream-and-patchInfo />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import sbomData from "./components/sbomData.vue";
import SbomVulnerabilityTable from "@/components/SbomVulnerabilityTable.vue";
import packageDependency from "./components/packageDependency.vue";
import upstreamAndPatchInfo from "./components/upstreamAndPatchInfo.vue";
import SbomPackage from "@/types/SbomPackage";
import SbomDataService from "@/services/SbomDataService";
import ResponseData from "@/types/ResponseData";
import { ParseUriProductName } from "@/utils";
import { ElMessage } from "element-plus";

export default defineComponent({
  name: "sbom-package-detail",
  components: {
    sbomData,
    SbomVulnerabilityTable,
    packageDependency,
    upstreamAndPatchInfo,
  },
  data() {
    return {
      activeName: "sbomData",
      packageDetails: {} as SbomPackage,
      productName: "",
      vulnerabilityData: {},
      ParseUriProductName: ParseUriProductName,
    };
  },
  methods: {
    queryPackageDetails(packageId: string) {
      SbomDataService.querySbomPackageById(packageId)
        .then((response: ResponseData) => {
          this.packageDetails = response.data;
        })
        .catch((e: any) => {
          if (e.response && e.response.status == 500) {
            ElMessage({
              message: e.response.data,
              type: "error",
            });
          }
          this.packageDetails = {} as SbomPackage;
        });
    },
    queryPackageVuls(packageId: string) {
      SbomDataService.queryPackageVulsById(packageId)
        .then((response: ResponseData) => {
          this.vulnerabilityData = response.data;
        })
        .catch((e: any) => {
          if (e.response && e.response.status == 500) {
            ElMessage({
              message: e.response.data,
              type: "error",
            });
          }
          this.vulnerabilityData = {};
        });
    },
  },
  mounted() {
    this.productName = this.ParseUriProductName();
    this.queryPackageDetails(this.$route.params.id.toString());
    this.queryPackageVuls(this.$route.params.id.toString());
  },
});
</script>

<style lang="less" scoped>
.sbomPackageDetail-container {
  padding: 20px 32px;
  width: 100%;
  height: auto;
  .sbomPackageDetail-main {
    background-color: #fff;
    // height: calc(100vh - 113px);
    padding: 0px 20px 20px 20px;
    .sbomPackageDetail-title {
      font-size: 18px;
      font-weight: bold;
      color: #000000;
      padding: 20px 0;
    }
  }
}
</style>
<style lang="less">
.el-tabs.sbomPackageDetailTabs {
  border: 1px solid #eef0f1;
  .el-tabs__header {
    margin-bottom: 0px;
    border-bottom: none;
    background-color: #fcfbfe;
    .el-tabs__nav {
      border-top: none;
    }
  }
  .el-tabs__item {
    height: 40px;
    width: 160px;
    line-height: 32px;
    text-align: center;
    font-size: 14px;
    font-weight: bold;
    color: #333333;
    border-color: #eef0f1;
    border-top: 3px solid transparent;
    &.is-active {
      border-top: 3px solid #4971ff;
      color: #4971ff;
    }
  }
  .el-tabs__content {
    min-height: calc(100vh - 262px);
    overflow: auto;
  }
}
</style>
