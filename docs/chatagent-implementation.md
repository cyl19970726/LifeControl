# ChatAgent 实现设计 (基于LLM Tool Use)

## 🎯 核心职责

ChatAgent 是 LifeAgent 系统的大脑，负责：
1. 与LLM进行Function Calling交互
2. 工具调用的执行和结果处理
3. 上下文管理和对话状态维护
4. 错误处理和降级策略

## 🧠 架构设计

\`\`\`typescript
interface ChatAgent {
  // 核心组件
  llmClient: LLMClient
  toolRegistry: ToolRegistry
  contextManager: ContextManager
  
  // 主要方法
  processMessage(message: string): Promise<AgentResponse>
  executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]>
  updateContext(results: ToolResult[]): void
}
\`\`\`

## 🔗 LLM Integration 设计

### AI SDK 集成

\`\`\`typescript
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

export class LLMClient {
  async processWithTools(
    message: string, 
    tools: ToolDefinition[],
    context: ConversationContext
  ): Promise<LLMResponse> {
    
    const { text, toolCalls } = await generateText({
      model: openai('gpt-4'),
      messages: [
        {
          role: 'system',
          content: this.buildSystemPrompt(context)
        },
        ...context.conversationHistory,
        {
          role: 'user',
          content: message
        }
      ],
      tools: this.convertToAISDKTools(tools),
      maxToolRoundtrips: 3
    })

    return {
      text,
      toolCalls: toolCalls || []
    }
  }

  private buildSystemPrompt(context: ConversationContext): string {
    return `
你是LifeAgent智能助手，专门帮助用户管理目标、项目、任务和反思。

当前系统状态：
- 活跃项目: ${context.stats.activeProjects}个
- 待完成任务: ${context.stats.pendingTasks}个
- 总目标数: ${context.stats.totalGoals}个

你可以使用以下工具来帮助用户：
- 创建和管理项目
- 设定和跟踪目标
- 添加和完成任务
- 记录和分析反思

