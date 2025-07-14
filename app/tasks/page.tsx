"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckSquare, Plus, Calendar, AlertCircle, Clock, TrendingUp } from "lucide-react"
import type { TaskWithRelations } from "@/lib/db/repositories/task-repository"

interface TaskStats {
  total: number
  completed: number
  pending: number
  overdue: number
  completionRate: number
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([])
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    projectId: "",
  })

  useEffect(() => {
    fetchTasks()
    fetchStats()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks")
      const result = await response.json()
      if (result.success) {
        setTasks(result.data)
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    }
  }

  const fetchStats = async () => {
    try {
      // 这里应该调用统计API，暂时用模拟数据
      setStats({
        total: 25,
        completed: 18,
        pending: 7,
        overdue: 2,
        completionRate: 72,
      })
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      if (result.success) {
        setTasks([result.data, ...tasks])
        setFormData({
          title: "",
          description: "",
          priority: "MEDIUM",
          dueDate: "",
          projectId: "",
        })
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error("Failed to create task:", error)
    }
  }

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed }),
      })

      const result = await response.json()
      if (result.success) {
        setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed } : task)))
      }
    } catch (error) {
      console.error("Failed to update task:", error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800"
      case "HIGH":
        return "bg-orange-100 text-orange-800"
      case "MEDIUM":
        return "bg-blue-100 text-blue-800"
      case "LOW":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date() && !tasks.find((t) => t.dueDate === dueDate)?.completed
  }

  const filterTasks = (filter: string) => {
    switch (filter) {
      case "pending":
        return tasks.filter((task) => !task.completed)
      case "completed":
        return tasks.filter((task) => task.completed)
      case "overdue":
        return tasks.filter((task) => !task.completed && task.dueDate && isOverdue(task.dueDate))
      case "today":
        const today = new Date().toDateString()
        return tasks.filter((task) => task.dueDate && new Date(task.dueDate).toDateString() === today)
      default:
        return tasks
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center gap-3">
              <CheckSquare className="h-8 w-8 text-orange-600" />
              任务管理
            </h1>
            <p className="text-slate-600">管理你的任务，跟踪进度，提高效率</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                添加任务
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新任务</DialogTitle>
                <DialogDescription>添加一个新任务来跟踪你的工作进度</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">任务标题</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="输入任务标题..."
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">任务描述</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="描述任务详情..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">优先级</label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">低</SelectItem>
                        <SelectItem value="MEDIUM">中</SelectItem>
                        <SelectItem value="HIGH">高</SelectItem>
                        <SelectItem value="URGENT">紧急</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">截止日期</label>
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    创建任务
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setFormData({
                        title: "",
                        description: "",
                        priority: "MEDIUM",
                        dueDate: "",
                        projectId: "",
                      })
                    }}
                  >
                    取消
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-slate-600">总任务</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-slate-600">已完成</p>
                    <p className="text-2xl font-bold">{stats.completed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-slate-600">待完成</p>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-slate-600">逾期</p>
                    <p className="text-2xl font-bold">{stats.overdue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tasks Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">全部任务</TabsTrigger>
            <TabsTrigger value="pending">待完成</TabsTrigger>
            <TabsTrigger value="completed">已完成</TabsTrigger>
            <TabsTrigger value="overdue">逾期</TabsTrigger>
            <TabsTrigger value="today">今日</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <TasksList
              tasks={filterTasks("all")}
              onToggleComplete={handleToggleComplete}
              getPriorityColor={getPriorityColor}
              isOverdue={isOverdue}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <TasksList
              tasks={filterTasks("pending")}
              onToggleComplete={handleToggleComplete}
              getPriorityColor={getPriorityColor}
              isOverdue={isOverdue}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <TasksList
              tasks={filterTasks("completed")}
              onToggleComplete={handleToggleComplete}
              getPriorityColor={getPriorityColor}
              isOverdue={isOverdue}
            />
          </TabsContent>

          <TabsContent value="overdue" className="mt-6">
            <TasksList
              tasks={filterTasks("overdue")}
              onToggleComplete={handleToggleComplete}
              getPriorityColor={getPriorityColor}
              isOverdue={isOverdue}
            />
          </TabsContent>

          <TabsContent value="today" className="mt-6">
            <TasksList
              tasks={filterTasks("today")}
              onToggleComplete={handleToggleComplete}
              getPriorityColor={getPriorityColor}
              isOverdue={isOverdue}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function TasksList({
  tasks,
  onToggleComplete,
  getPriorityColor,
  isOverdue,
}: {
  tasks: TaskWithRelations[]
  onToggleComplete: (id: string, completed: boolean) => void
  getPriorityColor: (priority: string) => string
  isOverdue: (dueDate: string | null) => boolean
}) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-slate-600 mb-2">暂无任务</h3>
        <p className="text-slate-500">创建你的第一个任务开始管理工作</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card key={task.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Checkbox
                checked={task.completed}
                onCheckedChange={(checked) => onToggleComplete(task.id, checked as boolean)}
                className="mt-1"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`font-medium ${task.completed ? "line-through text-slate-500" : "text-slate-800"}`}>
                      {task.title}
                    </h3>
                    {task.description && <p className="text-sm text-slate-600 mt-1 line-clamp-2">{task.description}</p>}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority === "URGENT"
                        ? "紧急"
                        : task.priority === "HIGH"
                          ? "高"
                          : task.priority === "MEDIUM"
                            ? "中"
                            : "低"}
                    </Badge>

                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span className={isOverdue(task.dueDate) ? "text-red-600 font-medium" : "text-slate-600"}>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                  {task.project && <span className="bg-slate-100 px-2 py-1 rounded text-xs">{task.project.name}</span>}
                  <span>创建于 {new Date(task.createdAt).toLocaleDateString()}</span>
                  {task.completed && task.completedAt && (
                    <span>完成于 {new Date(task.completedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
