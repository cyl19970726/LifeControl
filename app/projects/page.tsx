"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useLifeAgentStore } from "@/lib/store"
import { FolderOpen, Plus, Edit, Trash2, Play, Pause, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProjectsPage() {
  const { projects, goals, tasks, addProject, updateProject, deleteProject } = useLifeAgentStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active" as "active" | "paused" | "completed",
    goals: [] as string[],
  })

  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingProject) {
      updateProject(editingProject, formData)
      setEditingProject(null)
    } else {
      addProject(formData)
    }
    setFormData({ name: "", description: "", status: "active", goals: [] })
    setIsDialogOpen(false)
  }

  const handleEdit = (project: any) => {
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status,
      goals: project.goals,
    })
    setEditingProject(project.id)
    setIsDialogOpen(true)
  }

  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId)
    const completedTasks = projectTasks.filter((t) => t.completed)
    return projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play className="h-4 w-4" />
      case "paused":
        return <Pause className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <FolderOpen className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center gap-3">
              <FolderOpen className="h-8 w-8 text-green-600" />
              Projects Management
            </h1>
            <p className="text-slate-600">Organize your work into manageable projects with clear goals and tasks</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingProject ? "Edit Project" : "Create New Project"}</DialogTitle>
                <DialogDescription>
                  Set up a project to organize your tasks and track progress toward your goals.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Project Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter project name..."
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your project..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Linked Goals</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {goals.map((goal) => (
                      <label key={goal.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.goals.includes(goal.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, goals: [...formData.goals, goal.id] })
                            } else {
                              setFormData({ ...formData, goals: formData.goals.filter((g) => g !== goal.id) })
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{goal.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingProject ? "Update Project" : "Create Project"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setEditingProject(null)
                      setFormData({ name: "", description: "", status: "active", goals: [] })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const progress = getProjectProgress(project.id)
            const projectTasks = tasks.filter((t) => t.projectId === project.id)
            const linkedGoals = goals.filter((g) => project.goals.includes(g.id))

            return (
              <Card key={project.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader
                  className="pb-3 cursor-pointer hover:bg-slate-50 transition-colors rounded-t-lg"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <Badge className={getStatusColor(project.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(project.status)}
                        {project.status}
                      </div>
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteProject(project.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{project.description}</CardDescription>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="text-xs text-slate-500 mt-1">
                      {projectTasks.filter((t) => t.completed).length} of {projectTasks.length} tasks completed
                    </div>
                  </div>

                  {/* Linked Goals */}
                  {linkedGoals.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Linked Goals</h4>
                      <div className="flex flex-wrap gap-1">
                        {linkedGoals.map((goal) => (
                          <Badge key={goal.id} variant="outline" className="text-xs">
                            {goal.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-slate-500">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-600 mb-2">No Projects Yet</h3>
            <p className="text-slate-500 mb-6">Create your first project to start organizing your work</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  )
}
