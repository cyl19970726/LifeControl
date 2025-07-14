import { toolRegistry } from "./registry"
import { useLifeAgentStore } from "@/lib/store"
import type { Project } from "@/lib/store"

// 创建项目工具
toolRegistry.register({
  name: "createProject",
  description: "创建一个新项目，可以关联到特定目标",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "项目名称",
      },
      description: {
        type: "string",
        description: "项目描述",
      },
      goals: {
        type: "array",
        items: { type: "string" },
        description: "关联的目标ID列表",
      },
      status: {
        type: "string",
        enum: ["active", "paused", "completed"],
        description: "项目状态，默认为active",
      },
    },
    required: ["name"],
  },
  execute: async (params: {
    name: string
    description?: string
    goals?: string[]
    status?: "active" | "paused" | "completed"
  }) => {
    const store = useLifeAgentStore.getState()

    const newProject = {
      name: params.name,
      description: params.description || "",
      status: params.status || ("active" as const),
      goals: params.goals || [],
    }

    store.addProject(newProject)

    return {
      success: true,
      project: newProject,
      message: `项目 "${params.name}" 创建成功！`,
    }
  },
})

// 更新项目工具
toolRegistry.register({
  name: "updateProject",
  description: "更新现有项目的信息或状态",
  parameters: {
    type: "object",
    properties: {
      projectName: {
        type: "string",
        description: "要更新的项目名称",
      },
      name: {
        type: "string",
        description: "新的项目名称",
      },
      description: {
        type: "string",
        description: "新的项目描述",
      },
      status: {
        type: "string",
        enum: ["active", "paused", "completed"],
        description: "新的项目状态",
      },
    },
    required: ["projectName"],
  },
  execute: async (params: {
    projectName: string
    name?: string
    description?: string
    status?: "active" | "paused" | "completed"
  }) => {
    const store = useLifeAgentStore.getState()
    const project = store.projects.find((p) => p.name === params.projectName)

    if (!project) {
      throw new Error(`找不到名为 "${params.projectName}" 的项目`)
    }

    const updates: Partial<Project> = {}
    if (params.name) updates.name = params.name
    if (params.description) updates.description = params.description
    if (params.status) updates.status = params.status

    store.updateProject(project.id, updates)

    return {
      success: true,
      message: `项目 "${params.projectName}" 更新成功！`,
    }
  },
})

// 获取项目列表工具
toolRegistry.register({
  name: "listProjects",
  description: "获取所有项目的列表",
  parameters: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["active", "paused", "completed"],
        description: "按状态筛选项目",
      },
    },
  },
  execute: async (params: { status?: "active" | "paused" | "completed" }) => {
    const store = useLifeAgentStore.getState()
    let projects = store.projects

    if (params.status) {
      projects = projects.filter((p) => p.status === params.status)
    }

    return {
      success: true,
      projects: projects.map((p) => ({
        name: p.name,
        description: p.description,
        status: p.status,
        createdAt: p.createdAt,
      })),
      count: projects.length,
    }
  },
})
