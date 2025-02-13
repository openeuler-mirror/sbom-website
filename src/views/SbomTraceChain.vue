<template>
  <div class="sbom-container">
    <div class="sbom-main">
      <div class="table-top">
        <div class="table-title">
          · 反向追溯链
        </div>
      </div>
      <div class="table-form">
        <el-form 
          ref="conditionFormRef" 
          class="query-list" 
          :model="conditionForm" 
          :rules="validateRules" 
          label-width="auto" 
          status-icon
        >
          <el-form-item label="依赖类型" prop="binaryType">
            <el-select v-model="conditionForm.binaryType" @change="handleBinaryType">
              <el-option label="Package" value="PACKAGE_MANAGER"></el-option>
              <el-option label="Module" value="PROVIDE_MANAGER"></el-option>
              <el-option label="Dependency" value="EXTERNAL_MANAGER"></el-option>
              <el-option label="Runtime Dependency" value="RELATIONSHIP_MANAGER"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="包管理器类型" prop="type">
            <el-select v-model="conditionForm.type" placeholder="请选择包管理器类型">
              <el-option label="RPM" value="rpm" />
              <el-option label="Maven" value="maven" />
              <el-option label="Pypi" value="pypi" />
              <el-option label="Gitee" value="gitee" />
              <el-option label="Github" value="github" />
              <el-option label="Gitlab" value="gitlab" />
              <el-option label="Generic" value="generic" />
            </el-select>
          </el-form-item>
          <el-form-item label="namespace">
            <el-input v-model="conditionForm.namespace" clearable />
          </el-form-item>
          <el-form-item label="name" prop="name">
            <el-input v-model="conditionForm.name" clearable />
          </el-form-item>
          <el-form-item label="Version区间查询" prop="isSection">
            <el-switch v-model="isSection" clearable 
              :disabled="sectionDisabled"
              style="--el-switch-on-color: #4971ff;"
            />
          </el-form-item>
          <el-form-item label="" label-width="0">
            <template v-if="isSection">
              <el-input class="input" v-model="conditionForm.startVersion" clearable /> 
              <span class="spe">--</span> 
              <el-input class="input" v-model="conditionForm.endVersion" clearable /> 
            </template>
            <el-input class="input" v-else v-model="conditionForm.version" clearable />
            <el-tooltip 
              placement="top" 
              effect="dark"
              v-if="sectionDisabled"
            >
              <template #content> 
                <span>
                  Runtime Dependency举例场景：
                </span><br/>
                <span>B-Package运行时依赖于A-Package；</span><br/>
                <span>则A-Package作为反向追溯链查询的输入条件，</span><br/>
                <span>查询结果为B-Package的软件信息</span>
              </template>
              <el-icon :size="16"><QuestionFilled /></el-icon>
            </el-tooltip>
          </el-form-item>
        </el-form>
          <el-button type="primary" @click="search(conditionFormRef)">搜索</el-button>
      </div>
      <div class="sbom-table">
        <el-table 
          ref="singleTableRef" 
          :data="pageData" 
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
          <el-table-column fixed type="index" label="编号" width="70" :index="indexCounter" />
          <el-table-column property="purl" show-overflow-tooltip label="依赖描述符（PURL）" min-width="500">
            <template #default="scope">
              <span>{{scope.row.purl}}</span>
            </template>
          </el-table-column>
          <el-table-column property="name" show-overflow-tooltip label="关联软件包名称" width="200" >
            <template #default="scope">
              <span>{{scope.row.name}}</span>
            </template>
          </el-table-column>
          <el-table-column property="version" label="版本" width="200" />
          <el-table-column property="description" show-overflow-tooltip label="软件包描述" min-width="500">
            <template #default="scope">
              <span>{{scope.row.description}}</span>
            </template>
          </el-table-column>
          <el-table-column fixed="right" show-overflow-tooltip label="更多" width="100">
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

    
    
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from "vue";
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import SbomDataService from "@/services/SbomDataService";
import ResponseData from "@/types/ResponseData";
import { IsSelectArtifact } from "@/utils"
import { mapGetters} from 'vuex';
import { QuestionFilled } from '@element-plus/icons-vue'

