"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Target, CheckSquare, BookOpen, Lightbulb, Calendar, Clock } from "lucide-react"

interface OverallStats {
  projects: {
    total: number
    active: number
    completed: number
    completionRate: number
  }
  tasks: {
    total: number
    completed: number
    pending: number
    overdue: number
    completionRate: number
  }
  reviews: {
    total: number
    thisWeek: number
  }
}

interface ProjectAnalysis {
  projectName: string
  progress: number
  status: string
  totalTasks: number
  completedTasks: number
  overdueTasks: number
  recommendations: string[]
}

interface Suggestion {
  type: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<OverallStats | null>(null)
  const [projectAnalysis, setProjectAnalysis] = useState<ProjectAnalysis[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      // 这里应该调用实际的 API，现在使用模拟数据
      const mockStats: OverallStats = {
        projects: {
          total: 5,
          active: 3,
          completed: 2,
          completionRate: 40,
        },
        tasks: {
          total: 25,
          completed: 18,
          pending: 7,
          overdue: 2,
          completionRate: 72,
        },
        reviews: {
          total: 15,
          thisWeek: 3,
        },
      }

      const mockAnalysis: ProjectAnalysis[] = [
        {
          projectName: "LifeAgent 开发",
          progress: 75,
          status: "正常",
          totalTasks: 12,
          completedTasks: 9,
          overdueTasks: 0,
          recommendations: ["准备项目收尾工作"],
        },
        {
          projectName: "机器学习学习",
          progress: 45,
          status: "进度缓慢",
          totalTasks: 8,
          completedTasks: 3,
          overdueTasks: 1,
          recommendations: ["处理 1 个逾期任务", "考虑分解大任务为小任务"],
        },
        {
          projectName: "健身计划",
          progress: 60,
          status: "正常",
          totalTasks: 5,
          completedTasks: 3,
          overdueTasks: 0,
          recommendations: [],
        },
      ]

      const mockSuggestions: Suggestion[] = [
        {
          type: "time_management",
          title: "改善时间管理",
          description: "你有 2 个逾期任务，建议重新评估任务优先级",
          priority: "high",
        },
        {
          type: "reflection",
          title: "增加反思频率",
          description: "定期反思有助于提高自我认知，建议每周至少写一次反思",
          priority: "medium",
        },
        {
          type: "productivity",
          title: "保持良好节奏",
          description: "你的任务完成率为 72%，继续保持这个良好的节奏",
          priority: "low",
        },
      ]

      setStats(mockStats)
      setProjectAnalysis(mockAnalysis)
      setSuggestions(mockSuggestions)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "正常":
        return "bg-green-100 text-green-800"
      case "进度缓慢":
        return "bg-yellow-100 text-yellow-800"
      case "有逾期任务":
        return "bg-red-100 text-red-800"
      case "接近完成":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              数据分析
            </h1>
            <p className="text-slate-600">深入了解你的进展，发现改进机会</p>
          </div>
          <Button onClick={fetchAnalytics} variant="outline">
            刷新数据
          </Button>
        </div>

        {/* Overview Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  项目概览
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">总项目数</span>
                    <span className="font-semibold">{stats.projects.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">活跃项目</span>
                    <span className="font-semibold">{stats.projects.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">已完成</span>
                    <span className="font-semibold">{stats.projects.completed}</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>完成率</span>
                      <span>{stats.projects.completionRate}%</span>
                    </div>
                    <Progress value={stats.projects.completionRate} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-green-600" />
                  任务概览
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">总任务数</span>
                    <span className="font-semibold">{stats.tasks.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">已完成</span>
                    <span className="font-semibold">{stats.tasks.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">待完成</span>
                    <span className="font-semibold">{stats.tasks.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">已逾期</span>
                    <span className="font-semibold text-red-600">{stats.tasks.overdue}</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>完成率</span>
                      <span>{stats.tasks.completionRate}%</span>
                    </div>
                    <Progress value={stats.tasks.completionRate} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  反思概览
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">总反思数</span>
                    <span className="font-semibold">{stats.reviews.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">本周新增</span>
                    <span className="font-semibold">{stats.reviews.thisWeek}</span>
                  </div>
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-700">
                      {stats.reviews.thisWeek >= 2 ? "很好！保持定期反思的习惯" : "建议增加反思频率，每周至少 2 次"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Analysis */}
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projects">项目分析</TabsTrigger>
            <TabsTrigger value="suggestions">个性化建议</TabsTrigger>
            <TabsTrigger value="trends">趋势分析</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  项目进度分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectAnalysis.map((project, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-lg">{project.projectName}</h4>
                        <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-slate-600">进度</p>
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress} className="flex-1 h-2" />
                            <span className="text-sm font-medium">{project.progress}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">任务完成</p>
                          <p className="font-semibold">
                            {project.completedTasks}/{project.totalTasks}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">逾期任务</p>
                          <p className={`font-semibold ${project.overdueTasks > 0 ? "text-red-600" : ""}`}>
                            {project.overdueTasks}
                          </p>
                        </div>
                      </div>

                      {project.recommendations.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-2">建议：</p>
                          <ul className="space-y-1">
                            {project.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                                <Lightbulb className="h-3 w-3" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suggestions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  个性化建议
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{suggestion.title}</h4>
                        <Badge className={getPriorityColor(suggestion.priority)}>
                          {suggestion.priority === "high" ? "高" : suggestion.priority === "medium" ? "中" : "低"}
                        </Badge>
                      </div>
                      <p className="text-slate-600">{suggestion.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  趋势分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-600 mb-2">趋势分析功能开发中</h3>
                  <p className="text-slate-500">即将推出详细的趋势分析图表，包括：</p>
                  <ul className="text-slate-500 mt-4 space-y-2">
                    <li>• 任务完成趋势</li>
                    <li>• 项目进度变化</li>
                    <li>• 反思频率统计</li>
                    <li>• 生产力热力图</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
