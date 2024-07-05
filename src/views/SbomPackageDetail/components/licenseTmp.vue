<template>
  <div class="content">
    <div
      class="buttons"
      v-for="(license, licenseIndex) in licenseContent"
      :key="licenseIndex"
    >
      <el-tooltip
        v-if="license.licenseName"
        effect="dark"
        :content="license.licenseName"
        placement="top"
      >
        <div
          class="licenseItem"
          :class="{ canClick: license.licenseUrl }"
          @click="goPath(license)"
        >
          <span :class="['dot', license.legal ? 'green' : 'red']"></span>
          <span class="txt">{{ license.licenseId }}</span>
        </div>
      </el-tooltip>
      <div
        v-else
        class="licenseItem"
        :class="{ canClick: license.licenseUrl }"
        @click="goPath(license)"
      >
        <span :class="['dot', license.legal ? 'green' : 'red']"></span>
        <span class="txt">{{ license.licenseId }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import SbomDataService from "@/services/SbomDataService";
import ResponseData from "@/types/ResponseData";
import { ElMessage } from "element-plus";

export default defineComponent({
  name: "license",
  components: {},
  props: {
    license: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      licenseContent: [],
      copyrightContent: [],
    };
  },
  methods: {
    queryPackageLicenseAndCopyright() {
      const packageId: string = this.$route.params.id.toString();
      SbomDataService.queryPackageLicenseAndCopyright(packageId)
        .then((response: ResponseData) => {
          const { licenseContent, copyrightContent } = response.data;
          this.licenseContent = licenseContent;
          this.copyrightContent = copyrightContent;
        })
        .catch((e: any) => {
          if (e.response && e.response.status == 500) {
            ElMessage({
              message: e.response.data,
              type: "error",
            });
          }
          this.licenseContent = [];
          this.copyrightContent = [];
        });
    },
    goPath(item) {
      if (item.licenseUrl) {
        window.open(item.licenseUrl, "_blank");
      }
    },
  },
  mounted() {
    this.queryPackageLicenseAndCopyright();
  },
});
</script>

<style lang="less" scoped>
.content {
  display: flex;
  align-items: center;
  margin-top: 10px;
  flex-wrap: wrap;
  .label {
    color: #666666;
    margin-right: 10px;
    min-width: 60px;
    &.spe {
      min-width: 115px;
    }
  }
  .buttons {
    display: flex;
    margin-bottom: 10px;
  }
}
</style>
