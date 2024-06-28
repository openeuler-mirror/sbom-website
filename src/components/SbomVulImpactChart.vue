<template>
  <div class="SbomVulImpactChart-container">
    <div class="SbomVulImpactChart-main">
      <div class="header">
        <div class="header-title">{{ vulId }} 漏洞影响范围</div>
        <div class="switch">
          <el-switch
            v-model="isEchart"
            size="small"
            active-text="图"
            inactive-text="表"
            style="
              --el-switch-on-color: #13ce66;
              --el-switch-off-color: #ff4949;
            "
          />
        </div>
      </div>
      <div class="graphChart">
        <div class="legendBox">
          <div
            v-for="(item, itemIndex) in graphColors"
            :key="itemIndex"
            class="item"
          >
            <i class="dot" :style="{ backgroundColor: item.color }"></i>
            {{ item.label }}
          </div>
        </div>
        <div class="chartTableBox">
          <div class="chart" v-show="isEchart">
            <SbomEchart
              chartId="sbomVulnerability"
              chartType="graph"
              :dataList="chartData"
              @echartsClick="echartsClick"
            />
          </div>
          <div class="table sbom-table" v-show="!isEchart">
            <el-select
              v-model="checked"
              placeholder="请选择"
              @change="handleSelect"
              style="margin-bottom: 10px"
            >
              <el-option label="全部" value=""></el-option>
              <template v-for="(item, itemIndex) in graphColors">
                <el-option
                  v-if="item.prop !== 'vulnerability'"
                  :key="itemIndex"
                  :label="item.label"
                  :value="item.prop"
                />
              </template>
            </el-select>
            <el-table
              :data="chartTableData"
              stripe
              border
              highlight-current-row
              scrollbar-always-on
            >
              <template #empty>
                <div class="no-data">
                  <img src="@/assets/images/no-data.png" alt="" />
                  <p>暂无相关内容</p>
                </div>
              </template>
              <el-table-column label="漏洞关联组件purl" show-overflow-tooltip>
                <template #default="scope">
                  <span
                    class="link"
                    @click="
                      goDetailPath(scope.row.elementId, scope.row.nodeType)
                    "
                    >{{ scope.row.label }}</span
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import SbomDataService from '@/services/SbomDataService';
import ResponseData from '@/types/ResponseData';
import SbomEchart from '@/views/SbomDashboard/SbomEchart.vue';
import { ElMessage } from 'element-plus';
import { mapGetters } from 'vuex';

