<template>
  <div class="productInformation-container">
    <div class="sbom-header">
      <div class="title-text" @click="showQuery = !showQuery">
        <img src="@/assets/images/titleIcon.png" alt="" />
        制品信息
        <span v-if="getProductName && getProductName !== 'noData'">{{
          getProductName
        }}</span>
      </div>
      <!-- <div class="download-btn">
        <sbomDownloadPop :productName="getProductName" />
      </div> -->
    </div>
    <template
      v-if="!getIsThirdPart || (getIsThirdPart && getIsThirdPart !== '2')"
    >
      <div class="orgnization" v-if="showQuery">
        <div class="label">开源社区：</div>
        <div class="orgnization-btns">
          <template v-for="item in productTypeList">
            <el-button
              class="orgnization-btn"
              v-if="getIsThirdPart !== '1' || productType === item"
              :key="item"
              :label="item"
              :value="item"
              :class="{ active: productType === item }"
              @click="handleProductTypeChange(item)"
            >
              {{ item }}
            </el-button>
          </template>
        </div>
        <div class="search">
          <!-- 筛选
          <el-icon :size="12" color="#191A35">
            <ArrowDown />
          </el-icon> -->
        </div>
      </div>
    </template>
    <div class="query-list-button" v-show="showQuery">
      <template v-if="productConfigList && productConfigList.length">
        <el-form
          ref="productFormRef"
          label-position="left"
          :model="productForm.data"
          :validate-on-rule-change="false"
          :rules="productForm.rules"
          label-width="105px"
        >
          <el-form-item
            v-for="(item, key) in productConfigList"
            :key="key"
            :label="item.label + '：'"
            :prop="item.name"
          >
            <FormItem
              :formData="productForm"
              :data="item"
              @handleChange="
                (val, data, name) => {
                  productFormChange(val, data, name, key);
                }
              "
            >
            </FormItem>
          </el-form-item>
        </el-form>
      </template>
      <span v-if="showTxt" class="noDataTxt">不存在制品SBOM信息</span>
      <div
        class="query-btns"
        v-if="productConfigList && productConfigList.length"
      >
        <el-button type="primary" @click="queryArtifactInfo(productFormRef)"
          >确定</el-button
        >
        <el-button type="info" @click="reset">重置</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { FormInstance, ElMessage } from "element-plus";
import { Download, Search, Expand, ArrowDown } from "@element-plus/icons-vue";
import { defineComponent, ref, reactive } from "vue";
import SbomDataService from "@/services/SbomDataService";
import ResponseData from "@/types/ResponseData";
import FormItem from "@/components/ProductFormItem";
// import sbomDownloadPop from "@/components/SbomDownloadPop.vue";
import ProductItemConfig from "@/types/ProductItemConfig";
import { CloseProductDrawer, ParseUriProductName } from "@/utils";
import { useRouter } from "vue-router";
import { mapMutations, mapGetters } from "vuex";