export default defineComponent({
  name: "sbom-packages-list",
  components: {
    QuestionFilled
  },
  setup() {
    const conditionFormRef = ref<FormInstance>();
    const validateRules = reactive<FormRules>({
      binaryType: [
        {
          required: true,
          message: '请选择依赖类型',
          trigger: 'change',
        },
      ],
      type: [
        {
          required: true,
          message: '请选择包管理器类型',
          trigger: 'change',
        },
      ],
      name: [
        {
          required: true,
          message: '请输入Name',
          trigger: 'blur'
        },
      ],
    })

    return {
      conditionFormRef,
      validateRules,
    }
  },

  data() {
    return {
      pageData: [],
      pageNum: ref(1),
      pageSize: ref(10),
      totalElements: ref(0),
      Search: Search,

      conditionForm: reactive({
        binaryType: '',
        type: '',
        namespace: '',
        name: '',
        version: '',
        startVersion: '',
        endVersion: '',
      }),
      isOpenEuler: false,
      isSection: false,
      sectionDisabled: false
    };
  },
  computed:{
    ...mapGetters([
      'getProductName'
    ])
  },
  watch: {
    getProductName(newVal) {
      this.initTableData()
      this.formatIsOpeneuler()
    }
  },
  methods: {
    initTableData() {
      this.conditionForm = reactive({
        binaryType: '',
        type: '',
        namespace: '',
        name: '',
        version: '',
        startVersion: '',
        endVersion: '',
      })
      this.pageNum = 1
      this.pageData = []
    },
    indexCounter(index: number) {
      return index + (this.pageNum - 1) * this.pageSize + 1;
    },

    handlePageChange(val: number) {
      this.retrieveBinary(this.conditionFormRef);
    },

    handleSizeChange(val: number) {
      this.search();
    },
    
    search() {
      this.pageNum = 1
      this.retrieveBinary(this.conditionFormRef)
    },

    async retrieveBinary(formEl: FormInstance | undefined) {
      if (!formEl) return;
      if (!IsSelectArtifact(true)) {
        this.pageData = []
        return; 
      }

      await formEl.validate((valid, fields) => {
        if (valid) {
          let requestParam = new FormData()
          // requestParam.append('productName', (window as any).SBOM_PRODUCT_NAME);
          requestParam.append('productName', this.getProductName);
          requestParam.append('binaryType', this.conditionForm.binaryType);
          requestParam.append('type', this.conditionForm.type);
          requestParam.append('namespace', this.conditionForm.namespace);
          requestParam.append('name', this.conditionForm.name);
          requestParam.append('page', String(this.pageNum - 1))
          requestParam.append('size', String(this.pageSize))
          if(this.isSection) {
            if(!this.conditionForm.startVersion && !this.conditionForm.endVersion) {
              ElMessage({
                message: 'Version区间查询至少输入一个查询条件！',
                type: 'warning',
              })
              return
            }
            requestParam.append('startVersion', String(this.conditionForm.startVersion))
            requestParam.append('endVersion', String(this.conditionForm.endVersion))
          } else {
            requestParam.append('version', this.conditionForm.version);
          }
          SbomDataService.querySbomPackagesByBinary(requestParam)
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
        }
      })
    },
    handleBinaryType(val) {
      if(val === 'RELATIONSHIP_MANAGER') {
        this.isSection = false
        this.sectionDisabled = true
      } else {
        this.sectionDisabled = false
      }
    },
    formatIsOpeneuler() {
      this.isOpenEuler = this.getProductName && this.getProductName.includes('openEuler')
    }
  },
  mounted() {
    this.retrieveBinary(undefined);
    this.formatIsOpeneuler()
  },
});
</script>
