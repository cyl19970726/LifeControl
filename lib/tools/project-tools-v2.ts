import { toolRegistry } from "./registry"
import { projectRepository } from "@/lib/db/repositories"

// 创建项目工具 - 数据库版本
toolRegistry.register({
  name: "createProject",
  description: "创建一个新项目，数据将保存到数据库",
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
      status: {
        type: "string",
        enum: ["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"],
        description: "项目状态，默认为ACTIVE",
      },
      startDate: {
        type: "string",
        description: "开始日期 (YYYY-MM-DD 格式)",
      },
      endDate: {
        type: "string",
        description: "结束日期 (YYYY-MM-DD 格式)",
      },
    },
    required: ["name"],
  },
  execute: async (params: {
    name: string
    description?: string
    status?: "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED"
    startDate?: string
    endDate?: string
  }) => {
    try {
      const userId = "temp-user-id" // TODO: 从认证中获取真实用户ID

      const project = await projectRepository.create({
        name: params.name,
        description: params.description,
        status: params.status || "ACTIVE",
        startDate: params.startDate ? new Date(params.startDate) : null,
        endDate: params.endDate ? new Date(params.endDate) : null,
        user: { connect: { id: userId } },
      })

      return {
        success: true,
        project,
        message: `项目 "${params.name}" 创建成功并已保存到数据库！`,
      }
    } catch (error) {
      throw new Error(`创建项目失败: ${error.message}`)
    }
  },
})

// 更新项目工具 - 数据库版本
toolRegistry.register({
  name: "updateProject",
  description: "更新现有项目的信息，更改将保存到数据库",
  parameters: {
    type: "object",
    properties: {
      projectId: {
        type: "string",
        description: "项目ID",
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
        enum: ["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"],
        description: "新的项目状态",
      },
    },
    required: ["projectId"],
  },
  execute: async (params: {
    projectId: string
    name?: string
    description?: string
    status?: "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED"
  }) => {
    try {
      const updateData: any = {}
      if (params.name) updateData.name = params.name
      if (params.description !== undefined) updateData.description = params.description
      if (params.status) updateData.status = params.status

      const project = await projectRepository.update(params.projectId, updateData)

      return {
        success: true,
        project,
        message: `项目更新成功并已保存到数据库！`,
      }
    } catch (error) {
      throw new Error(`更新项目失败: ${error.message}`)
    }
  },
})

// 获取项目详情工具
toolRegistry.register({
  name: "getProjectDetails",
  description: "获取项目的详细信息，包括关联的目标、任务和统计数据",
  parameters: {
    type: "object",
    properties: {
      projectId: {
        type: "string",
        description: "项目ID",
      },
    },
    required: ["projectId"],
  },
  execute: async (params: { projectId: string }) => {
    try {
      const project = await projectRepository.findById(params.projectId)

      if (!project) {
        throw new Error("项目不存在")
      }

      const stats = await projectRepository.getProjectStats(params.projectId)

      return {
        success: true,
        project,
        stats,
        summary: `项目 "${project.name}" 当前状态：${project.status}，进度：${stats.progressPercentage}%`,
      }
    } catch (error) {
      throw new Error(`获取项目详情失败: ${error.message}`)
    }
  },
})

// 获取项目列表工具
toolRegistry.register({
  name: "listProjects",
  description: "获取所有项目的列表，可按状态筛选",
  parameters: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"],
        description: "按状态筛选项目",
      },
    },
  },
  execute: async (params: { status?: "ACTIVE" | "PAUSED" | "COMPLETED" | "ARCHIVED" }) => {
    try {
      const userId = "temp-user-id" // TODO: 从认证中获取真实用户ID

      let projects
      if (params.status) {
        projects = await projectRepository.findByStatus(userId, params.status)
      } else {
        projects = await projectRepository.findByUserId(userId)
      }

      return {
        success: true,
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          status: p.status,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
        count: projects.length,
        summary: `找到 ${projects.length} 个项目${params.status ? `（状态：${params.status}）` : ""}`,
      }
    } catch (error) {
      throw new Error(`获取项目列表失败: ${error.message}`)
    }
  },
})
