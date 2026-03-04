/**
 * 大屏数据统计 - Mock 数据
 *
 * 后续可替换为 API：GET /api/stats/big-screen/overview
 */

import type { BigScreenOverview, RegionStats } from '@/types/bigScreen'

export const MOCK_REGIONS: RegionStats[] = [
  {
    regionCode: 'europe',
    regionName: '欧洲',
    metrics: {
      revenue: 3280,
      users: 125000,
      orders: 45600,
      growth: 0.12
    }
  },
  {
    regionCode: 'asia',
    regionName: '亚洲',
    metrics: {
      revenue: 2890,
      users: 198000,
      orders: 52100,
      growth: 0.18
    }
  },
  {
    regionCode: 'china',
    regionName: '中国',
    metrics: {
      revenue: 4120,
      users: 256000,
      orders: 68900,
      growth: 0.22
    }
  }
]

export const MOCK_OVERVIEW: BigScreenOverview = {
  summary: {
    totalRevenue: 10290,
    totalUsers: 579000,
    totalOrders: 166600,
    revenueGrowth: 0.17,
    usersGrowth: 0.19
  },
  regions: MOCK_REGIONS,
  dataTime: '2026-03-04 10:30'
}

/** 大屏区域配色（欧洲/亚洲/中国） */
export const BIG_SCREEN_REGION_COLORS = [
  '#4ABEFF', // 欧洲 - 蓝
  '#FFAF20', // 亚洲 - 橙
  '#F56C6C'  // 中国 - 红
]
