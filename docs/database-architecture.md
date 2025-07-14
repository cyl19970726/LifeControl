# 数据库架构设计

## 🗄️ 数据库选择

我们使用 **PostgreSQL** 作为主数据库，配合 **Prisma ORM** 进行数据访问。

### 为什么选择 PostgreSQL？

1. **强大的关系型特性** - 支持复杂的关联查询
2. **JSON 支持** - 原生支持 JSON 字段（如 tags 数组）
3. **全文搜索** - 内置全文搜索功能
4. **扩展性** - 支持各种扩展和索引类型
5. **成熟稳定** - 生产环境验证的可靠性

## 📊 数据模型设计

### 核心实体关系

\`\`\`
User (用户)
├── Goals (目标) 
│   └── Projects (项目) [多对多]
├── Projects (项目)
│   ├── Tasks (任务) [一对多]
│   └── Reviews (反思) [多对多]
├── Tasks (任务)
└── Reviews (反思)
\`\`\`

### 详细字段说明

#### User (用户表)
- `id`: 主键，使用 cuid
- `email`: 邮箱，唯一索引
- `name`: 用户名
- `createdAt/updatedAt`: 时间戳

#### Goal (目标表)
- `id`: 主键
- `title`: 目标标题
- `description`: 详细描述
- `stage`: 目标阶段 (LIFE/YEARLY/QUARTER)
- `status`: 目标状态 (ACTIVE/PAUSED/COMPLETED/ARCHIVED)
- `deadline`: 截止日期（可选）
- `userId`: 外键关联用户

#### Project (项目表)
- `id`: 主键
- `name`: 项目名称
- `description`: 项目描述
- `status`: 项目状态 (ACTIVE/PAUSED/COMPLETED/ARCHIVED)
- `startDate/endDate`: 开始和结束日期（可选）
- `userId`: 外键关联用户

#### Task (任务表)
- `id`: 主键
- `title`: 任务标题
- `description`: 任务描述
- `completed`: 完成状态
- `priority`: 优先级 (LOW/MEDIUM/HIGH/URGENT)
- `dueDate`: 截止日期（可选）
- `completedAt`: 完成时间（可选）
- `userId`: 外键关联用户
- `projectId`: 外键关联项目（可选）

#### Review (反思表)
- `id`: 主键
- `content`: 反思内容
- `type`: 反思类型 (DAILY/WEEKLY/MONTHLY/PROJECT)
- `tags`: 标签数组 (PostgreSQL Array)
- `mood`: 心情评分 (1-10)
- `insights`: 洞察总结（可选）
- `userId`: 外键关联用户

## 🔗 关系设计

### 多对多关系

#### Goals ↔ Projects
- 一个目标可以关联多个项目
- 一个项目可以服务多个目标
- 通过中间表 `_GoalProjects` 实现

#### Projects ↔ Reviews  
- 一个项目可以有多个反思记录
- 一个反思可以关联多个项目
- 通过中间表 `_ProjectReviews` 实现

### 一对多关系

#### User → Goals/Projects/Tasks/Reviews
- 每个实体都属于一个用户
- 支持级联删除

#### Project → Tasks
- 任务可以选择性关联到项目
- 项目删除时任务的 projectId 设为 null

## 🚀 Repository 模式

我们采用 Repository 模式来封装数据访问逻辑：

### 基础仓库类
\`\`\`typescript
abstract class BaseRepository<T> {
  abstract create(data: any): Promise<T>
  abstract findById(id: string): Promise<T | null>
  abstract update(id: string, data: any): Promise<T>
  abstract delete(id: string): Promise<void>
  abstract findByUserId(userId: string): Promise<T[]>
}
\`\`\`

### 具体实现
- `ProjectRepository` - 项目数据访问
- `GoalRepository` - 目标数据访问  
- `TaskRepository` - 任务数据访问
- `ReviewRepository` - 反思数据访问

## 📈 性能优化

### 数据库索引
\`\`\`sql
-- 用户相关索引
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

-- 状态查询索引
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_goals_stage ON goals(stage);
CREATE INDEX idx_tasks_completed ON tasks(completed);

-- 时间查询索引
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- 复合索引
CREATE INDEX idx_projects_user_status ON projects(user_id, status);
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);
\`\`\`

### 查询优化
1. **预加载关联数据** - 使用 Prisma include 减少 N+1 查询
2. **分页查询** - 大数据集使用 cursor-based 分页
3. **选择性字段** - 只查询需要的字段
4. **缓存策略** - 对频繁查询的数据进行缓存

## 🔄 数据迁移

### 初始化数据库
\`\`\`bash
# 生成 Prisma Client
npx prisma generate

# 推送 schema 到数据库
npx prisma db push

# 或者使用迁移（生产环境推荐）
npx prisma migrate dev --name init
\`\`\`

### 种子数据
\`\`\`typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 创建测试用户
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User'
    }
  })

  // 创建示例目标
  const goal = await prisma.goal.create({
    data: {
      title: '成为AI专家',
      description: '深入学习人工智能技术',
      stage: 'YEARLY',
      userId: user.id
    }
  })

  // 创建示例项目
  const project = await prisma.project.create({
    data: {
      name: '学习机器学习',
      description: '系统学习机器学习算法和应用',
      userId: user.id,
      goals: {
        connect: { id: goal.id }
      }
    }
  })

  console.log('Seed data created successfully')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
\`\`\`

## 🔒 数据安全

### 行级安全
- 所有查询都基于 userId 进行过滤
- 防止用户访问其他用户的数据

### 数据验证
- Prisma schema 级别的类型验证
- API 层的业务逻辑验证
- 前端表单验证

### 备份策略
- 定期数据库备份
- 关键操作的审计日志
- 数据恢复测试

## 📊 监控和分析

### 查询性能监控
\`\`\`typescript
// 启用 Prisma 查询日志
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
\`\`\`

### 业务指标统计
- 用户活跃度统计
- 项目完成率分析
- 反思频率追踪
- 目标达成情况

这个数据库架构为 LifeAgent 提供了：
1. **可扩展性** - 支持未来功能扩展
2. **性能优化** - 合理的索引和查询策略
3. **数据完整性** - 强类型约束和关系约束
4. **开发效率** - Repository 模式简化数据访问
