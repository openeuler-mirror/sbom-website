<template>
  <div class="sbom-container">
    <div class="sbom-main">
      <div class="table-top">
        <div class="table-title">
          · 软件成分数据
        </div>
        <div class="query-list">
          <div class="query-item">
            License类型：
            <el-select v-model="licenseId" clearable filterable placeholder="请选择" @change="search">
              <el-option
                v-for="(item, itemIndex) in licenseIds"
                :key="itemIndex"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="query-item">
            License成分：
            <el-select v-model="licenseType" clearable placeholder="请选择" @change="search">
              <el-option
                v-for="(item, itemIndex) in licenseList"
                :key="itemIndex"
                :label="item.label"
                :value="item.prop"
              />
            </el-select>
          </div>
          <div class="query-item">
            漏洞级别：
            <el-select v-model="vulSeverity" clearable placeholder="请选择" @change="search">
              <el-option
                v-for="(item, itemIndex) in vulSeverityList"
                :key="itemIndex"
                :label="item.label"
                :value="item.prop"
              />
            </el-select>
          </div>
          <div class="query-item">
            是否精准查询：
            <el-switch v-model="isExactly" @change="retrievePackages" inline-prompt active-text="是" inactive-text="否" />
          </div>
          <div class="query-item" style="width: 260px">
            <el-input 
              v-model="packageName" 
              placeholder="输入package名称，按enter键搜索" 
              :prefix-icon="Search"
              @keyup.enter="search"
            />
          </div>
        </div>
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
          <el-table-column fixed type="index" label="编号" width="70" :index="indexCounter" />
          <el-table-column fixed property="name" label="软件包名称" width="250" show-overflow-tooltip>
            <template #default="scope">
              <img class="imgIcon" src="@/assets/images/package.png" alt="">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column property="version" label="版本(epoch:version-release)" width="250"
            show-overflow-tooltip
            v-if="IsOpenEulerByProductName()" />
          <el-table-column property="version" label="版本" show-overflow-tooltip width="250" v-else>
            <template #default="scope">
              <img class="imgIcon" src="@/assets/images/package.png" alt="">
              <span>{{ scope.row.version }}</span>
            </template>
          </el-table-column>
          <el-table-column property="licenseConcluded" label="漏洞风险数值" width="550">
            <template #default="scope">
              <template v-for="(vul, vulIndex) in vluProps" :key="vulIndex">
                <div 
                  :class="[
						  'vulBtns',
						  'vul'+vulIndex,
						  { vulZero: scope.row.statistics[vul.prop] === 0 }
					  ]" 
                  v-if="scope.row.statistics && (scope.row.statistics[vul.prop] || scope.row.statistics[vul.prop]===0)"
                  :key="vulIndex"
                  @click="openVulnDialog(scope.row, vul, scope.row.statistics[vul.prop])"
                >
                  <span class="txt">{{ vul.label }}</span>
                  <span class="num">{{ scope.row.statistics[vul.prop] }}</span> 
                </div>
              </template>
            </template>
          </el-table-column>
          <el-table-column property="licenseConcluded" label="License" min-width="200" :formatter="NoAssertionFormat">
            <template #default="scope">
              <template v-if="scope.row.licenses && scope.row.licenses.length">
                <div class="cellBox">
                  <template 
                    v-for="(license,index) in scope.row.licenses" 
                    :key="index"
                  >
                    <el-tooltip v-if="license.licenseName" effect="dark" :content="license.licenseName" placement="top">
                      <div class="licenseItem" :class="{ canClick: license.licenseUrl}" @click="goPath(license)">
                        <span :class="['dot', license.legal ? 'green' : 'red']"></span>
                        <span class="txt">{{ license.licenseId }}</span>
                      </div>
                    </el-tooltip>
                    <div v-else class="licenseItem" :class="{ canClick: license.licenseUrl}" @click="goPath(license)">
                      <span :class="['dot', license.legal ? 'green' : 'red']"></span>
                      <span class="txt">{{ license.licenseId }}</span>
                    </div>
                  </template>
                </div>
              </template>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column property="supplier" label="Supplier" min-width="200" show-overflow-tooltip :formatter="NoAssertionFormat" />
          <el-table-column fixed="right" width="100" label="更多">
            <template #default="props">
              <router-link :to="'/sbomPackageDetail/' + props.row.id + '/' + isOpenEuler + '?productName=' + getProductName" target="_blank" class="nav-link">详情</router-link>
            </template>
          </el-table-column>
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
    <el-dialog
      title="漏洞详情列表"
      v-model="showVulnDialog"
      :close-on-click-modal="false"
      width="80%"
      custom-class="sbom-dialog"
    >
      <SbomVulnerabilityTable 
        :productName="getProductName" 
        :severity="vulnSeverity" 
        :packageId="packageId"
        isByProductName 
      />
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { Search } from '@element-plus/icons-vue'
import SbomDataService from "@/services/SbomDataService";
import ResponseData from "@/types/ResponseData";
import { IsSelectArtifact, NoAssertionFormat, IsOpenEulerByProductName } from "@/utils"
import { mapGetters} from 'vuex';
import SbomVulnerabilityTable from '@/components/SbomVulnerabilityTable.vue'
import { vulSeverityList, formatVulSeverity } from "@/utils"
import { ElMessage } from 'element-plus';

