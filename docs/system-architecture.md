# LifeControl 系统架构

## 🎯 核心理念

LifeControl 采用 **AI Agent 中心化** 设计理念，用户通过自然语言对话完成所有人生管理任务，AI 自动处理信息组织和任务执行。

## 🏗️ 整体架构：Tool + LLM + RAG

```
┌─────────────────────────────────────────────────────────────┐
│                 AI Agent 中心化架构                          │
├─────────────────────────────────────────────────────────────┤
│  💬 对话交互层 (Chat Interface)                             │
│  └── 自然语言输入 → AI理解 → 工具调用 → 结果反馈             │
├─────────────────────────────────────────────────────────────┤
│  🤖 AI处理层 (ChatHandler)                                  │
│  ├── 意图理解 (Intent Understanding)                        │
│  ├── 上下文构建 (Context Building)                          │
│  ├── 工具选择 (Tool Selection)                              │
│  └── 响应生成 (Response Generation)                         │
├─────────────────────────────────────────────────────────────┤
│  🔧 工具系统层 (Tool Registry)                              │
│  ├── 块管理工具 (Block Tools)                               │
│  ├── 模板工具 (Template Tools)                              │
│  ├── 时间管理工具 (Time Tools)                              │
│  └── 智能填充工具 (Auto-fill Tools)                         │
├─────────────────────────────────────────────────────────────┤
│  🧠 RAG系统层 (Vector Service)                              │
│  ├── 向量生成 (Embedding Generation)                        │
│  ├── 语义搜索 (Semantic Search)                             │
│  ├── 上下文检索 (Context Retrieval)                         │
│  └── 智能关联 (Intelligent Linking)                         │
├─────────────────────────────────────────────────────────────┤
│  🗃️ 数据存储层 (Database)                                   │
│  ├── 结构化数据 (SQLite + Prisma)                           │
│  ├── 向量索引 (Vector Index)                                │
│  ├── 状态管理 (Zustand Store)                               │
│  └── 持久化 (Persistence)                                   │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 用户交互流程

### 核心原则：对话即操作

```
传统方式：学习界面 → 选择功能 → 填写表单 → 手动分类 → 维护关系
LifeControl：自然语言描述 → AI自动处理 → 完成
```

### 完整工作流程

1. **需求分析** → 用户描述 → AI分析 → 创建模板组合
2. **智能填充** → 用户信息 → AI理解 → 自动填充对应位置
3. **问题解决** → 用户困扰 → AI全息分析 → 提供解决方案
4. **系统简化** → 复杂度监测 → AI建议 → 自动优化

## 🛠️ 技术栈

### 前端技术
- **Next.js 14** - React应用框架 (App Router)
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **shadcn/ui** - 组件库
- **Zustand** - 状态管理

### 后端技术
- **Next.js API Routes** - 服务端处理
- **SQLite + Prisma** - 数据库
- **OpenAI API** - LLM和向量嵌入
- **Vercel AI SDK** - AI工具调用

### AI架构
- **Tool Calling** - 结构化工具调用
- **RAG System** - 向量检索增强生成
- **Semantic Search** - 语义搜索
- **Context Management** - 智能上下文管理

## 📊 核心组件

### 1. ChatHandler (AI处理核心)
```typescript
// 主要功能
- searchRelevantContent(): 搜索相关内容
- getTodaysTasks(): 获取今日任务
- buildContext(): 构建上下文
- generateText(): LLM处理
- processToolResults(): 处理工具结果
```

### 2. Tool Registry (工具系统)
```typescript
// 工具分类
- Block Tools: 块管理工具
- Template Tools: 模板工具
- Time Tools: 时间管理工具
- AutoFill Tools: 智能填充工具
```

### 3. Vector Service (RAG系统)
```typescript
// 核心功能
- generateEmbedding(): 向量生成
- semanticSearch(): 语义搜索
- findSimilarContent(): 相似内容查找
- hybridSearch(): 混合搜索
```

### 4. Block Service (内容管理)
```typescript
// 块类型支持
- text: 文本块
- heading: 标题块
- table: 表格块
- todo: 待办块
- callout: 提醒块
```

## 🎯 设计优势

### 1. 零学习成本
- 用户只需自然语言描述需求
- AI自动理解意图并执行操作
- 无需学习复杂界面和功能

### 2. 全息信息管理
- 所有信息在统一向量空间中
- AI能识别跨领域关联
- 基于完整上下文提供建议

### 3. 智能自适应
- 系统主动识别复杂度问题
- 根据使用模式动态调整
- 自动建议优化方案

### 4. 实时响应
- 流式AI响应提升体验
- 工具调用可视化
- 即时反馈处理结果

## 🚀 扩展性设计

### 工具扩展
- 可轻松添加新的工具类型
- 统一的工具注册机制
- 类型安全的工具定义

### 数据模型扩展
- 支持新的Block类型
- 灵活的元数据系统
- 向量索引自动更新

### AI模型适配
- 支持不同LLM模型切换
- 统一的AI接口层
- 可配置的AI参数

这个架构确保了AI Agent是系统的绝对核心，用户通过对话就能完成所有人生管理任务，同时保持了良好的扩展性和可维护性。