export default defineComponent({
  name: "ProductInformation",
  components: {
    FormItem,
    // sbomDownloadPop,
    // ArrowDown
  },
  setup() {
    const productFormRef = ref<FormInstance>();
    return {
      productFormRef,
    };
  },
  data() {
    return {
      isRouterAlive: true,
      downloadIcon: Download,
      Search: Search,
      Expand: Expand,
      useRouter: useRouter,

      productDrawer: false,
      ParseUriProductName: ParseUriProductName,

      productName: (window as any).SBOM_PRODUCT_NAME
        ? (window as any).SBOM_PRODUCT_NAME
        : ("" as string),
      productType: "",

      productTypeList: [],
      productConfigList: [] as ProductItemConfig[],

      productForm: reactive({
        data: {},
        rules: {},
      }),
      showQuery: true,
      showTxt: false,
    };
  },
  computed: {
    ...mapGetters(["getProductName", "getIsThirdPart"]),
  },
  methods: {
    getProductTypeList() {
      SbomDataService.queryProductType()
        .then((response: ResponseData) => {
          this.productTypeList = response.data;
          const community = this.getParams("community");
          if (community) {
            let productType = "";
            response.data.map((item) => {
              if (community.toLowerCase().includes(item.toLowerCase())) {
                productType = item;
              }
            });
            if (productType) {
              this.showQuery = true;
              this.handleProductTypeChange(productType);
            }
          }
        })
        .catch((e: Error) => {
          console.error("query product type list failed:", { e });
        });
    },

    async queryArtifactInfo(formElem: FormInstance | undefined) {
      if (!formElem) return;
      await formElem.validate((valid, fields) => {
        if (valid) {
          SbomDataService.queryProduct(this.productType, this.productForm.data)
            .then((response: ResponseData) => {
              this.productName = response.data.name;
              (window as any).SBOM_PRODUCT_NAME = response.data.name;
              this.setProductName(response.data.name);
              this.showQuery = false;
            })
            .catch((e: any) => {
              if (e.response && e.response.status == 500) {
                ElMessage({
                  message: e.response.data,
                  type: "error",
                });
              }
            });
        }
      });
    },
    reset() {
      this.productForm.data = {};
      this.setProductName("");
      this.resetProductForm();
    },

    handleProductTypeChange(productType: string) {
      if (productType === this.productType) return;
      this.productConfigList = [];
      this.productType = productType;
      this.productForm.data = {};
      SbomDataService.queryProductConfig(productType)
        .then((response: ResponseData) => {
          const { data } = response;
          if (data && data.label && data.name) {
            this.productConfigList = [data];
            this.formatFormData(data, 0);
            // this.productForm.data[data.name] = ''
            // this.productForm.rules[data.name] = [
            //   { required: true, message: '请选择 ' + data.label, trigger: 'change' }
            // ];
            this.$nextTick(() => {
              this.resetProductForm();
            });
            this.showTxt = false;
          } else {
            this.productConfigList = [];
            this.showTxt = true;
            (window as any).SBOM_PRODUCT_NAME = "noData";
            this.setProductName("noData");
          }
        })
        .catch((e: Error) => {
          console.error("query product config failed:", { e });
        });
    },

    resetProductForm() {
      if (this.productFormRef) {
        this.productFormRef.resetFields();
      }
    },

    reload() {
      this.isRouterAlive = false;
      this.$nextTick(function () {
        this.isRouterAlive = true;
      });
    },
    getParams(prop) {
      let val = "";
      const url = window.location.hash.split("?")[1];
      if (url) {
        const params = url.split("&");
        if (params && params.length > 1) {
          params.map((prams) => {
            if (prams.includes(prop)) {
              val = prams.split("=")[1];
            }
          });
        }
      }
      return val;
    },
    productFormChange(val, data, name, index) {
      if (index === 0) {
        this.productForm.data = {};
        this.productForm.data[name] = val;
      }
      if (val) {
        if (data[val] && data[val].name) {
          this.productConfigList.splice(index + 1, 1, data[val]);
          this.productConfigList = this.productConfigList.slice(0, index + 2);
        } else {
          this.productConfigList = this.productConfigList.slice(0, index + 1);
        }
      } else {
        this.productConfigList = this.productConfigList.slice(0, index + 1);
      }
      this.formatFormData(data[val], index);
    },
    formatFormData(data, index) {
      if (data && data.name) {
        const keys = Object.keys(data.valueToNextConfig);
        this.productForm.data[data.name] =
          keys.length && keys.length === 1 ? keys[0] : "";
        this.productForm.rules[data.name] = [
          {
            required: true,
            message: "请选择 " + data.label,
            trigger: "change",
          },
        ];
        if (data.valueToNextConfig) {
          if (keys.length && keys.length === 1) {
            const val = data.valueToNextConfig[keys[0]];
            // this.formatFormData(val)
            this.productFormChange(
              keys[0],
              data.valueToNextConfig,
              val.name,
              index + 1
            );
          }
        }
      }
    },
    ...mapMutations(["setProductName"]),
  },

  provide() {
    return {
      reload: this.reload,
    };
  },

  mounted() {
    this.getProductTypeList();
    this.productName = this.ParseUriProductName();
    if (this.productName) {
      this.setProductName(this.productName);
      this.showQuery = false;
    }
  },
});
</script>

