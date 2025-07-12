"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Target, Calendar, CheckSquare, FileText, Edit, Save, X, Clock, TrendingUp } from "lucide-react"
import type { ProjectWithRelations } from "@/lib/db/repositories"

interface ProjectStats {
  totalTasks: number
  completedTasks: number
  totalReviews: number
  progressPercentage: number
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<ProjectWithRelations | null>(null)
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    status: "ACTIVE",
  })

  const projectId = params.id as string

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}`)
      const result = await response.json()

      if (result.success) {
        setProject(result.data)
        setStats(result.data.stats)
        setEditForm({
          name: result.data.name,
          description: result.data.description || "",
          status: result.data.status,
        })
      } else {
        console.error("Failed to fetch project:", result.error)
      }
    } catch (error) {
      console.error("Error fetching project:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      })

      const result = await response.json()

      if (result.success) {
        setProject(result.data)
        setEditing(false)
      } else {
        console.error("Failed to update project:", result.error)
      }
    } catch (error) {
      console.error("Error updating project:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800"
      case "COMPLETED":
        return "bg-blue-100 text-blue-800"
      case "ARCHIVED":
        return "bg-gray-100 text-gray-800"
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">项目未找到</h1>
          <Button onClick={() => router.push("/projects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回项目列表
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.push("/projects")} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-2">
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-2xl font-bold"
                />
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="项目描述..."
                  rows={2}
                />
                <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">进行中</SelectItem>
                    <SelectItem value="PAUSED">暂停</SelectItem>
                    <SelectItem value="COMPLETED">已完成</SelectItem>
                    <SelectItem value="ARCHIVED">已归档</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">{project.name}</h1>
                <p className="text-slate-600">{project.description}</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <Button onClick={handleSave} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  保存
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)} size="sm">
                  <X className="h-4 w-4 mr-2" />
                  取消
                </Button>
              </>
            ) : (
              <>
                <Badge className={getStatusColor(project.status)}>
                  {project.status === "ACTIVE"
                    ? "进行中"
                    : project.status === "PAUSED"
                      ? "暂停"
                      : project.status === "COMPLETED"
                        ? "已完成"
                        : "已归档"}
                </Badge>
                <Button variant="outline" onClick={() => setEditing(true)} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-slate-600">关联目标</p>
                    <p className="text-2xl font-bold">{project.goals.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-slate-600">任务进度</p>
                    <p className="text-2xl font-bold">
                      {stats.completedTasks}/{stats.totalTasks}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-slate-600">完成度</p>
                    <p className="text-2xl font-bold">{stats.progressPercentage}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-slate-600">反思记录</p>
                    <p className="text-2xl font-bold">{stats.totalReviews}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Progress Bar */}
        {stats && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">整体进度</h3>
                <span className="text-sm text-slate-600">{stats.progressPercentage}% 完成</span>
              </div>
              <Progress value={stats.progressPercentage} className="h-3" />
            </CardContent>
          </Card>
        )}

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="goals">关联目标</TabsTrigger>
            <TabsTrigger value="tasks">任务列表</TabsTrigger>
            <TabsTrigger value="reviews">反思记录</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    项目时间线
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">项目创建</p>
                        <p className="text-xs text-slate-500">{new Date(project.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {project.startDate && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">开始日期</p>
                          <p className="text-xs text-slate-500">{new Date(project.startDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                    {project.endDate && (
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">计划结束</p>
                          <p className="text-xs text-slate-500">{new Date(project.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    最近活动
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.tasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${task.completed ? "bg-green-500" : "bg-gray-300"}`}
                        ></div>
                        <div>
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-slate-500">{task.completed ? "已完成" : "进行中"}</p>
                        </div>
                      </div>
                    ))}
                    {project.tasks.length === 0 && <p className="text-slate-500 text-sm">暂无任务活动</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  关联目标
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.goals.map((goal) => (
                    <div key={goal.id} className="p-3 bg-slate-50 rounded-lg">
                      <h4 className="font-medium">{goal.title}</h4>
                      <Badge variant="outline" className="mt-2">
                        {goal.stage === "LIFE" ? "人生愿景" : goal.stage === "YEARLY" ? "年度目标" : "季度目标"}
                      </Badge>
                    </div>
                  ))}
                  {project.goals.length === 0 && <p className="text-slate-500 text-center py-8">暂无关联目标</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  任务列表
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {project.tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50">
                      <input type="checkbox" checked={task.completed} readOnly className="rounded" />
                      <span className={`flex-1 ${task.completed ? "line-through text-slate-500" : "text-slate-800"}`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                  {project.tasks.length === 0 && <p className="text-slate-500 text-center py-8">暂无任务</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  反思记录
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.reviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline">{review.type}</Badge>
                        <span className="text-sm text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{review.content}</p>
                    </div>
                  ))}
                  {project.reviews.length === 0 && <p className="text-slate-500 text-center py-8">暂无反思记录</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
