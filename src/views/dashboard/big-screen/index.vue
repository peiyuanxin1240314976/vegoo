<template>
  <div ref="rootRef" class="big-screen-root art-full-height">
    <div
      class="big-screen-wrap"
      :style="{
        width: `${designWidth}px`,
        height: `${designHeight}px`,
        transform: `scale(${scale})`,
        transformOrigin: '0 0'
      }"
    >
      <!-- 顶部标题 -->
      <header class="big-screen-header">
        <h1 class="big-screen-title">全球区域数据统计</h1>
        <span class="big-screen-time">{{ overview.dataTime || '--' }}</span>
      </header>

      <!-- KPI 卡片 -->
      <section class="big-screen-kpi">
        <div class="kpi-card">
          <div class="kpi-label">总收入（万元）</div>
          <div class="kpi-value">{{ formatNum(overview.summary.totalRevenue) }}</div>
          <div class="kpi-trend up">同比 {{ formatPercent(overview.summary.revenueGrowth) }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">总用户数</div>
          <div class="kpi-value">{{ formatNum(overview.summary.totalUsers) }}</div>
          <div class="kpi-trend up">同比 {{ formatPercent(overview.summary.usersGrowth) }}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">总订单数</div>
          <div class="kpi-value">{{ formatNum(overview.summary.totalOrders) }}</div>
        </div>
        <div class="kpi-card highlight">
          <div class="kpi-label">区域数</div>
          <div class="kpi-value">{{ overview.regions.length }}</div>
          <div class="kpi-desc">欧洲 / 亚洲 / 中国</div>
        </div>
      </section>

      <!-- 主体图表区 -->
      <section class="big-screen-charts">
        <!-- 左侧：区域分布（柱状） -->
        <div class="chart-panel chart-panel-left">
          <div class="chart-panel-title">区域收入分布</div>
          <div ref="regionBarRef" class="chart-dom"></div>
        </div>
        <!-- 右侧上：世界地图 - 区域大屏分析 -->
        <div class="chart-panel chart-panel-right-top">
          <div class="chart-panel-title">世界地图 · 区域大屏分析</div>
          <div ref="worldMapRef" class="chart-dom"></div>
        </div>
        <!-- 右侧下：收入占比饼图 -->
        <div class="chart-panel chart-panel-right-bottom">
          <div class="chart-panel-title">收入占比</div>
          <div ref="pieRef" class="chart-dom"></div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useChart } from '@/hooks/core/useChart'
import { echarts, type EChartsOption } from '@/plugins/echarts'
import { MOCK_OVERVIEW, BIG_SCREEN_REGION_COLORS } from './mock'

// 走本地代理请求，避免 CORS（vite 将 /geo 代理到 ECharts 官方）
const WORLD_JSON_URL = '/geo/world.json'

defineOptions({ name: 'BigScreen' })

const designWidth = 1920
const designHeight = 1080

const rootRef = ref<HTMLElement>()
const scale = ref(1)

const updateScale = () => {
  const el = rootRef.value
  if (!el) return
  const w = el.clientWidth
  if (w <= 0) return
  // 以宽度撑满 main 主体，高度超出时由 big-screen-root 的 overflow:auto 滚动
  scale.value = w / designWidth
}

const overview = ref(MOCK_OVERVIEW)

const formatNum = (n: number) => {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  return n.toLocaleString()
}
const formatPercent = (v: number) => (v >= 0 ? `+${(v * 100).toFixed(1)}%` : `${(v * 100).toFixed(1)}%`)

const regionBarRef = ref<HTMLElement>()
const worldMapRef = ref<HTMLElement>()
const pieRef = ref<HTMLElement>()

const chartRegionBar = useChart()
const chartWorldMap = useChart()
const chartPie = useChart()

function buildRegionBarOption(): EChartsOption {
  const regions = overview.value.regions
  return {
    grid: { left: 80, right: 40, top: 30, bottom: 40 },
    xAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }, axisLabel: { color: '#8b9dc3' } },
    yAxis: {
      type: 'category',
      data: regions.map((r) => r.regionName),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#b8c5d9' }
    },
    series: [
      {
        type: 'bar',
        barWidth: '50%',
        data: regions.map((r, i) => ({ value: r.metrics.revenue ?? 0, itemStyle: { color: BIG_SCREEN_REGION_COLORS[i % BIG_SCREEN_REGION_COLORS.length] } })),
        label: { show: true, position: 'right', color: '#b8c5d9', fontSize: 14 }
      }
    ]
  }
}

/** 区域大致中心坐标 [经度, 纬度] */
const REGION_COORDS: Record<string, [number, number]> = {
  europe: [15, 48],
  asia: [100, 34],
  china: [105, 35]
}