const licenseList = [
  { label: '多license', prop: 'multiLicense' },
  { label: '无license', prop: 'noLicense' },
  { label: 'OSI/FSF认证license', prop: 'legalLicense' },
  { label: '非OSI/FSF认证license', prop: 'ilegalLicense' },
]

export default defineComponent({
  name: "sbom-packages-list",
  components: {
    SbomVulnerabilityTable
  },
  data() {
    return {
      packageName: "",
      isExactly: false,
      pageData: [],
      pageNum: ref(1),
      pageSize: ref(10),
      totalElements: ref(0),
      Search: Search,
      vluProps: [
        { label: '致命', prop: 'criticalVulCount' },
        { label: '高', prop: 'highVulCount' },
        { label: '中', prop: 'mediumVulCount' },
        { label: '低', prop: 'lowVulCount' },
        { label: '无风险', prop: 'noneVulCount' },
        { label: '未知', prop: 'unknownVulCount' },
      ],
      isOpenEuler: false,
      vulSeverityList,
      vulSeverity: this.$route.query.vulSeverity || '',
      licenseList,
      licenseType: this.$route.query.licenseType || '',
      vulnSeverity: '',
      packageId: '',
      showVulnDialog: false,
      licenseId: '',
      licenseIds: [] 
    };
  },
  computed:{
    ...mapGetters([
      'getProductName'
    ])
  },
  watch: {
    getProductName() {
      this.packageName = ''
      this.licenseId = ''
      this.search();
      this.formatIsOpeneuler();
      this.getLicenseIds()
    }
  },
  methods: {
    indexCounter(index: number) {
      return index + (this.pageNum - 1) * this.pageSize + 1;
    },

    handlePageChange(val: number) {
      this.retrievePackages();
    },

    handleSizeChange(val: number) {
      this.search()
    },
    search() {
      this.pageNum = 1
      this.retrievePackages();  
    },

    retrievePackages() {
      if (!IsSelectArtifact(true)) { 
        this.pageData = []
        return; 
      }

      let requestParam = new FormData()
      // requestParam.append('productName', (window as any).SBOM_PRODUCT_NAME);
      requestParam.append('productName', String(this.getProductName));
      requestParam.append('page', String(this.pageNum - 1));
      requestParam.append('size', String(this.pageSize));

      if (this.packageName) {
        requestParam.append('packageName', String(this.packageName))
        requestParam.append('isExactly', String(this.isExactly))
      }
      if(this.licenseType) {
        const licenseType = this.licenseType
        let prop: any = ''
        let val: any = true
        if(licenseType === 'legalLicense' || licenseType === 'ilegalLicense') {
          prop = 'isLegalLicense'
          val = licenseType === 'legalLicense'
        } else {
          prop = licenseType
          val = true
        }
        requestParam.append(prop, val)
      }
      if(this.vulSeverity) {
        requestParam.append('vulSeverity', String(this.vulSeverity))
      }
      if(this.licenseId) {
        requestParam.append('licenseId', String(this.licenseId))
      }
      SbomDataService.querySbomPackagesByPageable(requestParam)
        .then((response: ResponseData) => {
          this.pageData = response.data.content;
          this.totalElements = response.data.totalElements;
        })
        .catch((e: any) => {
          if (e.response && e.response.status == 500) {
            ElMessage({
              message: e.response.data,
              type: 'error'
            })
          }
          this.totalElements = 0
          this.pageData = []
        });
    },

    NoAssertionFormat,

    IsOpenEulerByProductName,
    openVulnDialog(row, item, num) {
			if(!item || num === 0) return
			this.vulnSeverity = formatVulSeverity(item.label)
			this.packageId = row.id
			this.showVulnDialog = true
    },
    formatIsOpeneuler() {
      this.isOpenEuler = this.getProductName && this.getProductName.includes('openEuler')
    },
    getLicenseIds() {
      if (!this.getProductName) { 
        return; 
      }
      this.licenseIds = []
      SbomDataService.queryProductStatistics(this.getProductName)
        .then((response: ResponseData) => {
          if(response.data) {
            const keys = Object.keys(response.data.licenseDistribution)
            let list:any = []
            keys.length && keys.map(item => {
              list.push({
                label: item,
                value: item,
              })
            })
            this.licenseIds = list
          }
        })
        .catch((e: any) => {
          if (e.response && e.response.status == 500) {
            ElMessage({
              message: e.response.data,
              type: 'error'
            })
          }
        });
    },
    goPath(item) {
      if(item.licenseUrl) {
        window.open(item.licenseUrl, '_blank')
      }
    }
  },
  mounted() {
    this.retrievePackages();
    this.formatIsOpeneuler();
    this.getLicenseIds();
  },
});
</script>

<style lang="less" scoped>
.sbom-table{
  /deep/.el-scrollbar__bar.is-vertical{
    display: none !important;
  }
}
  
</style>