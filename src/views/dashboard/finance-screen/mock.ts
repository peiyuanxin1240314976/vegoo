/**
 * 金融客户分析平台 - Mock 数据
 */

/** 全国新增客户数等核心指标 */
export const MOCK_FINANCE_SUMMARY = {
  nationalNewClients: 920.2,
  compareYesterday: -920.29,
  targetCoverageRate: 54.2,
  targetPenetrationRate: 54.2,
  activityRate: 35.6
}

/** 新增客户趋势（折线） */
export const MOCK_TREND_LINE = {
  xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
  sales: [120, 132, 101, 134, 90, 180],
  profit: [80, 100, 120, 90, 150, 120]
}

/** 新增客户渠道对比（横向条形） */
export const MOCK_CHANNELS = [
  { name: '手机', value: 955334 },
  { name: '电视', value: 835224 },
  { name: '电脑', value: 755279 },
  { name: '平板', value: 455109 },
  { name: '线下', value: 421378 }
]

/** 客户活跃趋势（柱状） */
export const MOCK_ACTIVITY_TREND = {
  xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
  sales: [65, 78, 56, 88, 92, 70],
  profit: [45, 62, 55, 72, 68, 58]
}

/** 客户类型分布（饼图） */
export const MOCK_CLIENT_TYPES = [
  { name: '1类公司', value: 28 },
  { name: '2类公司', value: 22 },
  { name: '3类公司', value: 18 },
  { name: '4类公司', value: 15 },
  { name: '5类公司', value: 17 }
]

/** 客户活跃排名（表格） */
export const MOCK_ACTIVITY_RANK = [
  { no: 1, name: '华东区', type: 'Sales', value: 125.0 },
  { no: 2, name: '华南区', type: 'Sales', value: 98.0 },
  { no: 3, name: '华北区', type: 'Sales', value: 87.0 },
  { no: 4, name: '西南区', type: 'Profit', value: 76.0 },
  { no: 5, name: '华中区', type: 'Profit', value: 65.0 },
  { no: 6, name: '西北区', type: 'Sales', value: 54.0 },
  { no: 7, name: '东北区', type: 'Profit', value: 48.0 }
]

/** 中国地图飞线：从某省到某省 [fromLng, fromLat, toLng, toLat] 或使用城市名需坐标 */
export const MOCK_MAP_LINES = [
  { coords: [[116.4, 39.9], [121.5, 31.2]] },
  { coords: [[113.3, 23.1], [116.4, 39.9]] },
  { coords: [[104.1, 30.6], [121.5, 31.2]] },
  { coords: [[118.8, 32.0], [113.3, 23.1]] },
  { coords: [[108.9, 34.3], [116.4, 39.9]] },
  { coords: [[114.3, 30.6], [104.1, 30.6]] },
  { coords: [[87.6, 43.8], [116.4, 39.9]] },
  { coords: [[106.6, 29.6], [113.3, 23.1]] }
]

/** 散点（城市/重点区域） */
export const MOCK_MAP_SCATTER = [
  [116.4, 39.9, 120],
  [121.5, 31.2, 180],
  [113.3, 23.1, 95],
  [104.1, 30.6, 88],
  [118.8, 32.0, 76],
  [108.9, 34.3, 65],
  [114.3, 30.6, 52]
]