function buildWorldMapOption(): EChartsOption {
  const regions = overview.value.regions
  const scatterData = regions.map((r, i) => ({
    name: r.regionName,
    value: [...(REGION_COORDS[r.regionCode] || [0, 0]), r.metrics.users ?? 0],
    itemStyle: { color: BIG_SCREEN_REGION_COLORS[i % BIG_SCREEN_REGION_COLORS.length] }
  }))
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p: any) => {
        const d = p.data
        const r = regions.find((x) => x.regionName === d.name)
        if (!r) return `${d.name}`
        return `${d.name}<br/>用户: ${(r.metrics.users ?? 0).toLocaleString()}<br/>收入: ${(r.metrics.revenue ?? 0)} 万元`
      }
    },
    geo: {
      map: 'world',
      roam: true,
      zoom: 1.2,
      itemStyle: {
        areaColor: 'rgba(30, 60, 90, 0.6)',
        borderColor: 'rgba(100, 140, 180, 0.4)',
        borderWidth: 0.8
      },
      emphasis: {
        itemStyle: { areaColor: 'rgba(50, 100, 150, 0.8)' },
        label: { show: false }
      },
      silent: false
    },
    series: [
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: scatterData,
        symbolSize: (val: number[]) => Math.max(12, Math.min(28, (val[2] / 50000) * 8)),
        showEffectOn: 'emphasis',
        rippleEffect: { scale: 2.5, brushType: 'stroke' },
        label: { show: true, formatter: '{b}', position: 'right', color: '#b8c5d9', fontSize: 12 },
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' }
      }
    ]
  }
}

async function initWorldMap() {
  if (!worldMapRef.value) return
  try {
    const res = await fetch(WORLD_JSON_URL)
    const worldJson = await res.json()
    echarts.registerMap('world', worldJson)
    chartWorldMap.chartRef!.value = worldMapRef.value
    chartWorldMap.initChart(buildWorldMapOption())
  } catch (e) {
    console.error('[BigScreen] 世界地图 GeoJSON 加载失败', e)
  }
}

function buildPieOption(): EChartsOption {
  const regions = overview.value.regions
  const data = regions.map((r, i) => ({
    name: r.regionName,
    value: r.metrics.revenue ?? 0,
    itemStyle: { color: BIG_SCREEN_REGION_COLORS[i % BIG_SCREEN_REGION_COLORS.length] }
  }))
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {c} 万元 ({d}%)' },
    legend: { orient: 'horizontal', bottom: 8, textStyle: { color: '#8b9dc3', fontSize: 12 } },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '48%'],
        avoidLabelOverlap: false,
        label: { show: true, color: '#b8c5d9', fontSize: 13 },
        data,
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' } }
      }
    ]
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateScale()
  if (rootRef.value) {
    resizeObserver = new ResizeObserver(() => updateScale())
    resizeObserver.observe(rootRef.value)
  }
  window.addEventListener('resize', updateScale)

  nextTick(() => {
    if (regionBarRef.value) {
      chartRegionBar.chartRef!.value = regionBarRef.value
      chartRegionBar.initChart(buildRegionBarOption())
    }
    initWorldMap()
    if (pieRef.value) {
      chartPie.chartRef!.value = pieRef.value
      chartPie.initChart(buildPieOption())
    }
  })
})

onUnmounted(() => {
  if (resizeObserver && rootRef.value) {
    resizeObserver.unobserve(rootRef.value)
    resizeObserver = null
  }
  window.removeEventListener('resize', updateScale)
  chartRegionBar.destroyChart?.()
  chartWorldMap.destroyChart?.()
  chartPie.destroyChart?.()
})
</script>

<style lang="scss" scoped>
.big-screen-root {
  position: relative;
  width: 100%;
  height: var(--art-full-height, calc(100vh - 120px));
  overflow: auto; /* 内容超出时可滚动，避免被 hidden 裁切 */
  background: #0a1628;
  box-sizing: border-box;
}

.big-screen-wrap {
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  padding: 24px 32px;
  background: linear-gradient(180deg, #0d1b2a 0%, #0a1628 100%);
}

.big-screen-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.big-screen-title {
  margin: 0;
  font-size: 32px;
  font-weight: 600;
  color: #e8edf5;
  letter-spacing: 2px;
}

.big-screen-time {
  font-size: 16px;
  color: #8b9dc3;
}

.big-screen-kpi {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.kpi-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 24px;
  &.highlight {
    border-color: rgba(74, 190, 255, 0.35);
    background: rgba(74, 190, 255, 0.06);
  }
}

.kpi-label {
  font-size: 14px;
  color: #8b9dc3;
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 36px;
  font-weight: 700;
  color: #e8edf5;
  line-height: 1.2;
}

.kpi-trend {
  font-size: 13px;
  margin-top: 6px;
  &.up {
    color: #67c23a;
  }
}

.kpi-desc {
  font-size: 13px;
  color: #8b9dc3;
  margin-top: 6px;
}

.big-screen-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 20px;
  height: calc(1080px - 24px - 28px - 32px - 28px - 28px - 24px);
  min-height: 480px;
}

.chart-panel {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &.chart-panel-left {
    grid-row: span 2;
  }
}

.chart-panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #b8c5d9;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.chart-dom {
  flex: 1;
  min-height: 0;
}
</style>
