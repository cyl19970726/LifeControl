"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { CheckSquare, Plus, Edit, Trash2, Calendar, AlertTriangle, Clock, TrendingUp } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  dueDate: string | null
  projectName?: string
  createdAt: string
}

interface TaskStats {
  total: number
  completed: number
  pending: number
  overdue: number
  completionRate: number
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    dueDate: "",
  })

  useEffect(() => {
    fetchTasks()
    fetchStats()
  }, [])

  const fetchTasks = async (filter?: string) => {
    try {
      setLoading(true)
      const url = filter ? `/api/tasks?${filter}` : "/api/tasks"
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setTasks(result.data)
      } else {
        console.error("Failed to fetch tasks:", result.error)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/tasks/stats")
      const result = await response.json()

      if (result.success) {
        setStats(result.data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingTask ? `/api/tasks/${editingTask}` : "/api/tasks"
      const method = editingTask ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setFormData({ title: "", description: "", priority: "MEDIUM", dueDate: "" })
        setIsDialogOpen(false)
        setEditingTask(null)
        fetchTasks()
        fetchStats()
      } else {
        console.error("Failed to save task:", result.error)
      }
    } catch (error) {
      console.error("Error saving task:", error)
    }
  }

  const handleEdit = (task: Task) => {
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
    })
    setEditingTask(task.id)
    setIsDialogOpen(true)
  }

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: !completed }),
      })

      if (response.ok) {
        fetchTasks()
        fetchStats()
      }
    } catch (error) {
      console.error("Error toggling task:", error)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm("确定要删除这个任务吗？")) return

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTasks()
        fetchStats()
      }
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800"
      case "HIGH":
        return "bg-orange-100 text-orange-800"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800"
      case "LOW":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  if (loading && tasks.length === 0) {
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
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingTask ? "编辑任务" : "创建新任务"}</DialogTitle>
                <DialogDescription>添加一个新任务来跟踪你的工作进度。</DialogDescription>
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
                <div>
                  <label className="text-sm font-medium text-slate-700">优先级</label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
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
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingTask ? "更新任务" : "创建任务"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setEditingTask(null)
                      setFormData({ title: "", description: "", priority: "MEDIUM", dueDate: "" })
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
                  <CheckSquare className="h-5 w-5 text-blue-600" />
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
                  <Clock className="h-5 w-5 text-yellow-600" />
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
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-sm text-slate-600">已逾期</p>
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
            <TabsTrigger value="all" onClick={() => fetchTasks()}>
              全部任务
            </TabsTrigger>
            <TabsTrigger value="pending" onClick={() => fetchTasks("completed=false")}>
              待完成
            </TabsTrigger>
            <TabsTrigger value="completed" onClick={() => fetchTasks("completed=true")}>
              已完成
            </TabsTrigger>
            <TabsTrigger value="upcoming" onClick={() => fetchTasks("upcoming=true")}>
              即将到期
            </TabsTrigger>
            <TabsTrigger value="overdue" onClick={() => fetchTasks("overdue=true")}>
              已逾期
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <TasksList
              tasks={tasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
              getPriorityColor={getPriorityColor}
              isOverdue={isOverdue}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <TasksList
              tasks={tasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
              getPriorityColor={getPriorityColor}
              isOverdue={isOverdue}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <TasksList
              tasks={tasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
              getPriorityColor={getPriorityColor}
              isOverdue={isOverdue}
            />
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            <TasksList
              tasks={tasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
              getPriorityColor={getPriorityColor}
              isOverdue={isOverdue}
            />
          </TabsContent>

          <TabsContent value="overdue" className="mt-6">
            <TasksList
              tasks={tasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
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
  onEdit,
  onDelete,
  onToggleComplete,
  getPriorityColor,
  isOverdue,
}: {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string, completed: boolean) => void
  getPriorityColor: (priority: string) => string
  isOverdue: (dueDate: string | null) => boolean
}) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-slate-600 mb-2">暂无任务</h3>
        <p className="text-slate-500">创建你的第一个任务来开始管理工作</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <Card key={task.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleComplete(task.id, task.completed)}
                  className="rounded"
                />
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority === "URGENT"
                    ? "紧急"
                    : task.priority === "HIGH"
                      ? "高"
                      : task.priority === "MEDIUM"
                        ? "中"
                        : "低"}
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            <CardTitle className={`text-lg ${task.completed ? "line-through text-slate-500" : ""}`}>
              {task.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">{task.description}</CardDescription>

            {task.dueDate && (
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                <span
                  className={`text-sm ${
                    isOverdue(task.dueDate) && !task.completed ? "text-red-600 font-medium" : "text-slate-600"
                  }`}
                >
                  {new Date(task.dueDate).toLocaleDateString()}
                  {isOverdue(task.dueDate) && !task.completed && " (已逾期)"}
                </span>
              </div>
            )}

            {task.projectName && (
              <div className="mb-2">
                <Badge variant="outline" className="text-xs">
                  {task.projectName}
                </Badge>
              </div>
            )}

            <div className="text-xs text-slate-500">
              创建于 {new Date(task.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
