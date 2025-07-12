"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useLifeAgentStore } from "@/lib/store"
import { ArrowLeft, Target, Calendar, CheckSquare, FileText, Code, Layers, GitBranch, Clock, Plus } from "lucide-react"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { projects, goals, tasks, reviews, addTask, updateTask } = useLifeAgentStore()
  const [newTaskTitle, setNewTaskTitle] = useState("")

  const projectId = params.id as string
  const project = projects.find((p) => p.id === projectId)

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Project Not Found</h1>
          <Button onClick={() => router.push("/projects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  const projectTasks = tasks.filter((t) => t.projectId === projectId)
  const completedTasks = projectTasks.filter((t) => t.completed)
  const progress = projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0
  const linkedGoals = goals.filter((g) => project.goals.includes(g.id))
  const projectReviews = reviews.filter((r) => r.entries.some((e) => e.linkedProjectIds?.includes(projectId)))

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask({
        title: newTaskTitle,
        description: "",
        projectId: projectId,
        completed: false,
        dueDate: new Date().toISOString(),
      })
      setNewTaskTitle("")
    }
  }

  const toggleTask = (taskId: string, completed: boolean) => {
    updateTask(taskId, { completed })
  }

  // Mock data for detailed project information
  const architectureData = {
    overview:
      "LifeAgent is built as a modular, scalable cognitive collaboration platform using modern web technologies.",
    techStack: [
      { name: "Frontend", tech: "Next.js 14, React 18, TypeScript" },
      { name: "Styling", tech: "Tailwind CSS, Shadcn/UI" },
      { name: "State Management", tech: "Zustand with persistence" },
      { name: "AI Integration", tech: "AI SDK, OpenAI GPT-4" },
      { name: "Database", tech: "PostgreSQL, Prisma ORM" },
      { name: "Deployment", tech: "Vercel, Docker" },
    ],
    modules: [
      { name: "GoalModule", description: "Manages life vision and staged goals" },
      { name: "ProjectModule", description: "Handles project lifecycle and task management" },
      { name: "ReviewModule", description: "Structured reflection and pattern analysis" },
      { name: "ChatAgent", description: "AI-powered system orchestrator" },
      { name: "CodingAgent", description: "Dynamic module generation system" },
    ],
  }

  const apiEndpoints = [
    { method: "GET", endpoint: "/api/projects", description: "Fetch all projects" },
    { method: "POST", endpoint: "/api/projects", description: "Create new project" },
    { method: "PUT", endpoint: "/api/projects/:id", description: "Update project" },
    { method: "DELETE", endpoint: "/api/projects/:id", description: "Delete project" },
    { method: "GET", endpoint: "/api/projects/:id/tasks", description: "Get project tasks" },
    { method: "POST", endpoint: "/api/chat/completion", description: "ChatAgent interaction" },
    { method: "POST", endpoint: "/api/tools/execute", description: "Execute tool calls" },
  ]

  const milestones = [
    {
      id: 1,
      title: "System Architecture Design",
      status: "completed",
      dueDate: "2024-01-15",
      description: "Complete system design and module architecture",
    },
    {
      id: 2,
      title: "Core Modules Implementation",
      status: "in-progress",
      dueDate: "2024-02-01",
      description: "Implement Goals, Projects, and Reviews modules",
    },
    {
      id: 3,
      title: "ChatAgent Integration",
      status: "pending",
      dueDate: "2024-02-15",
      description: "Integrate AI SDK and implement tool calling",
    },
    {
      id: 4,
      title: "CodingAgent Development",
      status: "pending",
      dueDate: "2024-03-01",
      description: "Build dynamic module generation system",
    },
    {
      id: 5,
      title: "Production Deployment",
      status: "pending",
      dueDate: "2024-03-15",
      description: "Deploy to production with full monitoring",
    },
  ]

  const getMilestoneColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{project.name}</h1>
            <p className="text-slate-600">{project.description}</p>
          </div>
          <Badge
            className={`px-3 py-1 ${project.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
          >
            {project.status}
          </Badge>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-slate-600">Linked Goals</p>
                  <p className="text-2xl font-bold">{linkedGoals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-slate-600">Tasks</p>
                  <p className="text-2xl font-bold">
                    {completedTasks.length}/{projectTasks.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-slate-600">Progress</p>
                  <p className="text-2xl font-bold">{Math.round(progress)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-slate-600">Reviews</p>
                  <p className="text-2xl font-bold">{projectReviews.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Overall Progress</h3>
              <span className="text-sm text-slate-600">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="api">API Docs</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Linked Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {linkedGoals.map((goal) => (
                      <div key={goal.id} className="p-3 bg-slate-50 rounded-lg">
                        <h4 className="font-medium">{goal.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{goal.description}</p>
                        <Badge variant="outline" className="mt-2">
                          {goal.stage}
                        </Badge>
                      </div>
                    ))}
                    {linkedGoals.length === 0 && <p className="text-slate-500 text-sm">No linked goals</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Project created</p>
                        <p className="text-xs text-slate-500">{new Date(project.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {completedTasks.slice(-3).map((task) => (
                      <div key={task.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">Task completed: {task.title}</p>
                          <p className="text-xs text-slate-500">{new Date(task.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="architecture" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    System Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 mb-4">{architectureData.overview}</p>

                  <h4 className="font-semibold mb-3">Technology Stack</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {architectureData.techStack.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                        <h5 className="font-medium text-slate-800">{item.name}</h5>
                        <p className="text-sm text-slate-600">{item.tech}</p>
                      </div>
                    ))}
                  </div>

                  <h4 className="font-semibold mb-3">Core Modules</h4>
                  <div className="space-y-3">
                    {architectureData.modules.map((module, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <h5 className="font-medium text-slate-800 mb-1">{module.name}</h5>
                        <p className="text-sm text-slate-600">{module.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="api" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  API Documentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiEndpoints.map((endpoint, idx) => (
                    <div key={idx} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge
                          variant={
                            endpoint.method === "GET" ? "default" : endpoint.method === "POST" ? "secondary" : "outline"
                          }
                        >
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm bg-slate-100 px-2 py-1 rounded">{endpoint.endpoint}</code>
                      </div>
                      <p className="text-sm text-slate-600">{endpoint.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Project Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add a new task..."
                    onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
                  />
                  <Button onClick={handleAddTask}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {projectTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => toggleTask(task.id, e.target.checked)}
                        className="rounded"
                      />
                      <span className={`flex-1 ${task.completed ? "line-through text-slate-500" : "text-slate-800"}`}>
                        {task.title}
                      </span>
                      <span className="text-xs text-slate-500">{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  ))}
                  {projectTasks.length === 0 && (
                    <p className="text-slate-500 text-center py-8">No tasks yet. Add your first task above!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Project Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-slate-800">{milestone.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getMilestoneColor(milestone.status)}>{milestone.status}</Badge>
                          <span className="text-sm text-slate-500">{milestone.dueDate}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600">{milestone.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectReviews.map((review) => (
                    <div key={review.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline">{review.type}</Badge>
                        <span className="text-sm text-slate-500">{new Date(review.date).toLocaleDateString()}</span>
                      </div>
                      {review.entries.map((entry, idx) => (
                        <div key={idx}>
                          <p className="text-sm text-slate-700">{entry.content}</p>
                          {entry.tags && entry.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {entry.tags.map((tag, tagIdx) => (
                                <Badge key={tagIdx} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                  {projectReviews.length === 0 && (
                    <p className="text-slate-500 text-center py-8">No reviews for this project yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
