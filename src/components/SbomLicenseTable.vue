<template>
  <el-dialog
    title="制品License列表"
    v-model="dialogVisible"
    :close-on-click-modal="false"
    width="70%"
    custom-class="sbom-dialog"
  >
  <div class="query-list">
    <div class="query-item">
      <span class="label">License 名称：</span> 
      <el-input 
        v-model="licenseId" 
        placeholder="输入license名称搜索" 
        :prefix-icon="Search"
        @keyup.enter="search" 
        @blur="search"
      />
    </div>
  </div>
  <div class="sbom-table">
    <el-table
      :data="tableData" 
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
      <el-table-column 
        v-for="(col,colIndex) in columns"
        :key="colIndex"
        :label="col.label"
        :width="col.width"
        :show-overflow-tooltip="col.showTooltip"
      >
        <template #default="scope">
          <div v-if="col.link" @click="goPath(scope.row)" :class="{ link: scope.row.licenseUrl }">{{ scope.row[col.prop] }}</div>
          <span v-else>{{ scope.row[col.prop] }}</span>
        </template>
      </el-table-column>
    </el-table>
    <div class="sbom-pagination">
      <el-pagination 
        layout="total, sizes, prev, pager, next, jumper" 
        :page-sizes="[10, 15, 20, 25, 30]"
        :total="pagination.total" 
        :page-size="pagination.pageSize" 
        v-model:page-size="pagination.pageSize" 
        v-model:currentPage="pagination.pageNum"
        @current-change="handlePageChange" 
        @size-change="handleSizeChange"
      />
    </div>
  </div>
    
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import SbomDataService from "@/services/SbomDataService";
import { mapGetters} from 'vuex';
import ResponseData from "@/types/ResponseData";
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus';
function defaultPagination() {
  return {
    pageNum: 1,
    pageSize: 10,
    total: 0
  }
}
export default defineComponent({
  name: "SbomLicenseTable",
  data() {
    return {
      Search: Search,
      dialogVisible: false,
      pagination: defaultPagination(),
      columns: [
        { label: '名称', prop: 'licenseId', link: true },
        { label: '是否OSI/FSF认证', prop: 'isLegal' },
        { label: '数量', prop: 'count' },
      ],
      tableData: [],
      licenseId: '',
      orderBy: ''
    };
  },
  computed:{
    ...mapGetters([
      'getProductName'
    ])
  },
  methods: {
    search() {
      this.pagination.pageNum = 1
      this.pagination.pageSize = 10
      this.getDataList()
    },
    handlePageChange(val: number) {
      this.pagination.pageNum = val
      this.getDataList()
    },
    handleSizeChange( val: number) {
      this.pagination.pageNum = 1
      this.pagination.pageSize = val
      this.getDataList()
    },
    goPath(item: any) {
      if(item.licenseUrl) {
        window.open(item.licenseUrl, '_blank')
      }
    },
    getDataList() {
      let params:any = {
        productName: this.getProductName,
        page: this.pagination.pageNum - 1,
        size: this.pagination.pageSize
      }
      if(this.orderBy) {
        params.orderBy = this.orderBy
      }
      if(this.licenseId) {
        params.license = this.licenseId
      }
      SbomDataService.queryLicenseUniversalApi(params)
        .then((response: ResponseData) => {
          response.data.content.length && response.data.content.map(item => {
            item.isLegal = item.legal ? '是' : '否'
          })
          this.tableData = response.data.content;
          this.pagination.total = response.data.totalElements;
        })
        .catch((e: any) => {
          if (e.response && e.response.status == 500) {
            ElMessage({
            message: e.response.data,
            type: 'error'
            })
          }
          this.tableData = []
          this.pagination.total = 0
        });
        
    },
    openDiaog() {
      this.dialogVisible = true
      this.search()
    }
  },
});

</script>


<style scoped>

</style>
