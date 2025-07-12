# 前后端架构设计

## 🏗️ 整体架构

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    LifeAgent 全栈架构                          │
├─────────────────────────────────────────────────────────────┤
│  🎨 Frontend (Next.js 14)                                  │
│  ├── App Router Pages                                      │
│  ├── React Components                                      │
│  ├── ChatAgent UI                                         │
│  ├── Real-time State Management (Zustand)                 │
│  └── Tool Visualization                                    │
├─────────────────────────────────────────────────────────────┤
│  🔗 API Layer (Next.js API Routes)                         │
│  ├── /api/chat/completion (ChatAgent 端点)                 │
│  ├── /api/tools/execute (工具执行端点)                      │
│  ├── /api/projects/* (项目 CRUD)                           │
│  ├── /api/goals/* (目标 CRUD)                              │
│  └── /api/reviews/* (反思 CRUD)                            │
├─────────────────────────────────────────────────────────────┤
│  🤖 Agent Processing Layer                                 │
│  ├── ChatAgent Core                                       │
│  ├── Tool Registry                                        │
│  ├── Intent Parser                                        │
│  └── Context Manager                                      │
├─────────────────────────────────────────────────────────────┤
│  💾 Data Layer                                            │
│  ├── PostgreSQL (生产环境)                                 │
│  ├── Prisma ORM                                           │
│  ├── Local Storage (开发环境)                              │
│  └── Data Validation & Migration                          │
├─────────────────────────────────────────────────────────────┤
│  🔌 External Integrations                                 │
│  ├── OpenAI API (LLM 增强)                                │
│  ├── Vercel AI SDK                                        │
│  └── Future: Vector Database for RAG                      │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## 🎨 Frontend 架构

### 组件层次结构

\`\`\`typescript
// 页面级组件
app/
├── layout.tsx                    # 全局布局
├── page.tsx                     # 仪表盘首页
├── projects/
│   ├── page.tsx                 # 项目列表
│   └── [id]/page.tsx           # 项目详情
├── goals/page.tsx               # 目标管理
└── reviews/page.tsx             # 反思回顾

// 功能组件
components/
├── chat-agent/
│   ├── chat-window.tsx          # 主对话窗口
│   ├── message-list.tsx         # 消息列表
│   ├── input-area.tsx           # 输入区域
│   ├── tool-call-display.tsx    # 工具调用展示
│   └── context-sidebar.tsx      # 上下文侧边栏
├── dashboard/
│   ├── overview-cards.tsx       # 概览卡片
│   ├── recent-activity.tsx      # 最近活动
│   └── quick-actions.tsx        # 快速操作
└── shared/
    ├── navigation.tsx           # 导航组件
    ├── loading-states.tsx       # 加载状态
    └── error-boundaries.tsx     # 错误边界
\`\`\`

### 状态管理架构

\`\`\`typescript
// Zustand Store 分层设计
interface LifeAgentStore {
  // 数据状态
  data: {
    projects: Project[]
    goals: Goal[]
    tasks: Task[]
    reviews: Review[]
  }
  
  // UI 状态
  ui: {
    chatAgent: {
      isOpen: boolean
      isProcessing: boolean
      currentContext: ConversationContext
    }
    navigation: {
      activeTab: string
      sidebarOpen: boolean
    }
  }
  
  // 操作方法
  actions: {
    // 数据操作
    addProject: (project: Omit<Project, 'id'>) => void
    updateProject: (id: string, updates: Partial<Project>) => void
    
    // ChatAgent 操作
    sendMessage: (message: string) => Promise<AgentResponse>
    updateChatContext: (context: ConversationContext) => void
    
    // UI 操作
    toggleChatAgent: () => void
    setActiveTab: (tab: string) => void
  }
}

// 分片状态管理
const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      projects: [],
      goals: [],
      tasks: [],
      reviews: [],
      // ... 数据操作方法
    }),
    { name: 'lifeagent-data' }
  )
)

const useUIStore = create<UIState>()((set) => ({
  chatAgent: { isOpen: false, isProcessing: false },
  navigation: { activeTab: 'dashboard', sidebarOpen: true },
  // ... UI 操作方法
}))

const useChatStore = create<ChatState>()((set, get) => ({
  messages: [],
  currentContext: {},
  // ... 聊天相关方法
}))
\`\`\`

### 实时更新机制

\`\`\`typescript
// 使用 React 18 的并发特性
import { useDeferredValue, useTransition } from 'react'

function ChatAgentWindow() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const deferredMessage = useDeferredValue(message)
  
  const handleSendMessage = async () => {
    startTransition(async () => {
      const response = await chatAgent.processMessage(deferredMessage)
      // 更新状态
    })
  }
  
  return (
    <div className={isPending ? 'opacity-50' : ''}>
      {/* ChatAgent UI */}
    </div>
  )
}

