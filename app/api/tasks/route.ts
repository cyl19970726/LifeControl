import { type NextRequest, NextResponse } from "next/server"
import { taskRepository } from "@/lib/db/repositories"

// 获取所有任务
export async function GET(request: NextRequest) {
  try {
    const userId = "temp-user-id" // TODO: 从认证中获取用户ID

    const searchParams = request.nextUrl.searchParams
    const completed = searchParams.get("completed")
    const projectId = searchParams.get("projectId")
    const upcoming = searchParams.get("upcoming") === "true"
    const overdue = searchParams.get("overdue") === "true"

    let tasks

    if (upcoming) {
      tasks = await taskRepository.findUpcomingTasks(userId)
    } else if (overdue) {
      tasks = await taskRepository.findOverdueTasks(userId)
    } else if (projectId) {
      tasks = await taskRepository.findByProjectId(projectId)
    } else if (completed !== null) {
      tasks = await taskRepository.findByStatus(userId, completed === "true")
    } else {
      tasks = await taskRepository.findByUserId(userId)
    }

    return NextResponse.json({
      success: true,
      data: tasks,
    })
  } catch (error) {
    console.error("Failed to fetch tasks:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tasks",
      },
      { status: 500 },
    )
  }
}

// 创建新任务
export async function POST(request: NextRequest) {
  try {
    const userId = "temp-user-id" // 临时用户ID
    const body = await request.json()

    const task = await taskRepository.create({
      title: body.title,
      description: body.description,
      priority: body.priority || "MEDIUM",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      user: { connect: { id: userId } },
      project: body.projectId ? { connect: { id: body.projectId } } : undefined,
    })

    return NextResponse.json(
      {
        success: true,
        data: task,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Failed to create task:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create task",
      },
      { status: 500 },
    )
  }
}