<style lang="less" scoped>
.productInformation-container {
  width: 100%;
  height: auto;
  background-color: #ffffff;
  padding: 0px 30px 0px 30px;
  .sbom-header {
    display: flex;
    justify-content: space-between;
    height: 50px;
    align-items: center;
    border-bottom: 1px solid #eef0f1;
    .title-text {
      font-size: 16px;
      font-weight: bold;
      color: #000000;
      margin-left: 10px;
      cursor: pointer;
      img {
        margin-right: 5px;
      }
      span {
        border-left: 1px solid #cfd5e3;
        padding-left: 15px;
        margin-left: 15px;
        font-weight: normal;
        font-size: 14px;
      }
    }
  }
  .orgnization {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .label {
      font-size: 14px;
      color: #666666;
    }
    .search {
      min-width: 60px;
      font-size: 16px;
      color: #191a35;
      cursor: pointer;
    }
    .orgnization-btns {
      width: calc(100% - 200px);
      display: flex;
      justify-content: flex-start;
      .orgnization-btn {
        height: 36px;
        line-height: 36px;
        padding-left: 16px;
        padding-right: 16px;
        background-color: #ffffff;
        border: 1px solid #cfd5e3;
        border-radius: 18px;
        // cursor: pointer;
        font-size: 14px;
        color: #333333;
        margin-right: 10px;
        font-weight: 400;
        margin-left: 0;
        &.active {
          background-color: #4971ff;
          color: #ffffff;
        }
      }
    }
  }
}
</style>
<style lang="less">
.productInformation-container {
  .query-list-button {
    // display: flex;
    // justify-content: space-between;
    margin-top: 16px;
    padding-bottom: 20px;
    .el-form {
      // display: flex;
      // justify-content: flex-start;
      // flex-wrap: wrap;
      .el-form-item {
        // height: 36px;
        line-height: 36px;
        margin-right: 30px;
        &:last-child {
          margin-right: 0px;
        }
        .el-form-item__label-wrap {
          margin-right: 10px;
          .el-form-item__label {
            height: 36px;
            line-height: 36px;
            margin-bottom: 0px;
            padding-right: 0px;
            color: #666666;
            font-size: 14px;
          }
        }
        .el-form-item__content {
          .el-select {
            margin: 0;
          }
          .el-input__inner {
            height: 36px;
            background-color: #ffffff;
            border-radius: 4px;
            &::placeholder {
              color: #cfd5e3;
              font-size: 14px;
            }
          }
          .el-radio-group {
            .el-radio-button {
              margin-right: 10px;
              .el-radio-button__inner {
                // background-color: #ffffff;
                border: 1px solid #cfd5e3;
                color: #333;
                border-radius: 18px;
                // border: none;
                padding: 10px 15px;
                font-weight: 400;
              }
              &.is-active {
                .el-radio-button__inner {
                  // background-color: #4971FF;
                  border: 1px solid #4971ff;
                  // color: #FFFFFF;
                }
              }
            }
          }
        }
      }
    }
    .query-btns {
      display: flex;
      justify-content: flex-end;
      .el-button--primary {
        background-color: #4971ff;
        border: none;
        margin-right: 10px;
      }
      .el-button--info {
        color: #191a35;
        background-color: #ffffff;
        border-color: #cfd5e3;
      }
    }
    .noDataTxt {
      color: #666666;
      font-size: 14px;
      margin-bottom: 20px;
    }
  }
}
</style>
