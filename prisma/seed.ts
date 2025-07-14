import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("开始创建种子数据...")

  // 创建测试用户
  const user = await prisma.user.upsert({
    where: { email: "demo@lifeagent.com" },
    update: {},
    create: {
      email: "demo@lifeagent.com",
      name: "Demo User",
    },
  })

  console.log("✅ 创建用户:", user.name)

  // 创建示例目标
  const lifeGoal = await prisma.goal.create({
    data: {
      title: "成为AI领域专家",
      description: "深入学习人工智能技术，成为该领域的专业人士",
      stage: "LIFE",
      userId: user.id,
    },
  })

  const yearlyGoal = await prisma.goal.create({
    data: {
      title: "掌握机器学习核心技术",
      description: "系统学习机器学习算法和深度学习框架",
      stage: "YEARLY",
      deadline: new Date("2024-12-31"),
      userId: user.id,
    },
  })

  const quarterGoal = await prisma.goal.create({
    data: {
      title: "完成AI项目实战",
      description: "通过实际项目应用所学的AI技术",
      stage: "QUARTER",
      deadline: new Date("2024-03-31"),
      userId: user.id,
    },
  })

  console.log("✅ 创建目标:", [lifeGoal.title, yearlyGoal.title, quarterGoal.title])

  // 创建示例项目
  const aiProject = await prisma.project.create({
    data: {
      name: "LifeAgent 开发",
      description: "构建一个AI驱动的个人生产力管理平台",
      status: "ACTIVE",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-06-30"),
      userId: user.id,
      goals: {
        connect: [{ id: lifeGoal.id }, { id: yearlyGoal.id }, { id: quarterGoal.id }],
      },
    },
  })

  const learningProject = await prisma.project.create({
    data: {
      name: "机器学习系统学习",
      description: "通过在线课程和实践项目学习机器学习",
      status: "ACTIVE",
      startDate: new Date("2024-01-15"),
      userId: user.id,
      goals: {
        connect: [{ id: yearlyGoal.id }],
      },
    },
  })

  console.log("✅ 创建项目:", [aiProject.name, learningProject.name])

  // 创建示例任务
  const tasks = await prisma.task.createMany({
    data: [
      {
        title: "设计系统架构",
        description: "设计LifeAgent的整体系统架构",
        priority: "HIGH",
        completed: true,
        completedAt: new Date("2024-01-10"),
        dueDate: new Date("2024-01-15"),
        userId: user.id,
        projectId: aiProject.id,
      },
      {
        title: "实现ChatAgent核心功能",
        description: "开发ChatAgent的对话处理和工具调用功能",
        priority: "HIGH",
        dueDate: new Date("2024-02-01"),
        userId: user.id,
        projectId: aiProject.id,
      },
      {
        title: "完成数据库设计",
        description: "设计并实现完整的数据库schema",
        priority: "MEDIUM",
        completed: true,
        completedAt: new Date("2024-01-20"),
        dueDate: new Date("2024-01-25"),
        userId: user.id,
        projectId: aiProject.id,
      },
      {
        title: "学习深度学习基础",
        description: "完成Andrew Ng的深度学习课程",
        priority: "MEDIUM",
        dueDate: new Date("2024-02-15"),
        userId: user.id,
        projectId: learningProject.id,
      },
      {
        title: "实践CNN图像识别",
        description: "使用TensorFlow实现一个图像分类项目",
        priority: "MEDIUM",
        dueDate: new Date("2024-03-01"),
        userId: user.id,
        projectId: learningProject.id,
      },
    ],
  })

  console.log("✅ 创建任务:", tasks.count, "个")

  // 创建示例反思记录
  const reviews = await prisma.review.createMany({
    data: [
      {
        content: "今天完成了系统架构设计，感觉对整个项目有了更清晰的认识。采用模块化设计确实能让系统更容易扩展和维护。",
        type: "DAILY",
        tags: ["进展", "架构", "设计"],
        mood: 8,
        userId: user.id,
      },
      {
        content:
          "这周在ChatAgent的实现上遇到了一些挑战，特别是工具调用的错误处理。不过通过查阅文档和实践，最终找到了解决方案。学到了很多关于AI SDK的使用技巧。",
        type: "WEEKLY",
        tags: ["挑战", "学习", "ChatAgent", "问题解决"],
        mood: 7,
        insights: "遇到技术难题时，系统性地查阅文档和进行小规模测试是很有效的解决方法。",
        userId: user.id,
      },
      {
        content:
          "本月在LifeAgent项目上取得了显著进展，完成了核心架构设计和基础功能实现。同时在机器学习学习上也有所收获，对深度学习的理解更加深入了。",
        type: "MONTHLY",
        tags: ["总结", "进展", "学习成果"],
        mood: 8,
        insights: "将理论学习与实际项目结合，能够更好地理解和掌握技术。定期反思有助于发现问题和改进方向。",
        userId: user.id,
      },
    ],
  })

  console.log("✅ 创建反思记录:", reviews.count, "个")

  // 关联反思到项目
  await prisma.review.update({
    where: { id: (await prisma.review.findFirst({ where: { type: "WEEKLY" } }))!.id },
    data: {
      projects: {
        connect: { id: aiProject.id },
      },
    },
  })

  await prisma.review.update({
    where: { id: (await prisma.review.findFirst({ where: { type: "MONTHLY" } }))!.id },
    data: {
      projects: {
        connect: [{ id: aiProject.id }, { id: learningProject.id }],
      },
    },
  })

  console.log("✅ 关联反思记录到项目")

  console.log("🎉 种子数据创建完成！")

  // 输出统计信息
  const stats = {
    users: await prisma.user.count(),
    goals: await prisma.goal.count(),
    projects: await prisma.project.count(),
    tasks: await prisma.task.count(),
    reviews: await prisma.review.count(),
  }

  console.log("📊 数据统计:", stats)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ 种子数据创建失败:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