请根据用户的需求选择合适的工具，并提供友好、有用的回复。
    `
  }

  private convertToAISDKTools(tools: ToolDefinition[]): any[] {
    return tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    }))
  }
}
\`\`\`

## 🔧 Tool Execution Engine

\`\`\`typescript
class ToolExecutionEngine {
  constructor(
    private toolRegistry: ToolRegistry,
    private contextManager: ContextManager
  ) {}
  
  async executeToolCalls(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    const results: ToolResult[] = []
    
    for (const toolCall of toolCalls) {
      try {
        // 参数预处理
        const processedParams = await this.preprocessParameters(toolCall)
        
        // 执行工具
        const result = await this.toolRegistry.execute(
          toolCall.tool, 
          processedParams
        )
        
        results.push({
          toolCall,
          result,
          success: true,
          timestamp: new Date()
        })
        
        // 更新上下文
        this.contextManager.updateContext(toolCall, result)
        
      } catch (error) {
        results.push({
          toolCall,
          error: error.message,
          success: false,
          timestamp: new Date()
        })
      }
    }
    
    return results
  }
  
  private async preprocessParameters(toolCall: ToolCall): Promise<any> {
    const params = { ...toolCall.parameters }
    
    // 自动检测项目ID
    if (params.projectId === 'auto-detect') {
      params.projectId = await this.detectProjectId(params)
    }
    
    // 自动补全缺失参数
    if (toolCall.tool === 'createTask' && !params.projectId) {
      const activeProjects = await this.getActiveProjects()
      if (activeProjects.length === 1) {
        params.projectId = activeProjects[0].id
      }
    }
    
    return params
  }
  
  private async detectProjectId(params: any): Promise<string | undefined> {
    // 基于项目名称查找
    if (params.projectName) {
      const projects = await this.contextManager.getProjects()
      const project = projects.find(p => 
        p.name.toLowerCase().includes(params.projectName.toLowerCase())
      )
      return project?.id
    }
    
    // 基于上下文推断
    const recentProject = this.contextManager.getRecentProject()
    return recentProject?.id
  }
}
\`\`\`

## 💬 Response Generation

\`\`\`typescript
class ResponseGenerator {
  generateResponse(
    originalMessage: string,
    toolResults: ToolResult[],
    context: ConversationContext
  ): string {
    const successfulResults = toolResults.filter(r => r.success)
    const failedResults = toolResults.filter(r => !r.success)
    
    if (successfulResults.length === 0 && failedResults.length > 0) {
      return this.generateErrorResponse(failedResults)
    }
    
    if (successfulResults.length > 0) {
      return this.generateSuccessResponse(successfulResults, originalMessage)
    }
    
    return this.generateFallbackResponse(originalMessage)
  }
  
  private generateSuccessResponse(results: ToolResult[], originalMessage: string): string {
    const responses: string[] = []
    
    for (const result of results) {
      switch (result.toolCall.tool) {
        case 'createProject':
          responses.push(`✅ 已创建项目"${result.result.name}"，你可以开始添加任务了！`)
          break
          
        case 'updateProject':
          responses.push(`✅ 项目已更新。当前状态：${result.result.status}`)
          break
          
        case 'createTask':
          responses.push(`✅ 已添加任务"${result.result.title}"到你的任务列表`)
          break
          
        case 'writeReview':
          responses.push(`✅ 反思记录已保存，继续保持这种自我觉察的习惯！`)
          break
          
        default:
          responses.push(`✅ 操作已完成`)
      }
    }
    
    return responses.join('\n')
  }
  
  private generateErrorResponse(results: ToolResult[]): string {
    const errors = results.map(r => r.error).join(', ')
    return `❌ 操作失败：${errors}。请检查输入并重试。`
  }
  
  private generateFallbackResponse(originalMessage: string): string {
    return `我理解你说的是"${originalMessage}"。我可以帮你管理项目、设置目标、添加任务或记录反思。你想要做什么呢？`
  }
}
\`\`\`

## 🔄 Context Management

\`\`\`typescript
class ContextManager {
  private conversationHistory: ConversationTurn[] = []
  private recentEntities: EntityMap = {}
  private activeProject: Project | null = null
  
  updateContext(toolCall: ToolCall, result: any): void {
    // 更新实体上下文
    if (toolCall.tool === 'createProject' || toolCall.tool === 'updateProject') {
      this.activeProject = result
      this.recentEntities.projectId = result.id
      this.recentEntities.projectName = result.name
    }
    
    // 记录对话历史
    this.conversationHistory.push({
      toolCall,
      result,
      timestamp: new Date()
    })
    
    // 保持历史记录在合理范围内
    if (this.conversationHistory.length > 50) {
      this.conversationHistory = this.conversationHistory.slice(-30)
    }
  }
  
  getRecentProject(): Project | null {
    return this.activeProject
  }
  
  getRecentEntities(): EntityMap {
    return { ...this.recentEntities }
  }
  
  async getProjects(): Promise<Project[]> {
    // 从状态管理器获取项目列表
    return useLifeAgentStore.getState().projects
  }
}
\`\`\`

## 🚀 ChatAgent 主类

\`\`\`typescript
export class ChatAgent {
  private llmClient: LLMClient
  private toolRegistry: ToolRegistry
  private executionEngine: ToolExecutionEngine
  private responseGenerator: ResponseGenerator
  private contextManager: ContextManager
  
  constructor() {
    this.llmClient = new LLMClient()
    this.toolRegistry = new ToolRegistry()
    this.contextManager = new ContextManager()
    this.executionEngine = new ToolExecutionEngine(
      this.toolRegistry, 
      this.contextManager
    )
    this.responseGenerator = new ResponseGenerator()
    
    // 注册所有工具
    this.registerTools()
  }
  
  async processMessage(message: string): Promise<AgentResponse> {
    try {
      // 1. 与LLM交互，获取工具调用
      const llmResponse = await this.llmClient.processWithTools(
        message,
        this.toolRegistry.getToolDefinitions(),
        this.contextManager.getContext()
      )

      const toolCalls = llmResponse.toolCalls;
      
      // 2. 执行工具
      const toolResults = await this.executeTools(toolCalls)
      
      // 3. 更新上下文
      this.updateContext(toolResults)
      
      // 4. 生成响应
      const response = this.responseGenerator.generateResponse(
        message, 
        toolResults, 
        this.contextManager.getContext()
      )
      
      return {
        message: response,
        toolCalls,
        toolResults,
        intent: null,
        success: toolResults.some(r => r.success)
      }
      
    } catch (error) {
      return {
        message: `抱歉，处理你的请求时出现了错误：${error.message}`,
        toolCalls: [],
        toolResults: [],
        intent: null,
        success: false
      }
    }
  }

  async executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    return await this.executionEngine.executeToolCalls(toolCalls);
  }

  updateContext(toolResults: ToolResult[]): void {
    for (const result of toolResults) {
      if (result.success) {
        this.contextManager.updateContext(result.toolCall, result.result);
      }
    }
  }
  
  private registerTools(): void {
    // 注册所有模块工具
    registerProjectTools(this.toolRegistry)
    registerGoalTools(this.toolRegistry)
    registerTaskTools(this.toolRegistry)
    registerReviewTools(this.toolRegistry)
  }
}
