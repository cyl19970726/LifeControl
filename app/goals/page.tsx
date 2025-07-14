"use client"

import type React from "react"

import { useState } from "react"
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
import { useLifeAgentStore } from "@/lib/store"
import { Target, Plus, Edit, Trash2 } from "lucide-react"

export default function GoalsPage() {
  const { goals, projects, addGoal, updateGoal, deleteGoal } = useLifeAgentStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stage: "quarter" as "life" | "yearly" | "quarter",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingGoal) {
      updateGoal(editingGoal, formData)
      setEditingGoal(null)
    } else {
      addGoal(formData)
    }
    setFormData({ title: "", description: "", stage: "quarter" })
    setIsDialogOpen(false)
  }

  const handleEdit = (goal: any) => {
    setFormData({
      title: goal.title,
      description: goal.description,
      stage: goal.stage,
    })
    setEditingGoal(goal.id)
    setIsDialogOpen(true)
  }

  const getLinkedProjects = (goalId: string) => {
    return projects.filter((p) => p.goals.includes(goalId))
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "life":
        return "bg-purple-100 text-purple-800"
      case "yearly":
        return "bg-blue-100 text-blue-800"
      case "quarter":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-600" />
              Goals Management
            </h1>
            <p className="text-slate-600">
              Define and track your life vision, yearly objectives, and quarterly targets
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingGoal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
                <DialogDescription>Define a clear goal that will guide your projects and activities.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter goal title..."
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your goal in detail..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Stage</label>
                  <Select
                    value={formData.stage}
                    onValueChange={(value: any) => setFormData({ ...formData, stage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quarter">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="life">Life Vision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingGoal ? "Update Goal" : "Create Goal"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false)
                      setEditingGoal(null)
                      setFormData({ title: "", description: "", stage: "quarter" })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const linkedProjects = getLinkedProjects(goal.id)
            return (
              <Card key={goal.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge className={getStageColor(goal.stage)}>{goal.stage}</Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteGoal(goal.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">{goal.description}</CardDescription>

                  {linkedProjects.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Linked Projects</h4>
                      <div className="space-y-1">
                        {linkedProjects.map((project) => (
                          <div key={project.id} className="text-sm text-slate-600 bg-slate-50 p-2 rounded">
                            {project.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-slate-500">
                    Created {new Date(goal.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {goals.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-600 mb-2">No Goals Yet</h3>
            <p className="text-slate-500 mb-6">Start by creating your first goal to guide your journey</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Goal
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  )
}