export default defineComponent({
  name: 'SbomVulImpactChart',
  components: {
    SbomEchart,
  },
  props: {},
  data() {
    return {
      chartData: {},
      graphColors: [
        { label: '漏洞', prop: 'vulnerability', color: '#FF0000' },
        { label: '漏洞影响的组件', prop: 'dependency', color: '#0dcfcf' },
        { label: '漏洞影响的软件', prop: 'package', color: '#FF9126' },
        {
          label: '漏洞影响的传递性依赖',
          prop: 'transitiveDep',
          color: '#5A94F8',
        },
      ],
      colors: {
        vulnerability: '#FF0000',
        dependency: '#0dcfcf',
        package: '#FF9126',
        transitiveDep: '#5A94F8',
      },
      dataList: {},
      chartTableData: [],
      isEchart: true,
      checked: '',
      productName: '',
      vulId: '',
    };
  },
  computed: {
    ...mapGetters(['getProductName']),
  },
  watch: {},
  methods: {
    initEchart(vulId) {
      this.isEchart = true;
      this.chartData = {};
      this.getChartData(vulId);
    },
    getChartData(vulId: string) {
      SbomDataService.queryVulImpact(this.productName, vulId)
        .then((response: ResponseData) => {
          const { nodes, edges } = response.data;
          let vTotla = [];
          let dTotla = [];
          let pTotal = [];
          let tTotal = [];
          if (nodes.length) {
            vTotla = nodes.filter((node) => node.nodeType === 'vulnerability');
            dTotla = nodes.filter((node) => node.nodeType === 'dependency');
            pTotal = nodes.filter((node) => node.nodeType === 'package');
            tTotal = nodes.filter((node) => node.nodeType === 'transitiveDep');
            this.dataList = {
              vulnerability: vTotla,
              dependency: dTotla,
              package: pTotal,
              transitiveDep: tTotal,
            };
          }
          vTotla = this.formatNodes(vTotla, 0, true);
          dTotla = this.formatNodes(dTotla, 1, true);
          pTotal = this.formatNodes(pTotal, dTotla.length, true);
          tTotal = this.formatNodes(
            tTotal,
            dTotla.length + pTotal.length,
            false
          );
          this.chartData = {
            nodes: vTotla.concat(dTotla).concat(pTotal).concat(tTotal),
            edges,
          };
          this.checked = '';
          this.handleSelect('');
        })
        .catch((e: any) => {
          if (e.response && e.response.status == 500) {
            ElMessage({
              message: e.response.data,
              type: 'error',
            });
          }
          this.chartData = [];
        });
    },
    formatNodes(data, index, flag) {
      if (data.length) {
        const colors = this.colors;
        const count = 220;
        const yTotal = index * count;
        data = data.sort((a, b) => a.y - b.y);
        data.map((node, nodeIndex) => {
          node.color = colors[node.nodeType];
          node.x = node.x * 2.5;
          node.y = node.y + yTotal + (flag ? count * nodeIndex : 0);
        });
      }
      return data;
    },
    goDetailPath(elementId, nodeType) {
      if (elementId && nodeType && nodeType !== 'vulnerability') {
        let flag;
        let productName;
        if (this.getProductName) {
          flag =
            this.getProductName && this.getProductName.includes('openEuler');
          productName = this.getProductName;
        } else {
          flag = this.$route.params.flag || false;
          productName = this.$route.query.productName || '';
        }
        const { href } = this.$router.resolve({
          path: `/sbomPackageDetail/${elementId}/${flag}`,
          query: {
            productName: productName,
          },
        });
        window.open(href, '_blank');
      }
    },
    echartsClick(name, params) {
      const { nodeType, elementId } = params.value;
      this.goDetailPath(elementId, nodeType);
    },
    handleSelect(prop) {
      this.chartTableData = [];
      const dataList = this.dataList;
      if (prop) {
        this.chartTableData = dataList[prop];
      } else {
        const keys = Object.keys(dataList);
        keys.map((key) => {
          if (key !== 'vulnerability') {
            this.chartTableData = this.chartTableData.concat(dataList[key]);
          }
        });
      }
    },
  },
  mounted() {
    const { productName, vulId } = this.$route.query
    this.productName = productName ? productName.toString() : ''
    this.vulId = vulId ? vulId.toString() : ''
    this.initEchart(vulId)
  },
});
</script>

<style lang="less" scoped>
.SbomVulImpactChart-container {
  padding: 20px 32px;
  width: 100%;
  height: auto;
  .SbomVulImpactChart-main {
    background-color: #fff;
    padding: 0px 20px 20px 20px;
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .header-title {
        font-size: 18px;
        font-weight: bold;
        color: #000000;
        padding: 20px 0;
      }
    }
    .graphChart{
      display: flex;
      justify-content: space-between;
      height: calc(100vh - 140px);
      .legendBox{
        width: 380px;
        background-color: #f3f3f3;
        padding: 10px 20px;
        border-radius: 15px;
        .item{
          height: 40px;
          display: flex;
          align-items: center;
          .dot{
            display: inline-block;
            height: 12px;
            width: 12px;
            border-radius: 50%;
            margin-right: 10px;
          }
          font-size: 14px;
          color:#333;
        }
      }
      .chartTableBox{
        width: calc(100% - 400px);
        background-color: #f3f3f3;
        border-radius: 15px;
        height: 100%;
        .chart{
          width: 100%;
          height: 100%;
        }
        .table{
          padding: 0;
          margin: 20px;
          width: calc(100% - 40px);
          background-color: #f3f3f3;
          .el-table__body-wrapper{
            max-height: calc(100vh - 425px);
            overflow-y: auto;
          }
        }
      }
    }
  }
}
</style>
