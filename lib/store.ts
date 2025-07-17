import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Goal {
  id: string
  title: string
  description: string
  stage: "life" | "yearly" | "quarter"
  projects: string[]
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: "active" | "paused" | "completed"
  goals: string[]
  createdAt: string
  customFields?: Record<string, any>
}

export interface Task {
  id: string
  title: string
  description: string
  projectId?: string
  completed: boolean
  dueDate: string
  createdAt: string
}

export interface ReviewEntry {
  content: string
  tags: string[]
  linkedProjectIds?: string[]
}

export interface Review {
  id: string
  date: string
  type: "daily" | "weekly" | "monthly"
  entries: ReviewEntry[]
}

interface LifeAgentState {
  goals: Goal[]
  projects: Project[]
  tasks: Task[]
  reviews: Review[]

  // Actions
  addGoal: (goal: Omit<Goal, "id" | "createdAt" | "projects">) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  deleteGoal: (id: string) => void

  addProject: (project: Omit<Project, "id" | "createdAt">) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void

  addTask: (task: Omit<Task, "id" | "createdAt">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void

  addReview: (review: Omit<Review, "id" | "date">) => void
  updateReview: (id: string, updates: Partial<Review>) => void
  deleteReview: (id: string) => void
}

export const useLifeAgentStore = create<LifeAgentState>()(
  persist(
    (set, get) => ({
      goals: [
        {
          id: "1",
          title: "Build a Successful AI Product",
          description: "Create and launch an AI-powered productivity tool",
          stage: "yearly",
          projects: ["1"],
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Improve Personal Productivity",
          description: "Develop better habits and systems for managing time and energy",
          stage: "quarter",
          projects: ["2"],
          createdAt: new Date().toISOString(),
        },
      ],
      projects: [
        {
          id: "1",
          name: "LifeAgent Development",
          description: "Building a cognitive collaboration platform for goal and project management",
          status: "active",
          goals: ["1"],
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Morning Routine Optimization",
          description: "Establishing a consistent and energizing morning routine",
          status: "active",
          goals: ["2"],
          createdAt: new Date().toISOString(),
        },
      ],
      tasks: [
        {
          id: "1",
          title: "Design system architecture",
          description: "Create the overall system design for LifeAgent",
          projectId: "1",
          completed: true,
          dueDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Implement ChatAgent functionality",
          description: "Build the core AI assistant features",
          projectId: "1",
          completed: false,
          dueDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: "3",
          title: "Practice meditation",
          description: "10 minutes of mindfulness meditation",
          projectId: "2",
          completed: false,
          dueDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],
      reviews: [
        {
          id: "1",
          date: new Date().toISOString(),
          type: "daily",
          entries: [
            {
              content: "Made good progress on the LifeAgent project today. The architecture is coming together nicely.",
              tags: ["progress", "development"],
              linkedProjectIds: ["1"],
            },
          ],
        },
      ],

      // Goal actions
      addGoal: (goalData) => {
        const newGoal: Goal = {
          ...goalData,
          id: Date.now().toString(),
          projects: [],
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ goals: [...state.goals, newGoal] }))
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal)),
        }))
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        }))
      },

      // Project actions
      addProject: (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ projects: [...state.projects, newProject] }))
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) => (project.id === id ? { ...project, ...updates } : project)),
        }))
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        }))
      },

      // Task actions
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ tasks: [...state.tasks, newTask] }))
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
        }))
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }))
      },

      // Review actions
      addReview: (reviewData) => {
        const newReview: Review = {
          ...reviewData,
          id: Date.now().toString(),
          date: new Date().toISOString(),
        }
        set((state) => ({ reviews: [...state.reviews, newReview] }))
      },

      updateReview: (id, updates) => {
        set((state) => ({
          reviews: state.reviews.map((review) => (review.id === id ? { ...review, ...updates } : review)),
        }))
      },

      deleteReview: (id) => {
        set((state) => ({
          reviews: state.reviews.filter((review) => review.id !== id),
        }))
      },
    }),
    {
      name: "lifeagent-storage",
    },
  ),
)
