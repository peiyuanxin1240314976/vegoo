<template>
  <div ref="rootRef" class="finance-screen-root art-full-height">
    <div
      class="finance-screen-wrap"
      :style="{
        width: `${designWidth}px`,
        height: `${designHeight}px`,
        transform: `scale(${scale})`,
        transformOrigin: '0 0'
      }"
    >
      <!-- 顶栏 -->
      <header class="finance-header">
        <div class="header-left">
          <span class="logo-text">金融客户分析平台</span>
        </div>
        <h1 class="header-title">金融客户分析平台</h1>
        <div class="header-right">{{ currentTime }}</div>
      </header>

      <!-- 主体：左 | 地图 | 右 -->
      <section class="finance-body">
        <!-- 左侧面板 -->
        <aside class="panel panel-left">
          <div class="block">
            <div class="block-title">
              <span class="icon">⚡</span> 机构客户分析
            </div>
            <div class="kpi-main">
              <span class="kpi-value">{{ summary.nationalNewClients }}</span>
              <span class="kpi-label">全国新增客户数</span>
            </div>
            <p class="kpi-compare down">同比昨日下降 {{ Math.abs(summary.compareYesterday) }}</p>
            <div class="gauges">
              <div ref="gaugeCoverRef" class="gauge-dom"></div>
              <div ref="gaugePenetrateRef" class="gauge-dom"></div>
            </div>
            <div class="gauge-labels">
              <span>目标客户覆盖率</span>
              <span>目标客户渗透率</span>
            </div>
          </div>
          <div class="block">
            <div class="block-title">
              <span class="icon">📈</span> 新增客户趋势
            </div>
            <div ref="trendLineRef" class="chart-dom"></div>
          </div>
          <div class="block">
            <div class="block-title">
              <span class="icon">📊</span> 新增客户渠道对比
            </div>
            <div ref="channelBarRef" class="chart-dom"></div>
          </div>
        </aside>

        <!-- 中间：中国地图 -->
        <main class="panel panel-center">
          <div ref="chinaMapRef" class="china-map-dom"></div>
        </main>

        <!-- 右侧面板 -->
        <aside class="panel panel-right">
          <div class="block">
            <div class="block-title">
              <span class="icon">📊</span> 客户活跃趋势
            </div>
            <div ref="activityBarRef" class="chart-dom"></div>
          </div>
          <div class="block">
            <div class="block-title">
              <span class="icon">🥧</span> 客户类型分布
            </div>
            <div ref="clientPieRef" class="chart-dom"></div>
          </div>
          <div class="block">
            <div class="block-title">
              <span class="icon">📋</span> 客户活跃排名
            </div>
            <div class="rank-table-wrap">
              <table class="rank-table">
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>区域</th>
                    <th>类型</th>
                    <th>数值</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in activityRank" :key="row.no">
                    <td>{{ row.no }}</td>
                    <td>{{ row.name }}</td>
                    <td>{{ row.type }}</td>
                    <td>{{ row.value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </aside>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useChart } from '@/hooks/core/useChart'
import { echarts, type EChartsOption } from '@/plugins/echarts'
import {
  MOCK_FINANCE_SUMMARY,
  MOCK_TREND_LINE,
  MOCK_CHANNELS,
  MOCK_ACTIVITY_TREND,
  MOCK_CLIENT_TYPES,
  MOCK_ACTIVITY_RANK,
  MOCK_MAP_LINES,
  MOCK_MAP_SCATTER
} from './mock'
import chinaMapData from 'china-map-echarts'

defineOptions({ name: 'FinanceScreen' })

const designWidth = 1920
const designHeight = 1080

const rootRef = ref<HTMLElement>()
const scale = ref(1)
const updateScale = () => {
  const el = rootRef.value
  if (!el) return
  const w = el.clientWidth
  if (w <= 0) return
  scale.value = w / designWidth
}

const currentTime = ref('')
const updateTime = () => {
  const now = new Date()
  const week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()]
  currentTime.value = `${week} ${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}
let timeTimer: ReturnType<typeof setInterval> | null = null

const summary = ref(MOCK_FINANCE_SUMMARY)
const activityRank = ref(MOCK_ACTIVITY_RANK)

const gaugeCoverRef = ref<HTMLElement>()
const gaugePenetrateRef = ref<HTMLElement>()
const trendLineRef = ref<HTMLElement>()
const channelBarRef = ref<HTMLElement>()
const chinaMapRef = ref<HTMLElement>()
const activityBarRef = ref<HTMLElement>()
const clientPieRef = ref<HTMLElement>()

const chartGaugeCover = useChart()
const chartGaugePenetrate = useChart()
const chartTrendLine = useChart()
const chartChannelBar = useChart()
const chartChinaMap = useChart()
const chartActivityBar = useChart()
const chartClientPie = useChart()

const theme = {
  color1: '#4ABEFF',
  color2: '#14DEBA',
  axis: '#8b9dc3',
  label: '#b8c5d9'
}

function buildGaugeOption(percent: number, color: string): EChartsOption {
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        splitNumber: 5,
        radius: '75%',
        center: ['50%', '60%'],
        axisLine: {
          lineStyle: { width: 8, color: [[1, 'rgba(255,255,255,0.1)']] }
        },
        progress: { show: true, width: 8, itemStyle: { color } },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, 0],
          fontSize: 20,
          fontWeight: 'bold',
          color: theme.label,
          formatter: '{value}%'
        },
        data: [{ value: percent }]
      }
    ]
  }
}

function buildTrendLineOption(): EChartsOption {
  const d = MOCK_TREND_LINE
  return {
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: d.xAxis, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } }, axisLabel: { color: theme.axis } },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } }, axisLabel: { color: theme.axis } },
    series: [
      { type: 'line', name: 'Sales', data: d.sales, smooth: true, areaStyle: { color: theme.color1, opacity: 0.4 }, lineStyle: { color: theme.color1 }, itemStyle: { color: theme.color1 } },
      { type: 'line', name: 'Profit', data: d.profit, smooth: true, areaStyle: { color: theme.color2, opacity: 0.4 }, lineStyle: { color: theme.color2 }, itemStyle: { color: theme.color2 } }
    ]
  }
}

function buildChannelBarOption(): EChartsOption {
  const names = MOCK_CHANNELS.map((c) => c.name)
  const values = MOCK_CHANNELS.map((c) => c.value)
  const max = Math.max(...values)
  return {
    grid: { left: 60, right: 80, top: 10, bottom: 20 },
    xAxis: { type: 'value', max, axisLine: { show: false }, splitLine: { show: false }, axisLabel: { color: theme.axis } },
    yAxis: { type: 'category', data: names, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: theme.label } },
    series: [
      {
        type: 'bar',
        data: values.map((v, i) => ({ value: v, itemStyle: { color: theme.color1 } })),
        barWidth: '60%',
        label: { show: true, position: 'right', color: theme.label, formatter: (p: any) => p.value.toLocaleString() }
      }
    ]
  }
}

function buildChinaMapOption(): EChartsOption {
  const lineData = MOCK_MAP_LINES.map((item) => ({
    coords: item.coords,
    lineStyle: { color: theme.color1, width: 1, opacity: 0.6 },
    effect: { show: true, symbol: 'circle', symbolSize: 4, trailLength: 0.4, color: theme.color1 }
  }))
  return {
    tooltip: { trigger: 'item' },
    geo: {
      map: 'china',
      roam: true,
      zoom: 1.1,
      itemStyle: {
        areaColor: 'rgba(30, 60, 90, 0.6)',
        borderColor: 'rgba(100, 140, 180, 0.5)',
        borderWidth: 0.8
      },
      label: {
        show: true,
        color: '#b8c5d9',
        fontSize: 11,
        fontWeight: 'normal'
      },
      emphasis: {
        itemStyle: { areaColor: 'rgba(50, 100, 150, 0.8)' },
        label: { show: true, color: '#e8edf5', fontSize: 12 }
      }
    },
    series: [
      {
        type: 'lines',
        coordinateSystem: 'geo',
        data: lineData,
        polyline: false,
        lineStyle: { curveness: 0.2 }
      },
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: MOCK_MAP_SCATTER.map((item) => ({ value: [item[0], item[1]] })),
        symbolSize: 10,
        showEffectOn: 'emphasis',
        rippleEffect: { scale: 2, brushType: 'stroke' },
        itemStyle: { color: theme.color1, shadowBlur: 8 }
      }
    ]
  }
}

function buildActivityBarOption(): EChartsOption {
  const d = MOCK_ACTIVITY_TREND
  return {
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: d.xAxis, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } }, axisLabel: { color: theme.axis } },
    yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } }, axisLabel: { color: theme.axis } },
    series: [
      { type: 'bar', name: 'Sales', data: d.sales, barWidth: '35%', itemStyle: { color: theme.color1 } },
      { type: 'bar', name: 'Profit', data: d.profit, barWidth: '35%', itemStyle: { color: theme.color2 } }
    ]
  }
}

function buildClientPieOption(): EChartsOption {
  const d = MOCK_CLIENT_TYPES
  return {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '50%'],
        data: d.map((item, i) => ({
          ...item,
          itemStyle: {
            color: [theme.color1, theme.color2, '#9a60b4', '#e6c547', '#5b8ff9'][i % 5]
          }
        })),
        label: { color: theme.label },
        emphasis: { itemStyle: { shadowBlur: 10 } }
      }
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '45%',
        style: { text: `${summary.value.activityRate}%`, fontSize: 22, fontWeight: 'bold', fill: theme.label },
        z: 10
      },
      {
        type: 'text',
        left: 'center',
        top: '52%',
        style: { text: '活跃度', fontSize: 12, fill: theme.axis },
        z: 10
      }
    ]
  }
}

let resizeObserver: ResizeObserver | null = null

function initChinaMap() {
  if (!chinaMapRef.value) return
  const chinaJson = (chinaMapData as { map_100000?: unknown }).map_100000
  if (chinaJson) {
    echarts.registerMap('china', chinaJson as Parameters<typeof echarts.registerMap>[1])
    chartChinaMap.chartRef!.value = chinaMapRef.value
    chartChinaMap.initChart(buildChinaMapOption())
  }
}

onMounted(() => {
  updateScale()
  updateTime()
  timeTimer = setInterval(updateTime, 1000)
  if (rootRef.value) {
    resizeObserver = new ResizeObserver(() => updateScale())
    resizeObserver.observe(rootRef.value)
  }
  window.addEventListener('resize', updateScale)

  nextTick(() => {
    if (gaugeCoverRef.value) {
      chartGaugeCover.chartRef!.value = gaugeCoverRef.value
      chartGaugeCover.initChart(buildGaugeOption(summary.value.targetCoverageRate, theme.color1))
    }
    if (gaugePenetrateRef.value) {
      chartGaugePenetrate.chartRef!.value = gaugePenetrateRef.value
      chartGaugePenetrate.initChart(buildGaugeOption(summary.value.targetPenetrationRate, theme.color2))
    }
    if (trendLineRef.value) {
      chartTrendLine.chartRef!.value = trendLineRef.value
      chartTrendLine.initChart(buildTrendLineOption())
    }
    if (channelBarRef.value) {
      chartChannelBar.chartRef!.value = channelBarRef.value
      chartChannelBar.initChart(buildChannelBarOption())
    }
    initChinaMap()
    if (activityBarRef.value) {
      chartActivityBar.chartRef!.value = activityBarRef.value
      chartActivityBar.initChart(buildActivityBarOption())
    }
    if (clientPieRef.value) {
      chartClientPie.chartRef!.value = clientPieRef.value
      chartClientPie.initChart(buildClientPieOption())
    }
  })
})

onUnmounted(() => {
  if (timeTimer) clearInterval(timeTimer)
  if (resizeObserver && rootRef.value) {
    resizeObserver.unobserve(rootRef.value)
    resizeObserver = null
  }
  window.removeEventListener('resize', updateScale)
  ;[chartGaugeCover, chartGaugePenetrate, chartTrendLine, chartChannelBar, chartChinaMap, chartActivityBar, chartClientPie].forEach((c) => c.destroyChart?.())
})
</script>

<style lang="scss" scoped>
.finance-screen-root {
  position: relative;
  width: 100%;
  height: var(--art-full-height, calc(100vh - 120px));
  overflow: auto;
  background: #0a0e1a;
  box-sizing: border-box;
}

.finance-screen-wrap {
  position: absolute;
  left: 0;
  top: 0;
  padding: 16px 24px;
  background: linear-gradient(180deg, #0d1220 0%, #0a0e1a 100%);
}

.finance-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px 20px;
  border: 1px solid rgba(74, 190, 255, 0.2);
  border-radius: 8px;
  background: rgba(74, 190, 255, 0.04);
}

.header-left {
  flex: 1;
  .logo-text {
    font-size: 14px;
    color: #8b9dc3;
  }
}

.header-title {
  flex: 1;
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  text-align: center;
  color: #e8edf5;
  text-shadow: 0 0 20px rgba(74, 190, 255, 0.5);
  letter-spacing: 4px;
}

.header-right {
  flex: 1;
  text-align: right;
  font-size: 14px;
  color: #8b9dc3;
}

.finance-body {
  display: grid;
  grid-template-columns: 320px 1fr 320px;
  gap: 16px;
  height: calc(1080px - 16px - 60px - 16px);
  min-height: 560px;
}

.panel {
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  overflow: hidden;

  &.panel-left,
  &.panel-right {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    overflow-y: auto;
  }

  &.panel-center {
    padding: 8px;
  }
}

.block {
  flex-shrink: 0;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);

  .block-title {
    font-size: 14px;
    font-weight: 600;
    color: #b8c5d9;
    margin-bottom: 10px;

    .icon {
      margin-right: 6px;
    }
  }
}

.kpi-main {
  display: flex;
  flex-direction: column;
  .kpi-value {
    font-size: 28px;
    font-weight: 700;
    color: #4ABEFF;
  }
  .kpi-label {
    font-size: 12px;
    color: #8b9dc3;
  }
}

.kpi-compare {
  font-size: 12px;
  margin: 6px 0 12px;
  &.down {
    color: #f56c6c;
  }
}

.gauges {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  height: 100px;
}

.gauge-dom {
  height: 100%;
  min-height: 80px;
}

.gauge-labels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 4px;
  font-size: 11px;
  color: #8b9dc3;
  text-align: center;
}

.chart-dom {
  height: 160px;
  min-height: 120px;
}

.china-map-dom {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.rank-table-wrap {
  overflow: auto;
  max-height: 200px;
}

.rank-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  th,
  td {
    padding: 6px 8px;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  th {
    color: #8b9dc3;
    font-weight: 500;
  }

  td {
    color: #b8c5d9;
  }
}
</style>
