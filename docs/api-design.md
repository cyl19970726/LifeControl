# API 设计规范

## 🎯 设计原则

1. **RESTful 设计** - 遵循 REST 架构风格
2. **一致性** - 统一的请求/响应格式
3. **类型安全** - 完整的 TypeScript 类型定义
4. **错误处理** - 标准化的错误响应
5. **性能优化** - 支持分页、缓存、预加载

## 📋 API 路由结构

### 项目相关 API

\`\`\`
GET    /api/projects              # 获取项目列表
POST   /api/projects              # 创建新项目
GET    /api/projects/[id]         # 获取项目详情
PUT    /api/projects/[id]         # 更新项目
DELETE /api/projects/[id]         # 删除项目
GET    /api/projects/[id]/stats   # 获取项目统计
\`\`\`

### 目标相关 API

\`\`\`
GET    /api/goals                 # 获取目标列表
POST   /api/goals                 # 创建新目标
GET    /api/goals/[id]            # 获取目标详情
PUT    /api/goals/[id]            # 更新目标
DELETE /api/goals/[id]            # 删除目标
POST   /api/goals/[id]/link       # 关联目标到项目
\`\`\`

### 任务相关 API

\`\`\`
GET    /api/tasks                 # 获取任务列表
POST   /api/tasks                 # 创建新任务
GET    /api/tasks/[id]            # 获取任务详情
PUT    /api/tasks/[id]            # 更新任务
DELETE /api/tasks/[id]            # 删除任务
PATCH  /api/tasks/[id]/complete   # 完成任务
\`\`\`

### 反思相关 API

\`\`\`
GET    /api/reviews               # 获取反思列表
POST   /api/reviews               # 创建新反思
GET    /api/reviews/[id]          # 获取反思详情
PUT    /api/reviews/[id]          # 更新反思
DELETE /api/reviews/[id]          # 删除反思
POST   /api/reviews/analyze       # 分析反思模式
\`\`\`

### ChatAgent API

\`\`\`
POST   /api/chat                  # ChatAgent 对话
POST   /api/tools/execute         # 执行工具调用
GET    /api/tools                 # 获取可用工具列表
\`\`\`

## 📝 请求/响应格式

### 标准响应格式

\`\`\`typescript
interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasMore?: boolean
  }
}
\`\`\`

### 成功响应示例

\`\`\`json
{
  "success": true,
  "data": {
    "id": "clp123456",
    "name": "学习AI项目",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "message": "项目创建成功"
}
\`\`\`

### 错误响应示例

\`\`\`json
{
  "success": false,
  "error": "项目名称不能为空",
  "code": "VALIDATION_ERROR"
}
\`\`\`

### 分页响应示例

\`\`\`json
{
  "success": true,
  "data": [...],  "项目名称不能为空",
  "code": "VALIDATION_ERROR"
}
\`\`\`

### 分页响应示例

\`\`\`json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}
\`\`\`

## 🔍 查询参数

### 通用查询参数

\`\`\`typescript
interface CommonQueryParams {
  page?: number        // 页码，从 1 开始
  limit?: number       // 每页数量，默认 20
  sort?: string        // 排序字段
  order?: 'asc' | 'desc'  // 排序方向
  search?: string      // 搜索关键词
}
\`\`\`

### 项目查询参数

\`\`\`typescript
interface ProjectQueryParams extends CommonQueryParams {
  status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
  goalId?: string      // 按关联目标筛选
  startDate?: string   // 开始日期范围
  endDate?: string     // 结束日期范围
}
\`\`\`

### 任务查询参数

\`\`\`typescript
interface TaskQueryParams extends CommonQueryParams {
  completed?: boolean  // 完成状态
  projectId?: string   // 按项目筛选
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: string     // 截止日期
}
\`\`\`

## 🛠️ API 实现示例

### 项目列表 API

\`\`\`typescript
// app/api/projects/route.ts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = await getUserId(request) // 从认证中获取
    
    const params = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      status: searchParams.get('status'),
      search: searchParams.get('search')
    }
    
    // 构建查询条件
    const where: any = { userId }
    if (params.status) where.status = params.status
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } }
      ]
    }
    
    // 执行查询
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          goals: { select: { id: true, title: true } },
          _count: { select: { tasks: true, reviews: true } }
        },
        orderBy: { updatedAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit
      }),
      prisma.project.count({ where })
    ])
    
    return NextResponse.json({
      success: true,
      data: projects,
      meta: {
        total,
        page: params.page,
        limit: params.limit,
        hasMore: params.page * params.limit < total
      }
    })
  } catch (error) {
    return handleAPIError(error)
  }
}
\`\`\`

### 错误处理中间件

\`\`\`typescript
// lib/api/error-handler.ts
export function handleAPIError(error: any) {
  console.error('API Error:', error)
  
  if (error.code === 'P2002') {
    return NextResponse.json({
      success: false,
      error: '数据已存在，请检查唯一性约束',
      code: 'DUPLICATE_ERROR'
    }, { status: 409 })
  }
  
  if (error.code === 'P2025') {
    return NextResponse.json({
      success: false,
      error: '记录不存在',
      code: 'NOT_FOUND'
    }, { status: 404 })
  }
  
  return NextResponse.json({
    success: false,
    error: '服务器内部错误',
    code: 'INTERNAL_ERROR'
  }, { status: 500 })
}
\`\`\`

## 🔐 认证和授权

### JWT Token 验证

\`\`\`typescript
// lib/api/auth.ts
export async function getUserId(request: NextRequest): Promise<string> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  
  if (!token) {
    throw new Error('未提供认证令牌')
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!)
    return payload.userId
  } catch (error) {
    throw new Error('无效的认证令牌')
  }
}

// 认证中间件
export function withAuth(handler: Function) {
  return async (request: NextRequest, context: any) => {
    try {
      const userId = await getUserId(request)
      context.userId = userId
      return handler(request, context)
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: 'UNAUTHORIZED'
      }, { status: 401 })
    }
  }
}
\`\`\`

## 📊 API 性能优化

### 缓存策略

\`\`\`typescript
// lib/api/cache.ts
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // 尝试从缓存获取
  const cached = await redis.get(key)
  if (cached) {
    return JSON.parse(cached)
  }
  
  // 执行查询
  const result = await fetcher()
  
  // 存入缓存
  await redis.setex(key, ttl, JSON.stringify(result))
  
  return result
}

// 使用示例
export async function GET(request: NextRequest) {
  const userId = await getUserId(request)
  
  const projects = await withCache(
    `projects:${userId}`,
    () => projectRepository.findByUserId(userId),
    1800 // 30分钟缓存
  )
  
  return NextResponse.json({ success: true, data: projects })
}
\`\`\`

### 批量操作

\`\`\`typescript
// 批量创建任务
export async function POST(request: NextRequest) {
  const { tasks } = await request.json()
  const userId = await getUserId(request)
  
  // 使用事务确保数据一致性
  const result = await prisma.$transaction(
    tasks.map((task: any) => 
      prisma.task.create({
        data: { ...task, userId }
      })
    )
  )
  
  return NextResponse.json({
    success: true,
    data: result,
    message: `成功创建 ${result.length} 个任务`
  })
}
\`\`\`

## 🧪 API 测试

### 单元测试示例

\`\`\`typescript
// __tests__/api/projects.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/projects/route'

describe('/api/projects', () => {
  it('should create a project', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: '测试项目',
        description: '这是一个测试项目'
      },
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    })
    
    await handler(req, res)
    
    expect(res._getStatusCode()).toBe(201)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.data.name).toBe('测试项目')
  })
  
  it('should return 401 without auth', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { name: '测试项目' }
    })
    
    await handler(req, res)
    
    expect(res._getStatusCode()).toBe(401)
  })
})
\`\`\`

## 📚 API 文档生成

### OpenAPI 规范

\`\`\`yaml
# docs/api-spec.yaml
openapi: 3.0.0
info:
  title: LifeAgent API
  version: 1.0.0
  description: LifeAgent 认知协作平台 API

paths:
  /api/projects:
    get:
      summary: 获取项目列表
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: status
          in: query
          schema:
            type: string
            enum: [ACTIVE, PAUSED, COMPLETED, ARCHIVED]
      responses:
        200:
          description: 成功返回项目列表
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Project'
                  meta:
                    $ref: '#/components/schemas/PaginationMeta'

components:
  schemas:
    Project:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        description:
          type: string
        status:
          type: string
          enum: [ACTIVE, PAUSED, COMPLETED, ARCHIVED]
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
\`\`\`

这个 API 设计为 LifeAgent 提供了：

1. **标准化接口** - 统一的请求/响应格式
2. **完整的 CRUD 操作** - 支持所有数据操作
3. **性能优化** - 缓存、分页、批量操作
4. **安全保障** - 认证、授权、数据验证
5. **可测试性** - 完整的测试覆盖
6. **文档化** - OpenAPI 规范和自动生成文档
