# LifeAgent 项目结构

## 概述

LifeAgent 是一个基于 Tool+LLM+RAG 架构的 AI 驱动人生管理系统。本文档描述了项目的完整目录结构和各个模块的功能。

## 根目录结构

```
LifeControl/
├── CLAUDE.md                    # Claude Code 使用指南
├── README.md                    # 项目说明文档
├── next.config.mjs              # Next.js 配置
├── package.json                 # 项目依赖和脚本
├── pnpm-lock.yaml              # 依赖锁定文件
├── tailwind.config.ts          # Tailwind CSS 配置
├── tsconfig.json               # TypeScript 配置
├── postcss.config.mjs          # PostCSS 配置
├── components.json             # shadcn/ui 组件配置
├── .env                        # 环境变量（本地）
├── .env.example               # 环境变量示例
├── .gitignore                 # Git 忽略文件
├── app/                       # Next.js 13+ App Router
├── components/                # React 组件
├── lib/                       # 核心逻辑库
├── docs/                      # 项目文档
├── prisma/                    # 数据库相关
├── public/                    # 静态资源
├── styles/                    # 样式文件
└── hooks/                     # React Hooks
```

## 详细目录结构

### `/app` - Next.js App Router

```
app/
├── globals.css                 # 全局样式
├── layout.tsx                  # 根布局组件
├── page.tsx                    # 首页
├── api/                        # API 路由
│   ├── chat/
│   │   └── route.ts           # 聊天 API（Tool+LLM+RAG）
│   ├── blocks/
│   │   └── route.ts           # 块管理 API
│   └── search/
│       └── route.ts           # 搜索 API
├── goals/
│   └── page.tsx               # 目标页面
├── projects/
│   ├── page.tsx               # 项目列表页面
│   └── [id]/
│       └── page.tsx           # 项目详情页面
└── reviews/
    └── page.tsx               # 回顾页面
```

### `/lib` - 核心逻辑库

```
lib/
├── ai/                        # AI 相关模块
│   ├── chat-handler.ts        # 聊天处理器
│   └── prompts.ts             # AI 提示词
├── db/                        # 数据库模块
│   ├── client.ts              # Prisma 客户端
│   └── seed.ts                # 数据库种子数据
├── generated/                 # 生成的代码
│   └── prisma/               # Prisma 生成的客户端
├── rag/                       # RAG 系统
│   ├── embedding-service.ts   # 嵌入向量服务
│   ├── vector-service.ts      # 向量搜索服务
│   └── search-service.ts      # 智能搜索服务
├── services/                  # 业务服务层
│   ├── block-service.ts       # 块管理服务
│   ├── template-service.ts    # 模板服务
│   └── time-service.ts        # 时间管理服务
├── tools/                     # AI 工具系统
│   ├── block-tools.ts         # 块操作工具
│   ├── template-tools.ts      # 模板工具
│   ├── time-tools.ts          # 时间管理工具
│   └── tool-registry.ts       # 工具注册表
├── types/                     # 类型定义
│   ├── block.ts               # 块类型定义
│   └── template.ts            # 模板类型定义
├── config/
│   └── env.ts                 # 环境变量配置
├── store.ts                   # 状态管理
└── utils.ts                   # 工具函数
```

### `/components` - React 组件

```
components/
├── chat-agent.tsx             # 聊天代理组件
├── navigation.tsx             # 导航组件
├── theme-provider.tsx         # 主题提供者
└── ui/                        # UI 组件（shadcn/ui）
    ├── accordion.tsx
    ├── alert.tsx
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── label.tsx
    ├── select.tsx
    ├── table.tsx
    ├── textarea.tsx
    ├── toast.tsx
    └── ... (其他 UI 组件)
```

### `/docs` - 项目文档