// 乐观更新策略
function useOptimisticUpdates() {
  const [optimisticState, setOptimisticState] = useState()
  
  const updateWithOptimism = async (update: any) => {
    // 立即更新 UI
    setOptimisticState(update)
    
    try {
      // 发送到服务器
      await api.update(update)
    } catch (error) {
      // 回滚更新
      setOptimisticState(null)
      throw error
    }
  }
  
  return { optimisticState, updateWithOptimism }
}
\`\`\`

## 🔗 API Layer 设计

### RESTful API 结构

\`\`\`typescript
// API 路由设计
app/api/
├── chat/
│   └── route.ts                 # POST /api/chat - ChatAgent 交互
├── tools/
│   ├── route.ts                 # POST /api/tools - 工具执行
│   └── [toolName]/route.ts      # POST /api/tools/[toolName] - 特定工具
├── projects/
│   ├── route.ts                 # GET/POST /api/projects
│   └── [id]/
│       ├── route.ts             # GET/PUT/DELETE /api/projects/[id]
│       ├── tasks/route.ts       # GET/POST /api/projects/[id]/tasks
│       └── reviews/route.ts     # GET /api/projects/[id]/reviews
├── goals/
│   ├── route.ts                 # GET/POST /api/goals
│   └── [id]/route.ts           # GET/PUT/DELETE /api/goals/[id]
├── tasks/
│   ├── route.ts                 # GET/POST /api/tasks
│   └── [id]/route.ts           # GET/PUT/DELETE /api/tasks/[id]
└── reviews/
    ├── route.ts                 # GET/POST /api/reviews
    ├── [id]/route.ts           # GET/PUT/DELETE /api/reviews/[id]
    └── analyze/route.ts         # POST /api/reviews/analyze - 模式分析
\`\`\`

### ChatAgent API 端点

\`\`\`typescript
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ChatAgent } from '@/lib/agents/chat-agent'

const chatAgent = new ChatAgent()

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()
    
    // 处理消息
    const response = await chatAgent.processMessage(message, context)
    
    return NextResponse.json({
      success: true,
      data: response
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// 流式响应支持
export async function POST(request: NextRequest) {
  const { message } = await request.json()
  
  const stream = new ReadableStream({
    async start(controller) {
      const response = await chatAgent.processMessageStream(message)
      
      for await (const chunk of response) {
        controller.enqueue(new TextEncoder().encode(
          `data: ${JSON.stringify(chunk)}\n\n`
        ))
      }
      
      controller.close()
    }
  })
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}
\`\`\`

### 工具执行 API

\`\`\`typescript
// app/api/tools/route.ts
import { ToolRegistry } from '@/lib/tools/registry'

const toolRegistry = new ToolRegistry()

export async function POST(request: NextRequest) {
  try {
    const { toolName, parameters } = await request.json()
    
    // 验证工具存在
    const tool = toolRegistry.get(toolName)
    if (!tool) {
      return NextResponse.json({
        success: false,
        error: `Tool ${toolName} not found`
      }, { status: 404 })
    }
    
    // 执行工具
    const result = await toolRegistry.execute(toolName, parameters)
    
    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// 批量工具执行
export async function POST(request: NextRequest) {
  const { toolCalls } = await request.json()
  const results = []
  
  for (const toolCall of toolCalls) {
    try {
      const result = await toolRegistry.execute(
        toolCall.tool, 
        toolCall.parameters
      )
      results.push({ success: true, result })
    } catch (error) {
      results.push({ success: false, error: error.message })
    }
  }
  
  return NextResponse.json({ results })
}
\`\`\`

## 💾 数据层架构

### 数据库设计 (PostgreSQL + Prisma)

\`\`\`prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  goals     Goal[]
  projects  Project[]
  tasks     Task[]
  reviews   Review[]
}

model Goal {
  id          String    @id @default(cuid())
  title       String
  description String?
  stage       GoalStage
  deadline    DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  projects    Project[] @relation("GoalProjects")
}

model Project {
  id          String        @id @default(cuid())
  name        String
  description String?
  status      ProjectStatus @default(ACTIVE)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  userId      String
  user        User          @relation(fields: [userId], references: [id])
  goals       Goal[]        @relation("GoalProjects")
  tasks       Task[]
  reviews     Review[]      @relation("ProjectReviews")
}

model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  completed   Boolean   @default(false)
  priority    Priority  @default(MEDIUM)
  dueDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  projectId   String?
  project     Project?  @relation(fields: [projectId], references: [id])
}

model Review {
  id        String     @id @default(cuid())
  content   String
  type      ReviewType
  tags      String[]
  mood      Int?       @default(5)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  
  userId    String
  user      User       @relation(fields: [userId], references: [id])
  projects  Project[]  @relation("ProjectReviews")
}

enum GoalStage {
  LIFE
  YEARLY
  QUARTER
}

enum ProjectStatus {
  ACTIVE
  PAUSED
  COMPLETED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

enum ReviewType {
  DAILY
  WEEKLY
  MONTHLY
}
\`\`\`

### 数据访问层

\`\`\`typescript
// lib/db/client.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// lib/db/repositories/project-repository.ts
export class ProjectRepository {
  async create(data: CreateProjectData): Promise<Project> {
    return prisma.project.create({
      data,
      include: {
        goals: true,
        tasks: true,
        reviews: true
      }
    })
  }
  
  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { id },
      include: {
        goals: true,
        tasks: true,
        reviews: true
      }
    })
  }
  
  async update(id: string, data: UpdateProjectData): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data,
      include: {
        goals: true,
        tasks: true,
        reviews: true
      }
    })
  }
  
  async delete(id: string): Promise<void> {
    await prisma.project.delete({
      where: { id }
    })
  }
  
  async findByUserId(userId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: { userId },
      include: {
        goals: true,
        tasks: true,
        reviews: true
      },
      orderBy: { updatedAt: 'desc' }
    })
  }
}
\`\`\`

### 数据同步策略

\`\`\`typescript
// lib/sync/data-sync.ts
export class DataSyncManager {
  private repositories: Map<string, any> = new Map()
  
  constructor() {
    this.repositories.set('project', new ProjectRepository())
    this.repositories.set('goal', new GoalRepository())
    this.repositories.set('task', new TaskRepository())
    this.repositories.set('review', new ReviewRepository())
  }
  
  async syncToDatabase(toolName: string, result: any): Promise<void> {
    const entityType = this.getEntityType(toolName)
    const repository = this.repositories.get(entityType)
    
    if (!repository) return
    
    switch (toolName) {
      case 'createProject':
        await repository.create(result)
        break
      case 'updateProject':
        await repository.update(result.id, result)
        break
      case 'deleteProject':
        await repository.delete(result.id)
        break
      // ... 其他工具同步逻辑
    }
  }
  
  async syncFromDatabase(userId: string): Promise<void> {
    const store = useLifeAgentStore.getState()
    
    // 同步所有数据
    const [projects, goals, tasks, reviews] = await Promise.all([
      this.repositories.get('project').findByUserId(userId),
      this.repositories.get('goal').findByUserId(userId),
      this.repositories.get('task').findByUserId(userId),
      this.repositories.get('review').findByUserId(userId)
    ])
    
    // 更新本地状态
    store.setProjects(projects)
    store.setGoals(goals)
    store.setTasks(tasks)
    store.setReviews(reviews)
  }
  
  private getEntityType(toolName: string): string {
    if (toolName.includes('Project')) return 'project'
    if (toolName.includes('Goal')) return 'goal'
    if (toolName.includes('Task')) return 'task'
    if (toolName.includes('Review')) return 'review'
    return 'unknown'
  }
}
\`\`\`

## 🔌 外部���成

### AI SDK 集成

\`\`\`typescript
// lib/ai/openai-integration.ts
import { openai } from '@ai-sdk/openai'
import { generateText, tool } from 'ai'
import { z } from 'zod'

export class AIEnhancedIntentParser {
  async parseIntentWithLLM(message: string): Promise<ParsedIntent> {
    const { text } = await generateText({
      model: openai('gpt-4'),
      prompt: `
        分析用户消息的意图，并提取相关实体。
        
        用户消息: "${message}"
        
        可能的意图类型:
        - create_project: 创建项目
        - update_project: 更新项目
        - create_task: 创建任务
        - write_review: 写反思
        - get_status: 获取状态
        
        请返回 JSON 格式的结果。
      `,
      tools: {
        analyzeIntent: tool({
          description: '分析用户意图',
          parameters: z.object({
            action: z.enum(['create_project', 'update_project', 'create_task', 'write_review', 'get_status']),
            entities: z.object({
              projectName: z.string().optional(),
              taskTitle: z.string().optional(),
              status: z.enum(['active', 'paused', 'completed']).optional(),
              content: z.string().optional()
            }),
            confidence: z.number().min(0).max(1)
          }),
          execute: async (params) => params
        })
      }
    })
    
    return JSON.parse(text)
  }
}

// Function Calling 工具定义
export const FUNCTION_CALLING_TOOLS = [
  {
    name: 'createProject',
    description: '创建新项目',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: '项目名称' },
        description: { type: 'string', description: '项目描述' },
        goalIds: { 
          type: 'array', 
          items: { type: 'string' },
          description: '关联的目标ID列表'
        }
      },
      required: ['name']
    }
  },
  {
    name: 'updateProject',
    description: '更新项目信息',
    parameters: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: '项目ID' },
        updates: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            status: { type: 'string', enum: ['active', 'paused', 'completed'] }
          }
        }
      },
      required: ['projectId', 'updates']
    }
  }
  // ... 更多工具定义
]
\`\`\`

## 🚀 部署架构

### Vercel 部署配置

\`\`\`json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/chat/route.ts": {
      "maxDuration": 30
    },
    "app/api/tools/route.ts": {
      "maxDuration": 15
    }
  },
  "env": {
    "DATABASE_URL": "@database-url",
    "OPENAI_API_KEY": "@openai-api-key",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  }
}
\`\`\`

### 环境配置

\`\`\`bash
# .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/lifeagent"
OPENAI_API_KEY="sk-..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Production
DATABASE_URL="postgresql://prod-user:prod-pass@prod-host:5432/lifeagent_prod"
REDIS_URL="redis://localhost:6379"
\`\`\`

### Docker 配置

\`\`\`dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
\`\`\`

### 监控和日志

\`\`\`typescript
// lib/monitoring/logger.ts
import { createLogger, format, transports } from 'winston'

export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'lifeagent' },
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
})

// lib/monitoring/metrics.ts
export class MetricsCollector {
  private static instance: MetricsCollector
  private metrics: Map<string, number> = new Map()
  
  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector()
    }
    return MetricsCollector.instance
  }
  
  incrementCounter(name: string): void {
    const current = this.metrics.get(name) || 0
    this.metrics.set(name, current + 1)
  }
  
  recordDuration(name: string, duration: number): void {
    this.metrics.set(`${name}_duration`, duration)
  }
  
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }
}

// 在 ChatAgent 中使用
export class ChatAgent {
  async processMessage(message: string): Promise<AgentResponse> {
    const startTime = Date.now()
    const metrics = MetricsCollector.getInstance()
    
    try {
      metrics.incrementCounter('chat_messages_processed')
      
      const result = await this.doProcessMessage(message)
      
      metrics.incrementCounter('chat_messages_success')
      return result
      
    } catch (error) {
      metrics.incrementCounter('chat_messages_error')
      logger.error('ChatAgent processing failed', { message, error })
      throw error
      
    } finally {
      const duration = Date.now() - startTime
      metrics.recordDuration('chat_processing', duration)
    }
  }
}
\`\`\`

## 🔒 安全和认证

### NextAuth.js 集成

\`\`\`typescript
// lib/auth/config.ts
import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/db/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub!
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
}

// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // 中间件逻辑
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/api/chat/:path*', '/api/tools/:path*', '/dashboard/:path*']
}
\`\`\`

## 📊 性能优化

### 缓存策略

\`\`\`typescript
// lib/cache/redis-cache.ts
import Redis from 'ioredis'

export class CacheManager {
  private redis: Redis
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!)
  }
  
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key)
    return value ? JSON.parse(value) : null
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value))
  }
  
  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }
}

// 在 API 路由中使用缓存
export async function GET(request: NextRequest) {
  const cache = new CacheManager()
  const userId = await getUserId(request)
  const cacheKey = `projects:${userId}`
  
  // 尝试从缓存获取
  let projects = await cache.get(cacheKey)
  
  if (!projects) {
    // 从数据库获取
    projects = await projectRepository.findByUserId(userId)
    
    // 缓存结果
    await cache.set(cacheKey, projects, 1800) // 30分钟
  }
  
  return NextResponse.json({ projects })
}
\`\`\`

### 数据库优化

\`\`\`sql
-- 数据库索引优化
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_reviews_user_id_created_at ON reviews(user_id, created_at);

-- 复合索引
CREATE INDEX idx_projects_user_status ON projects(user_id, status);
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);
\`\`\`

这个完整的前后端架构设计为 LifeAgent 提供了：

1. **可扩展的前端架构** - 模块化组件、状态管理、实时更新
2. **强大的 API 层** - RESTful 设计、工具执行、流式响应
3. **可靠的数据层** - PostgreSQL + Prisma、数据同步、缓存策略
4. **AI 集成能力** - OpenAI API、Function Calling、意图增强
5. **生产级部署** - Docker、Vercel、监控、安全认证

整个架构既支持当前的 MVP 功能，也为未来的扩展（如 CodingAgent、向量数据库、更复杂的 AI 功能）预留了充足的空间。
