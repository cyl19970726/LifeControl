// lib/agents/chat-agent-mock.ts
export interface AgentResponse {
  message: string
  toolResults: Array<{
    toolCall: { name: string; arguments: any }
    result?: any
    success: boolean
    timestamp: Date
  }>
  success: boolean
}

export class MockChatAgent {
  private responses = [
    "我已经帮你创建了项目'学习AI'！你可以开始添加相关任务了。",
    "好的，我已经为你添加了任务'阅读深度学习教材'到项目中。",
    "项目状态已更新为'进行中'，继续加油！",
    "我帮你记录了今天的反思，保持这种自我觉察很棒！",
    "已经为你创建了年度目标'成为AI专家'，这是一个很好的目标！",
    "我找到了3个活跃项目，2个待完成任务。需要我帮你做什么吗？",
  ]

  private mockTools = [
    { name: "createProject", success: true },
    { name: "addTask", success: true },
    { name: "updateProject", success: true },
    { name: "writeReview", success: true },
    { name: "createGoal", success: true },
    { name: "listProjects", success: true },
  ]

  async processMessage(message: string): Promise<AgentResponse> {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    // 随机选择响应
    const randomResponse = this.responses[Math.floor(Math.random() * this.responses.length)]

    // 随机选择工具调用
    const randomTool = this.mockTools[Math.floor(Math.random() * this.mockTools.length)]

    return {
      message: randomResponse,
      toolResults: [
        {
          toolCall: {
            name: randomTool.name,
            arguments: { message },
          },
          result: { success: true, message: "模拟执行成功" },
          success: randomTool.success,
          timestamp: new Date(),
        },
      ],
      success: true,
    }
  }
}

// 创建模拟实例
export const mockChatAgent = new MockChatAgent()
