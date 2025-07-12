# Tool Interface 设计规范

## 🎯 设计目标

创建统一、类型安全、可扩展的工具接口系统，支持ChatAgent对所有模块的标准化调用。

## 🧩 Tool Interface 标准

### 基础接口定义

\`\`\`typescript
interface ToolDefinition<TParams = any, TResult = any> {
  name: string                    // 工具名称
  description: string             // 工具描述
  category: ToolCategory          // 工具分类
  parameters: JSONSchema          // 参数Schema
  execute: (params: TParams) => Promise<TResult> | TResult
  validation?: (params: TParams) => ValidationResult
  permissions?: string[]          // 权限要求
  examples?: ToolExample[]        // 使用示例
}

type ToolCategory = 'project' | 'goal' | 'task' | 'review' | 'system'

interface ToolExample {
  description: string
  input: any
  output: any
}
\`\`\`

## 📋 模块工具集定义

### 1. Project Tools

\`\`\`typescript
// 创建项目
interface CreateProjectTool extends ToolDefinition {
  name: 'createProject'
  description: '创建新项目'
  parameters: {
    type: 'object'
    properties: {
      name: { type: 'string', minLength: 1 }
      description?: { type: 'string' }
      goalIds?: { type: 'array', items: { type: 'string' } }
      status?: { type: 'string', enum: ['active', 'paused', 'completed'] }
    }
    required: ['name']
  }
  execute: (params: CreateProjectParams) => Promise<Project>
}

// 更新项目
interface UpdateProjectTool extends ToolDefinition {
  name: 'updateProject'
  description: '更新项目信息'
  parameters: {
    type: 'object'
    properties: {
      projectId: { type: 'string' }
      updates: {
        type: 'object'
        properties: {
          name?: { type: 'string' }
          description?: { type: 'string' }
          status?: { type: 'string', enum: ['active', 'paused', 'completed'] }
          goalIds?: { type: 'array', items: { type: 'string' } }
        }
      }
    }
    required: ['projectId', 'updates']
  }
  execute: (params: UpdateProjectParams) => Promise<Project>
}

// 删除项目
interface DeleteProjectTool extends ToolDefinition {
  name: 'deleteProject'
  description: '删除项目'
  parameters: {
    type: 'object'
    properties: {
      projectId: { type: 'string' }
      cascade?: { type: 'boolean' } // 是否级联删除相关任务
    }
    required: ['projectId']
  }
  execute: (params: DeleteProjectParams) => Promise<void>
}

// 获取项目详情
interface GetProjectTool extends ToolDefinition {
  name: 'getProject'
  description: '获取项目详细信息'
  parameters: {
    type: 'object'
    properties: {
      projectId: { type: 'string' }
      includeStats?: { type: 'boolean' }
    }
    required: ['projectId']
  }
  execute: (params: GetProjectParams) => Promise<ProjectWithStats>
}
\`\`\`

### 2. Goal Tools

\`\`\`typescript
// 创建目标
interface CreateGoalTool extends ToolDefinition {
  name: 'createGoal'
  description: '创建新目标'
  parameters: {
    type: 'object'
    properties: {
      title: { type: 'string', minLength: 1 }
      description?: { type: 'string' }
      stage: { type: 'string', enum: ['life', 'yearly', 'quarter'] }
      deadline?: { type: 'string', format: 'date' }
    }
    required: ['title', 'stage']
  }
  execute: (params: CreateGoalParams) => Promise<Goal>
}

// 链接目标到项目
interface LinkGoalToProjectTool extends ToolDefinition {
  name: 'linkGoalToProject'
  description: '将目标关联到项目'
  parameters: {
    type: 'object'
    properties: {
      goalId: { type: 'string' }
      projectId: { type: 'string' }
    }
    required: ['goalId', 'projectId']
  }
  execute: (params: LinkGoalParams) => Promise<void>
}
\`\`\`

### 3. Task Tools

\`\`\`typescript
// 创建任务
interface CreateTaskTool extends ToolDefinition {
  name: 'createTask'
  description: '创建新任务'
  parameters: {
    type: 'object'
    properties: {
      title: { type: 'string', minLength: 1 }
      description?: { type: 'string' }
      projectId?: { type: 'string' }
      dueDate?: { type: 'string', format: 'date-time' }
      priority?: { type: 'string', enum: ['low', 'medium', 'high'] }
    }
    required: ['title']
  }
  execute: (params: CreateTaskParams) => Promise<Task>
}

// 完成任务
interface CompleteTaskTool extends ToolDefinition {
  name: 'completeTask'
  description: '标记任务为完成'
  parameters: {
    type: 'object'
    properties: {
      taskId: { type: 'string' }
      completionNote?: { type: 'string' }
    }
    required: ['taskId']
  }
  execute: (params: CompleteTaskParams) => Promise<Task>
}
\`\`\`

### 4. Review Tools

\`\`\`typescript
// 写反思
interface WriteReviewTool extends ToolDefinition {
  name: 'writeReview'
  description: '创建反思记录'
  parameters: {
    type: 'object'
    properties: {
      content: { type: 'string', minLength: 1 }
      type: { type: 'string', enum: ['daily', 'weekly', 'monthly'] }
      tags?: { type: 'array', items: { type: 'string' } }
      linkedProjectIds?: { type: 'array', items: { type: 'string' } }
      mood?: { type: 'number', minimum: 1, maximum: 10 }
    }
    required: ['content', 'type']
  }
  execute: (params: WriteReviewParams) => Promise<Review>
}

// 分析模式
interface AnalyzePatternsTool extends ToolDefinition {
  name: 'analyzePatterns'
  description: '分析反思中的认知模式'
  parameters: {
    type: 'object'
    properties: {
      timeRange: { type: 'string', enum: ['week', 'month', 'quarter'] }
      categories?: { type: 'array', items: { type: 'string' } }
    }
    required: ['timeRange']
  }
  execute: (params: AnalyzePatternsParams) => Promise<PatternAnalysis>
}
\`\`\`

## 🔧 Tool Registry 实现

\`\`\`typescript
class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map()
  private categories: Map<ToolCategory, string[]> = new Map()

  register<T extends ToolDefinition>(tool: T): void {
    this.tools.set(tool.name, tool)
    
    if (!this.categories.has(tool.category)) {
      this.categories.set(tool.category, [])
    }
    this.categories.get(tool.category)!.push(tool.name)
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name)
  }

  getByCategory(category: ToolCategory): ToolDefinition[] {
    const toolNames = this.categories.get(category) || []
    return toolNames.map(name => this.tools.get(name)!).filter(Boolean)
  }

  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values())
  }

  async execute<TParams, TResult>(
    toolName: string, 
    params: TParams
  ): Promise<TResult> {
    const tool = this.tools.get(toolName)
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`)
    }

    // 参数验证
    if (tool.validation) {
      const validation = tool.validation(params)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }
    }

    // 执行工具
    return await tool.execute(params)
  }
}
\`\`\`

## 📝 使用示例

\`\`\`typescript
// 注册工具
const registry = new ToolRegistry()
registry.register(createProjectTool)
registry.register(updateProjectTool)
registry.register(writeReviewTool)

// ChatAgent 调用
const result = await registry.execute('createProject', {
  name: 'AI学习计划',
  description: '系统学习人工智能相关技术',
  goalIds: ['goal-1']
})

// 批量操作
const operations = [
  { tool: 'createProject', params: { name: '项目A' } },
  { tool: 'createTask', params: { title: '任务1', projectId: 'project-1' } },
  { tool: 'writeReview', params: { content: '今天进展顺利', type: 'daily' } }
]

for (const op of operations) {
  await registry.execute(op.tool, op.params)
}
