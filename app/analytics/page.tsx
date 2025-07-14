"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, Target, Clock, Brain, Lightbulb, AlertTriangle, CheckCircle } from "lucide-react"
import type { PersonalInsights } from "@/lib/analytics/insights"

export default function AnalyticsPage() {
  const [insights, setInsights] = useState<PersonalInsights | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setInsights({
        productivity: {
          averageTasksPerDay: 3.2,
          completionRate: 78,
          mostProductiveTimeSlot: "上午",
          productivityTrend: "increasing",
        },
        patterns: {
          commonChallenges: [
            { challenge: "时间管理", frequency: 8 },
            { challenge: "技术难题", frequency: 6 },
            { challenge: "沟通协调", frequency: 4 },
          ],
          successFactors: [
            { factor: "专注工作", impact: 9 },
            { factor: "提前规划", impact: 7 },
            { factor: "团队协作", impact: 5 },
          ],
          emotionalTrends: [
            { date: "2024-01-01", mood: 7 },
            { date: "2024-01-02", mood: 8 },
            { date: "2024-01-03", mood: 6 },
            { date: "2024-01-04", mood: 9 },
            { date: "2024-01-05", mood: 7 },
            { date: "2024-01-06", mood: 8 },
            { date: "2024-01-07", mood: 8 },
          ],
        },
        recommendations: [
          {
            type: "optimization",
            title: "优化时间管理",
            description: "你经常提到时间管理的挑战，建议制定更详细的时间规划",
            actionItems: ["使用番茄工作法", "设置专注时间块", "减少会议干扰"],
          },
          {
            type: "opportunity",
            title: "发挥上午优势",
            description: "数据显示你在上午最有生产力，建议将重要任务安排在上午",
            actionItems: ["上午处理复杂任务", "下午安排轻松工作", "保护上午时间"],
          },
        ],
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!insights) return null

  const moodChartData = insights.patterns.emotionalTrends.map((item) => ({
    date: new Date(item.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
    mood: item.mood,
  }))

  const challengeChartData = insights.patterns.commonChallenges.map((item) => ({
    name: item.challenge,
    value: item.frequency,
  }))

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            数据洞察
          </h1>
          <p className="text-slate-600">基于你的数据生成个性化洞察和建议</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-slate-600">完成率</p>
                  <p className="text-2xl font-bold">{insights.productivity.completionRate}%</p>
                </div>
              </div>
              <Progress value={insights.productivity.completionRate} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-slate-600">日均任务</p>
                  <p className="text-2xl font-bold">{insights.productivity.averageTasksPerDay}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {insights.productivity.productivityTrend === "increasing" ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className="text-sm text-slate-600">生产力趋势</p>
                  <p className="text-lg font-bold">
                    {insights.productivity.productivityTrend === "increasing" ? "上升" : "下降"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-slate-600">最佳时段</p>
                  <p className="text-lg font-bold">{insights.productivity.mostProductiveTimeSlot}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analysis */}
        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">趋势分析</TabsTrigger>
            <TabsTrigger value="patterns">模式识别</TabsTrigger>
            <TabsTrigger value="recommendations">智能建议</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>心情趋势</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={moodChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[1, 10]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="mood" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>挑战分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={challengeChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {challengeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    常见挑战
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.patterns.commonChallenges.map((challenge, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="font-medium">{challenge.challenge}</span>
                        <Badge variant="outline">{challenge.frequency} 次</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    成功因素
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.patterns.successFactors.map((factor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="font-medium">{factor.factor}</span>
                        <Badge className="bg-green-100 text-green-800">{factor.impact} 分</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <div className="space-y-4">
              {insights.recommendations.map((rec, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {rec.type === "optimization" && <Lightbulb className="h-5 w-5 text-yellow-600" />}
                      {rec.type === "warning" && <AlertTriangle className="h-5 w-5 text-red-600" />}
                      {rec.type === "opportunity" && <TrendingUp className="h-5 w-5 text-green-600" />}
                      {rec.title}
                      <Badge
                        variant={
                          rec.type === "optimization" ? "default" : rec.type === "warning" ? "destructive" : "secondary"
                        }
                      >
                        {rec.type === "optimization" ? "优化建议" : rec.type === "warning" ? "注意事项" : "机会点"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">{rec.description}</p>
                    <div>
                      <h4 className="font-medium mb-2">行动建议：</h4>
                      <ul className="space-y-1">
                        {rec.actionItems.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
