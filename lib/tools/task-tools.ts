import { toolRegistry } from "./registry"
import { useLifeAgentStore } from "@/lib/store"

// 创建任务工具
toolRegistry.register({
  name: "createTask",
  description: "创建一个新任务，可以关联到特定项目",
  parameters: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "任务标题",
      },
      description: {
        type: "string",
        description: "任务描述",
      },
      projectName: {
        type: "string",
        description: "关联的项目名称",
      },
      dueDate: {
        type: "string",
        description: "截止日期 (YYYY-MM-DD 格式)",
      },
    },
    required: ["title"],
  },
  execute: async (params: {
    title: string
    description?: string
    projectName?: string
    dueDate?: string
  }) => {
    const store = useLifeAgentStore.getState()

    let projectId: string | undefined

    if (params.projectName) {
      const project = store.projects.find((p) => p.name === params.projectName)
      if (!project) {
        throw new Error(`找不到名为 "${params.projectName}" 的项目`)
      }
      projectId = project.id
    }

    const newTask = {
      title: params.title,
      description: params.description || "",
      projectId,
      completed: false,
      dueDate: params.dueDate ? new Date(params.dueDate).toISOString() : new Date().toISOString(),
    }

    store.addTask(newTask)

    return {
      success: true,
      task: newTask,
      message: `任务 "${params.title}" 创建成功！${params.projectName ? ` 已关联到项目 "${params.projectName}"` : ""}`,
    }
  },
})

// 完成任务工具
toolRegistry.register({
  name: "completeTask",
  description: "标记任务为已完成",
  parameters: {
    type: "object",
    properties: {
      taskTitle: {
        type: "string",
        description: "要完成的任务标题",
      },
    },
    required: ["taskTitle"],
  },
  execute: async (params: { taskTitle: string }) => {
    const store = useLifeAgentStore.getState()
    const task = store.tasks.find((t) => t.title === params.taskTitle)

    if (!task) {
      throw new Error(`找不到名为 "${params.taskTitle}" 的任务`)
    }

    store.updateTask(task.id, { completed: true })

    return {
      success: true,
      message: `任务 "${params.taskTitle}" 已标记为完成！`,
    }
  },
})

// 获取任务列表工具
toolRegistry.register({
  name: "listTasks",
  description: "获取任务列表",
  parameters: {
    type: "object",
    properties: {
      completed: {
        type: "boolean",
        description: "筛选已完成或未完成的任务",
      },
      projectName: {
        type: "string",
        description: "按项目名称筛选任务",
      },
    },
  },
  execute: async (params: { completed?: boolean; projectName?: string }) => {
    const store = useLifeAgentStore.getState()
    let tasks = store.tasks

    if (typeof params.completed === "boolean") {
      tasks = tasks.filter((t) => t.completed === params.completed)
    }

    if (params.projectName) {
      const project = store.projects.find((p) => p.name === params.projectName)
      if (project) {
        tasks = tasks.filter((t) => t.projectId === project.id)
      }
    }

    return {
      success: true,
      tasks: tasks.map((t) => ({
        title: t.title,
        description: t.description,
        completed: t.completed,
        dueDate: t.dueDate,
        projectName: t.projectId ? store.projects.find((p) => p.id === t.projectId)?.name : undefined,
      })),
      count: tasks.length,
    }
  },
})
