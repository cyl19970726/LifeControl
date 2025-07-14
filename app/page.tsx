"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useLifeAgentStore } from "@/lib/store"
import { ChatAgent } from "@/components/chat-agent"
import { Target, FolderOpen, CheckSquare, BookOpen, Plus } from "lucide-react"

export default function HomePage() {
  const { goals, projects, reviews, tasks } = useLifeAgentStore()
  const [showChat, setShowChat] = useState(false)

  const activeProjects = projects.filter((p) => p.status === "active")
  const todayTasks = tasks.filter(
    (t) => !t.completed && new Date(t.dueDate).toDateString() === new Date().toDateString(),
  )
  const recentReviews = reviews.slice(-3)

  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId)
    const completedTasks = projectTasks.filter((t) => t.completed)
    return projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">LifeAgent Dashboard</h1>
          <p className="text-slate-600">Your cognitive collaboration workspace for goals, projects, and reflections</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Goals Summary */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                My Goals
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {goals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="p-3 bg-slate-50 rounded-lg">
                    <h4 className="font-medium text-slate-800">{goal.title}</h4>
                    <Badge variant="outline" className="mt-1">
                      {goal.stage}
                    </Badge>
                  </div>
                ))}
                {goals.length === 0 && (
                  <p className="text-slate-500 text-sm">No goals set yet. Start by defining your vision!</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Projects */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-green-600" />
                Active Projects
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeProjects.map((project) => (
                  <div key={project.id} className="p-4 border rounded-lg bg-white">
                    <h4 className="font-medium text-slate-800 mb-2">{project.name}</h4>
                    <p className="text-sm text-slate-600 mb-3">{project.description}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(getProjectProgress(project.id))}%</span>
                      </div>
                      <Progress value={getProjectProgress(project.id)} className="h-2" />
                    </div>
                    <div className="flex gap-1 mt-2">
                      {project.goals.slice(0, 2).map((goalId) => {
                        const goal = goals.find((g) => g.id === goalId)
                        return goal ? (
                          <Badge key={goalId} variant="secondary" className="text-xs">
                            {goal.title}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                ))}
                {activeProjects.length === 0 && (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-slate-500">No active projects. Create your first project to get started!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-orange-600" />
                Today's Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded">
                    <input type="checkbox" checked={task.completed} className="rounded" readOnly />
                    <span className={`flex-1 ${task.completed ? "line-through text-slate-500" : "text-slate-800"}`}>
                      {task.title}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {projects.find((p) => p.id === task.projectId)?.name || "General"}
                    </Badge>
                  </div>
                ))}
                {todayTasks.length === 0 && (
                  <p className="text-slate-500 text-sm">No tasks for today. Great job staying on top of things!</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reflections */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Recent Reflections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReviews.map((review) => (
                  <div key={review.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-slate-800">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {review.type}
                      </Badge>
                    </div>
                    {review.entries.slice(0, 1).map((entry, idx) => (
                      <p key={idx} className="text-sm text-slate-600 line-clamp-2">
                        {entry.content}
                      </p>
                    ))}
                  </div>
                ))}
                {recentReviews.length === 0 && (
                  <p className="text-slate-500 text-sm">No reflections yet. Start documenting your journey!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ChatAgent Toggle */}
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={() => setShowChat(!showChat)}
            className="rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700"
          >
            🤖
          </Button>
        </div>

        {/* ChatAgent Window */}
        {showChat && (
          <div className="fixed bottom-24 right-6 w-96 h-96 bg-white rounded-lg shadow-xl border">
            <ChatAgent onClose={() => setShowChat(false)} />
          </div>
        )}
      </div>
    </div>
  )
}
