import { toolRegistry } from "./registry"
import { insightsEngine } from "@/lib/analytics/insights"

// 获取个人洞察工具
toolRegistry.register({
  name: "getPersonalInsights",
  description: "获取基于用户数据的个人洞察和分析报告",
  parameters: {
    type: "object",
    properties: {
      timeRange: {
        type: "string",
        enum: ["week", "month", "quarter"],
        description: "分析时间范围",
      },
    },
  },
  execute: async (params: { timeRange?: "week" | "month" | "quarter" }) => {
    try {
      const userId = "temp-user-id" // TODO: 从认证中获取真实用户ID
      const insights = await insightsEngine.generatePersonalInsights(userId)

      return {
        success: true,
        insights,
        summary: `生成了个人洞察报告：完成率 ${insights.productivity.completionRate}%，生产力趋势 ${insights.productivity.productivityTrend}，${insights.recommendations.\
