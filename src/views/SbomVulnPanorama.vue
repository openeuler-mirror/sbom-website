<template>
  <div class="sbom-container">
    <div class="sbom-main">
      <div class="table-top">
        <div class="table-title">· 漏洞列表</div>
      </div>
      <div class="table-form">
        <el-form
          class="query-list"
          :model="queryForm"
          label-width="auto"
          status-icon
        >
          <el-form-item label="漏洞编号：" prop="vulId">
            <el-input
              v-model="queryForm.vulId"
              placeholder="按enter键搜索"
              @keyup.enter="search"
            />
          </el-form-item>
          <el-form-item label="Issue ID：" prop="issueId">
            <el-input
              v-model="queryForm.issueId"
              placeholder="按enter键搜索"
              @keyup.enter="search"
            />
          </el-form-item>
          <el-form-item label="软件包名称：" prop="rpmName">
            <el-input
              v-model="queryForm.rpmName"
              placeholder="按enter键搜索"
              @keyup.enter="search"
            />
          </el-form-item>
          <el-form-item label="漏洞状态：" prop="vulStatus">
            <el-select
              v-model="queryForm.vulStatus"
              clearable
              filterable
              placeholder="请选择"
              @change="search"
            >
              <el-option
                v-for="(item, itemIndex) in vulStatusList"
                :key="itemIndex"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="Issue状态：" prop="issueStatus">
            <el-select
              v-model="queryForm.issueStatus"
              clearable
              filterable
              placeholder="请选择"
              @change="search"
            >
              <el-option
                v-for="(item, itemIndex) in issueStatusList"
                :key="itemIndex"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="sbom-table">
        <el-table
          ref="singleTableRef"
          :data="pageData"
          border
          highlight-current-row
          max-height="100%"
        >
          <template #empty>
            <div class="no-data">
              <img src="@/assets/images/no-data.png" alt="" />
              <p>暂无相关内容</p>
            </div>
          </template>
          <el-table-column
            fixed
            type="index"
            label="编号"
            width="70"
            :index="indexCounter"
          />
          <el-table-column
            fixed
            property="rpmName"
            label="漏洞编号"
            width="250"
            show-overflow-tooltip
          >
            <template #default="scope">
              <div class="link" @click="openEchart(scope.row)">
                {{ scope.row.vulId }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            fixed
            property="rpmName"
            label="软件包名称"
            show-overflow-tooltip
          >
            <template #default="scope">
              <img class="imgIcon" src="@/assets/images/package.png" alt="" />
              <span>{{ scope.row.rpmName }}</span>
            </template>
          </el-table-column>
          <el-table-column property="issueId" label="Issue ID" />
          <el-table-column property="issueStatus" label="Issue状态" />
          <el-table-column property="vulStatus" label="漏洞状态" />
          <el-table-column
            property="repoLocation"
            label="仓库地址"
            min-width="200"
            show-overflow-tooltip
          />
        </el-table>
        <div class="sbom-pagination">
          <el-pagination
            layout="total, sizes, prev, pager, next, jumper"
            :page-sizes="[10, 15, 20, 25, 30]"
            :total="totalElements"
            :page-size="pageSize"
            v-model:page-size="pageSize"
            v-model:currentPage="pageNum"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import { Search } from "@element-plus/icons-vue";
import SbomDataService from "@/services/SbomDataService";
import ResponseData from "@/types/ResponseData";
import { IsSelectArtifact } from "@/utils";
import { mapGetters } from "vuex";
import { ElMessage } from "element-plus";

export default defineComponent({
  name: "sbom-panorama",
  data() {
    return {
      pageData: [],
      pageNum: ref(1),
      pageSize: ref(10),
      totalElements: ref(0),
      Search: Search,
      showVulnDialog: false,
      queryForm: {
        vulId: "",
        issueId: "",
        rpmName: "",
        vulStatus: "",
        issueStatus: "",
      },
      vulStatusList: [
        { label: "进行中", value: "进行中" },
        { label: "已拒绝", value: "已拒绝" },
        { label: "待办的", value: "待办的" },
        { label: "已挂起", value: "已挂起" },
        { label: "已完成", value: "已完成" },
      ],
      issueStatusList: [
        { label: "open", value: "open" },
        { label: "closed", value: "closed" },
        { label: "rejected", value: "rejected" },
      ],
    };
  },
  computed: {
    ...mapGetters(["getProductName"]),
  },
  watch: {
    getProductName() {
      this.search();
    },
  },
  methods: {
    indexCounter(index: number) {
      return index + (this.pageNum - 1) * this.pageSize + 1;
    },

    handlePageChange(val: number) {
      this.retrievePackages();
    },

    handleSizeChange(val: number) {
      this.search();
    },
    search() {
      this.pageNum = 1;
      this.retrievePackages();
    },

    retrievePackages() {
      if (!IsSelectArtifact(true)) {
        this.pageData = [];
        return;
      }

      let param: any = {
        ...this.queryForm,
        page: this.pageNum,
        size: this.pageSize,
      };

      SbomDataService.queryProductVulImpact(this.getProductName, param)
        .then((response: ResponseData) => {
          this.pageData = response.data.content;
          this.totalElements = response.data.totalElements;
        })
        .catch((e: any) => {
          if (e.response && e.response.status == 500) {
            ElMessage({
              message: e.response.data,
              type: "error",
            });
          }
          this.totalElements = 0;
          this.pageData = [];
        });
    },

    openEchart(rowInfo) {
      const { href } = this.$router.resolve({
        path: "/sbomVulImpactChart",
        query: {
          productName: this.getProductName,
          vulId: rowInfo.vulId,
        },
      });
      window.open(href, '_blank');
    },

    goPath(item) {
      if (item.licenseUrl) {
        window.open(item.licenseUrl, "_blank");
      }
    },
  },
  mounted() {
    this.retrievePackages();
  },
});
</script>

<style lang="less" scoped>
.sbom-table {
  /deep/.el-scrollbar__bar.is-vertical {
    display: none !important;
  }
}
</style>
