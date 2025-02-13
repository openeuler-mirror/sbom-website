<template>
  <div class="packageDependency-container sbom-container">
    <div
      class="package-main"
      v-for="(part, partIndex) in config"
      :key="partIndex"
    >
      <div class="package-title">
        <div class="title">
          <img src="@/assets/images/titleIcon2.png" alt="" />
          {{ part.title }}
        </div>
        <div class="search">
          <el-input
            placeholder="请输入namespace或name，按enter键搜索"
            :suffix-icon="Search"
            v-model="search[part.prop]"
            @blur="getData"
            @keyup.enter="getData"
          >
          </el-input>
        </div>
      </div>
      <div class="sbom-table">
        <el-table
          :data="tableData[part.prop]"
          stripe
          border
          highlight-current-row
        >
          <template #empty>
            <div class="no-data">
              <img src="@/assets/images/no-data.png" alt="" />
              <p>暂无相关内容</p>
            </div>
          </template>
          <el-table-column type="index" label="编号" width="80">
          </el-table-column>
          <el-table-column
            v-for="(col, colIndex) in columns[part.prop]"
            :key="colIndex"
            :label="col.label"
            show-overflow-tooltip
            :class-name="col.prop === 'qualifiers' ? 'cell-list' : ''"
          >
            <template #default="scope">
              <template v-if="col.prop === 'qualifiers' && scope.row[col.prop]">
                <div v-for="(item, key) in scope.row[col.prop]" :key="key">
                  <span>{{ key }}: </span>
                  <span>{{ item }}</span>
                </div>
              </template>
              <span v-else>{{ scope.row[col.prop] }}</span>
            </template>
          </el-table-column>
        </el-table>
        <!-- <div class="sbom-pagination">
          <el-pagination 
            layout="total, sizes, prev, pager, next, jumper" 
            :page-sizes="[10, 15, 20, 25, 30]"
            :total="pagination[part.prop].total" 
            :page-size="pagination[part.prop].pageSize" 
            v-model:page-size="pagination[part.prop].pageSize" 
            v-model:currentPage="pagination[part.prop].pageNum"
            @current-change="(val)=>{ handlePageChange(part.prop,val) }" 
            @size-change="(val)=>{ handleSizeChange(part.prop,val) }"
          />
        </div> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import ResponseData from "@/types/ResponseData";