```
docs/
├── project-structure.md          # 项目结构文档（本文档）
├── architecture-overview.md      # 架构概览
├── tool-llm-rag-architecture.md  # Tool+LLM+RAG 架构详解
├── implementation-plan.md        # 实现计划
├── ai-agent-centered-philosophy.md # AI Agent 中心理念
├── blocknote-integration-guide.md  # BlockNote 集成指南
├── blocknote-template-architecture.md # BlockNote 模板架构
└── environment-setup.md          # 环境搭建指南
```

### `/prisma` - 数据库相关

```
prisma/
├── schema.prisma              # 数据库模式定义
├── migrations/                # 数据库迁移文件
│   └── 20250715135152_init/
│       └── migration.sql
└── dev.db                     # SQLite 数据库文件（开发环境）
```

### `/hooks` - React Hooks

```
hooks/
├── use-mobile.tsx             # 移动端检测 Hook
└── use-toast.ts               # Toast 通知 Hook
```

## 核心模块说明

### 1. AI 系统（`/lib/ai/`）

- **chat-handler.ts**: 处理用户消息，集成 Tool+LLM+RAG 系统
- **prompts.ts**: 定义 AI 系统提示词和上下文模板

### 2. RAG 系统（`/lib/rag/`）

- **embedding-service.ts**: 使用 OpenAI 生成文本嵌入向量
- **vector-service.ts**: 管理向量存储和语义搜索
- **search-service.ts**: 提供智能搜索功能

### 3. 业务服务（`/lib/services/`）

- **block-service.ts**: 管理内容块的 CRUD 操作
- **template-service.ts**: 处理模板的创建和实例化
- **time-service.ts**: 解析时间表达式和管理任务调度

### 4. 工具系统（`/lib/tools/`）

- **block-tools.ts**: 提供块管理相关的 AI 工具
- **template-tools.ts**: 提供模板操作相关的 AI 工具
- **time-tools.ts**: 提供时间管理相关的 AI 工具
- **tool-registry.ts**: 统一管理所有 AI 工具

### 5. 数据库（`/lib/db/`）

- **client.ts**: Prisma 数据库客户端配置
- **seed.ts**: 数据库初始化和种子数据

### 6. 类型定义（`/lib/types/`）

- **block.ts**: 定义块的数据结构和验证规则
- **template.ts**: 定义模板的数据结构和验证规则

## 数据流架构

```
用户输入 → ChatHandler → RAG搜索 → LLM处理 → 工具调用 → 业务服务 → 数据库
    ↓
用户界面 ← API响应 ← 工具结果 ← 服务执行 ← 数据持久化
```

## 技术栈

- **前端**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **UI 组件**: shadcn/ui, Radix UI
- **AI 集成**: Vercel AI SDK, OpenAI GPT-4
- **数据库**: SQLite (开发), PostgreSQL (生产)
- **ORM**: Prisma
- **向量搜索**: OpenAI Embeddings + 余弦相似度
- **状态管理**: Zustand
- **包管理**: pnpm

## 开发工作流

1. **开发环境**: 使用 SQLite 进行本地开发
2. **API 设计**: 基于 Tool+LLM+RAG 架构
3. **组件开发**: 使用 shadcn/ui 组件库
4. **AI 集成**: 通过 Vercel AI SDK 与 OpenAI 集成
5. **数据管理**: 使用 Prisma 进行数据库操作

## 部署结构

- **开发环境**: 本地 SQLite + 本地向量搜索
- **生产环境**: PostgreSQL + Pinecone/Weaviate (可选)
- **托管平台**: Vercel (推荐)

## 扩展性考虑

- **水平扩展**: 支持分布式向量数据库
- **模块化**: 各个服务独立，易于维护和扩展
- **插件化**: 工具系统支持动态添加新工具
- **多租户**: 数据库设计支持多用户隔离

这个项目结构体现了现代 AI 应用的最佳实践，将传统的 Web 应用架构与 AI 系统有机结合，实现了高效、可扩展的人生管理平台。