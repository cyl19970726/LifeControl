import { toolRegistry } from "./registry"
import { useLifeAgentStore } from "@/lib/store"

// 写反思工具
toolRegistry.register({
  name: "writeReview",
  description: "记录反思和总结，可以是日常反思、周总结或月总结",
  parameters: {
    type: "object",
    properties: {
      content: {
        type: "string",
        description: "反思内容",
      },
      type: {
        type: "string",
        enum: ["daily", "weekly", "monthly"],
        description: "反思类型：daily(日常)、weekly(周总结)、monthly(月总结)",
      },
      tags: {
        type: "array",
        items: { type: "string" },
        description: "标签列表，如：['进展', '挑战', '学习']",
      },
      projectNames: {
        type: "array",
        items: { type: "string" },
        description: "相关项目名称列表",
      },
    },
    required: ["content", "type"],
  },
  execute: async (params: {
    content: string
    type: "daily" | "weekly" | "monthly"
    tags?: string[]
    projectNames?: string[]
  }) => {
    const store = useLifeAgentStore.getState()

    // 查找相关项目ID
    const linkedProjectIds: string[] = []
    if (params.projectNames) {
      for (const projectName of params.projectNames) {
        const project = store.projects.find((p) => p.name === projectName)
        if (project) {
          linkedProjectIds.push(project.id)
        }
      }
    }

    const newReview = {
      type: params.type,
      entries: [
        {
          content: params.content,
          tags: params.tags || [],
          linkedProjectIds: linkedProjectIds.length > 0 ? linkedProjectIds : undefined,
        },
      ],
    }

    store.addReview(newReview)

    return {
      success: true,
      review: newReview,
      message: `${params.type === "daily" ? "日常反思" : params.type === "weekly" ? "周总结" : "月总结"}记录成功！`,
    }
  },
})

// 获取反思列表工具
toolRegistry.register({
  name: "listReviews",
  description: "获取反思记录列表",
  parameters: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["daily", "weekly", "monthly"],
        description: "按类型筛选反思",
      },
      limit: {
        type: "number",
        description: "返回的记录数量限制",
      },
    },
  },
  execute: async (params: { type?: "daily" | "weekly" | "monthly"; limit?: number }) => {
    const store = useLifeAgentStore.getState()
    let reviews = store.reviews

    if (params.type) {
      reviews = reviews.filter((r) => r.type === params.type)
    }

    // 按日期倒序排列
    reviews = reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (params.limit) {
      reviews = reviews.slice(0, params.limit)
    }

    return {
      success: true,
      reviews: reviews.map((r) => ({
        type: r.type,
        date: r.date,
        entries: r.entries.map((e) => ({
          content: e.content,
          tags: e.tags,
        })),
      })),
      count: reviews.length,
    }
  },
})