import SbomDataService from "@/services/SbomDataService";
import { ElMessage } from "element-plus";
function defaultPagination() {
  return {
    pageNum: 1,
    pageSize: 10,
    total: 0,
  };
}
export default defineComponent({
  name: "package",
  components: {},
  data() {
    return {
      Search: Search,
      config: [
        { title: "Package Info", prop: "packageInfo" },
        { title: "Module Info", prop: "module" },
        { title: "Dependency", prop: "dependency" },
        { title: "Runtime Dependency", prop: "runtime" },
      ],
      columns: {
        packageInfo: [
          { label: "软件包名", prop: "pkgName" },
          { label: "包管理类型", prop: "type" },
          { label: "name", prop: "name" },
          { label: "version", prop: "version" },
          { label: "qualifiers", prop: "qualifiers" },
        ],
        module: [
          { label: "软件包名", prop: "pkgName" },
          { label: "包管理类型", prop: "type" },
          { label: "namespace", prop: "namespace" },
          { label: "name", prop: "name" },
          { label: "version", prop: "version" },
        ],
        dependency: [
          { label: "软件包名", prop: "pkgName" },
          { label: "包管理类型", prop: "type" },
          { label: "namespace", prop: "namespace" },
          { label: "name", prop: "name" },
          { label: "version", prop: "version" },
        ],
        runtime: [
          { label: "软件包名", prop: "pkgName" },
          { label: "包管理类型", prop: "type" },
          { label: "name", prop: "name" },
          { label: "version", prop: "version" },
          { label: "qualifiers", prop: "qualifiers" },
        ],
      },
      search: {
        packageInfo: "",
        module: "",
        dependency: "",
        runtime: "",
      },
      pagination: {
        packageInfo: defaultPagination(),
        module: defaultPagination(),
        dependency: defaultPagination(),
        runtime: defaultPagination(),
      },
      tableData: {
        packageInfo: [] as Map<string, any>[],
        module: [] as Map<string, any>[],
        dependency: [] as Map<string, any>[],
        runtime: [] as Map<string, any>[],
      },
      dataList: {
        packageList: [] as Map<string, any>[],
        provideList: [] as Map<string, any>[],
        externalList: [] as Map<string, any>[],
        relationshipList: [] as Map<string, any>[],
      },
    };
  },
  methods: {
    queryPackageBinary(packageId: string) {
      SbomDataService.queryPackageBinaryManagement(packageId, "ALL")
        .then((response: ResponseData) => {
          this.dataList = response.data;
          this.getData();
        })
        .catch((e: any) => {
          if (e.response && e.response.status == 500) {
            ElMessage({
              message: e.response.data,
              type: "error",
            });
          }
          this.dataList = {
            packageList: [] as Map<string, any>[],
            provideList: [] as Map<string, any>[],
            externalList: [] as Map<string, any>[],
            relationshipList: [] as Map<string, any>[],
          };
        });
    },
    getData() {
      const { packageInfo, module, dependency, runtime } = this.search;
      const { packageList, provideList, externalList, relationshipList } =
        this.dataList;
      this.tableData.packageInfo = filterTableData(packageInfo, packageList);
      this.tableData.module = filterTableData(module, provideList);
      this.tableData.dependency = filterTableData(dependency, externalList);
      this.tableData.runtime = filterTableData(runtime, relationshipList);
    },
    handlePageChange(prop: string, val: number) {
      console.log(prop, val);
    },
    handleSizeChange(prop: string, val: number) {
      console.log(prop, val);
    },
  },
  mounted() {
    this.queryPackageBinary(this.$route.params.id.toString());
  },
});

const filterTableData: any = (
  searchExternal: string,
  tableDataList: Map<string, any>[]
) => {
  let tableData = transferPurl(tableDataList);
  if (tableData.length == 0) {
    return tableData;
  }
  return tableData.filter(
    (data: any) =>
      !searchExternal ||
      String(data.name).toLowerCase().includes(searchExternal.toLowerCase()) ||
      String(data.namespace)
        .toLowerCase()
        .includes(searchExternal.toLowerCase())
  );
};

const transferPurl: any = (list: any) => {
  let purlList: any[] = [];
  list.forEach((element: any) => {
    if (element.type === "purl") {
      purlList.push({
        ...element.purl,
        pkgName: element.pkgName,
      });
    }
  });
  return purlList;
};
</script>

<style lang="less" scoped>
.packageDependency-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  .package-main {
    width: 50%;
    padding: 20px 0;
    &:nth-child(1) {
      border-bottom: 2px dashed #d9e0ed;
      border-right: 2px dashed #d9e0ed;
    }
    &:nth-child(2) {
      border-bottom: 2px dashed #d9e0ed;
    }
    &:nth-child(3) {
      border-right: 2px dashed #d9e0ed;
    }
    .package-title {
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 15px;
      padding: 0 20px;
      .title {
        display: flex;
        height: 32px;
        align-items: center;
        font-size: 16px;
        font-weight: bold;
        color: #000000;
        img {
          margin-right: 10px;
        }
      }
    }
  }
}
</style>
<style lang="less">
.packageDependency-container {
  .search {
    width: 340px;
    .el-input__inner {
      height: 30px;
      background-color: #ffffff;
      border-radius: 4px;
      &::placeholder {
        color: #cfd5e3;
        font-size: 14px;
      }
    }
    .el-icon {
      color: #333;
    }
  }
  .sbom-table {
    padding: 0 20px;
    background-color: #ffffff;
    .el-table {
      .el-table__body-wrapper {
        max-height: calc(100vh - 555px);
        min-height: 200px;
        height: auto;
        overflow: auto;
      }
    }
  }
}
</style>
