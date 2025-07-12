import { toolRegistry } from "./registry"
import { useLifeAgentStore } from "@/lib/store"

// 创建目标工具
toolRegistry.register({
  name: "createGoal",
  description: "创建一个新的人生目标，可以是生活愿景、年度目标或季度目标",
  parameters: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "目标标题",
      },
      description: {
        type: "string",
        description: "目标详细描述",
      },
      stage: {
        type: "string",
        enum: ["life", "yearly", "quarter"],
        description: "目标阶段：life(人生愿景)、yearly(年度目标)、quarter(季度目标)",
      },
    },
    required: ["title", "stage"],
  },
  execute: async (params: {
    title: string
    description?: string
    stage: "life" | "yearly" | "quarter"
  }) => {
    const store = useLifeAgentStore.getState()

    const newGoal = {
      title: params.title,
      description: params.description || "",
      stage: params.stage,
    }

    store.addGoal(newGoal)

    return {
      success: true,
      goal: newGoal,
      message: `${params.stage === "life" ? "人生愿景" : params.stage === "yearly" ? "年度目标" : "季度目标"} "${params.title}" 创建成功！`,
    }
  },
})

// 获取目标列表工具
toolRegistry.register({
  name: "listGoals",
  description: "获取所有目标的列表",
  parameters: {
    type: "object",
    properties: {
      stage: {
        type: "string",
        enum: ["life", "yearly", "quarter"],
        description: "按阶段筛选目标",
      },
    },
  },
  execute: async (params: { stage?: "life" | "yearly" | "quarter" }) => {
    const store = useLifeAgentStore.getState()
    let goals = store.goals

    if (params.stage) {
      goals = goals.filter((g) => g.stage === params.stage)
    }

    return {
      success: true,
      goals: goals.map((g) => ({
        title: g.title,
        description: g.description,
        stage: g.stage,
        createdAt: g.createdAt,
      })),
      count: goals.length,
    }
  },
})

// 关联目标到项目工具
toolRegistry.register({
  name: "linkGoalToProject",
  description: "将目标关联到项目",
  parameters: {
    type: "object",
    properties: {
      goalTitle: {
        type: "string",
        description: "目标标题",
      },
      projectName: {
        type: "string",
        description: "项目名称",
      },
    },
    required: ["goalTitle", "projectName"],
  },
  execute: async (params: {
    goalTitle: string
    projectName: string
  }) => {
    const store = useLifeAgentStore.getState()

    const goal = store.goals.find((g) => g.title === params.goalTitle)
    const project = store.projects.find((p) => p.name === params.projectName)

    if (!goal) {
      throw new Error(`找不到名为 "${params.goalTitle}" 的目标`)
    }

    if (!project) {
      throw new Error(`找不到名为 "${params.projectName}" 的项目`)
    }

    // 更新项目的目标关联
    if (!project.goals.includes(goal.id)) {
      store.updateProject(project.id, {
        goals: [...project.goals, goal.id],
      })
    }

    return {
      success: true,
      message: `目标 "${params.goalTitle}" 已关联到项目 "${params.projectName}"`,
    }
  },
})
